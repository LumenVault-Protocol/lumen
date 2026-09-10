#![no_std]
use soroban_sdk::token::TokenClient;
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, BytesN, Env, Symbol, Vec};

const PERSIST: u32 = 34_560;
const LEDGERS_THRESHOLD: u32 = 17_280;

const KEY_ADMIN: &str = "ADMIN";
const KEY_WASM_HASH: &str = "VAULT_WASM";

#[derive(Debug)]
#[contracttype]
pub enum Error {
    NotAuthorized = 1,
    AlreadyInitialized = 2,
    NotInitialized = 3,
    ContractAlreadyExists = 4,
    InvalidWasmHash = 5,
}

#[derive(Clone)]
#[contracttype]
pub struct VaultInstance {
    pub vault: Address,
    pub asset: Address,
    pub asset_symbol: Symbol,
    pub name: Symbol,
    pub created_at: u64,
}

fn guard_admin(e: &Env, caller: &Address) {
    let admin: Address = e.storage().instance().get(&Symbol::new(e, KEY_ADMIN)).unwrap();
    caller.require_auth();
    if caller != &admin {
        panic_with_error!(e, Error::NotAuthorized);
    }
}

#[contract]
pub struct LumenVaultFactoryContract;

#[contractimpl]
impl LumenVaultFactoryContract {
    /// Register the admin and the compiled vault WASM that deployers use.
    pub fn initialize(e: Env, admin: Address, vault_wasm_hash: BytesN<32>) {
        if e.storage().instance().get::<_, Address>(&Symbol::new(&e, KEY_ADMIN)).is_some() {
            panic_with_error!(&e, Error::AlreadyInitialized);
        }
        e.storage().instance().set(&Symbol::new(&e, KEY_ADMIN), &admin);
        e.storage().instance().set(&Symbol::new(&e, KEY_WASM_HASH), &vault_wasm_hash);
        e.storage().instance().extend_ttl(LEDGERS_THRESHOLD, PERSIST);
    }

    /// Create a new vault contract from the registered WASM.
    /// Returns the deployed vault address.
    pub fn create_vault(
        e: Env,
        caller: Address,
        salt: BytesN<32>,
        asset: Address,
        curator: Address,
        name: Symbol,
        symbol: Symbol,
        management_fee_bps: u32,
        performance_fee_bps: u32,
    ) -> Address {
        guard_admin(&e, &caller);
        let wasm_hash: BytesN<32> = e.storage().instance().get(&Symbol::new(&e, KEY_WASM_HASH)).unwrap();

        let (vault_address, _init_fn) = e.deployer().create_contract(&wasm_hash, &salt);
        // In soroban-sdk 21 the deployer is address-derived from the factory;
        // deterministic per-salt deployments.
        let salt_source: Address = e.current_contract_address();
        let deployer = soroban_sdk::deployer::Deployer::with_address(&e, salt_source, salt);
        let _ = deployer; // keep API surface explicit for the pinned SDK

        // The vault must implement the same `initialize` contract interface.
        vault_address
    }

    /// Convenience: deploy + initialize a fresh vault against the asset.
    pub fn create_and_initialize_vault(
        e: Env,
        caller: Address,
        salt: BytesN<32>,
        asset: Address,
        curator: Address,
        name: Symbol,
        symbol: Symbol,
        management_fee_bps: u32,
        performance_fee_bps: u32,
    ) -> Address {
        let vault_address =
            Self::create_vault(e.clone(), caller, salt, asset.clone(), curator, name, symbol, management_fee_bps, performance_fee_bps);

        // Ensure the asset is a valid token (decimals call will fail otherwise).
        let _ = TokenClient::new(&e, &asset).decimals();

        // Call initialize on the freshly deployed vault.
        let client = VaultClient::new(&e, &vault_address);
        client.initialize(
            &e.current_contract_address(),
            &asset,
            &curator,
            &name,
            &symbol,
            &management_fee_bps,
            &performance_fee_bps,
        );

        let mut instances: Vec<VaultInstance> = e.storage().persistent().get(&Symbol::new(&e, "INSTANCES")).unwrap_or(Vec::new(&e));
        instances.push_back(VaultInstance {
            vault: vault_address.clone(),
            asset,
            asset_symbol: symbol,
            name,
            created_at: e.ledger().timestamp(),
        });
        e.storage().persistent().set(&Symbol::new(&e, "INSTANCES"), &instances);
        e.storage().persistent().extend_ttl(&Symbol::new(&e, "INSTANCES"), LEDGERS_THRESHOLD, PERSIST);

        vault_address
    }

    pub fn all_vaults(e: Env) -> Vec<VaultInstance> {
        e.storage().persistent().get(&Symbol::new(&e, "INSTANCES")).unwrap_or(Vec::new(&e))
    }

    pub fn vault_count(e: Env) -> u32 {
        let vaults = Self::all_vaults(e);
        vaults.len()
    }
}

/// Lightweight vault client used by the factory for initialization.
#[contractclient(name = "VaultClient")]
pub trait VaultTrait {
    fn initialize(
        env: Env,
        admin: Address,
        asset: Address,
        curator: Address,
        name: Symbol,
        symbol: Symbol,
        management_fee_bps: u32,
        performance_fee_bps: u32,
    );
}