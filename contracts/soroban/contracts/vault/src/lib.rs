#![no_std]
use soroban_sdk::token::{TokenClient, TokenInterface};
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Symbol};

/// LumenVault - Stellar yield vault
///
/// An ERC-4626-style (YieldBear-style) share-based vault for the Stellar
/// network. Users deposit an underlying asset (USDC / XLM / USDT / RLUSD)
/// and receive vault shares that accrue yield as strategies profit earns.
///
/// Units: all amounts are in the native precision of the underlying asset.
/// Share price is tracked in 1e7 fixed-point (7 decimals) so that precision
/// growth is observable.

const PERSIST: u32 = 34_560; // ~= 40 days in ledgers at ~5s/ledger
const LEDGERS_THRESHOLD: u32 = 17_280; // ~= 20 days

const KEY_ADMIN: &str = "ADMIN";
const KEY_ASSET: &str = "ASSET";
const KEY_CURATOR: &str = "CURATOR";
const KEY_TOTAL_SHARES: &str = "TOT_SHARES";
const KEY_MGMT_FEE_BPS: &str = "MGMT_FEE";
const KEY_PERF_FEE_BPS: &str = "PERF_FEE";
const KEY_PAUSED: &str = "PAUSED";
const KEY_STRATEGIES: &str = "STRATS";
const KEY_NAME: &str = "NAME";
const KEY_SYMBOL: &str = "SYMBOL";

const SHARE_PRECISION: i128 = 10_000_000;

#[contract]
pub struct LumenVaultContract;

#[derive(Debug)]
#[contracttype]
pub enum Error {
    NotAuthorized = 1,
    AlreadyInitialized = 2,
    NotInitialized = 3,
    VaultPaused = 4,
    ZeroAmount = 5,
    InvalidAsset = 6,
    StrategyNotAllowed = 7,
    NoStrategies = 8,
    MathOverflow = 9,
}

#[derive(Clone)]
#[contracttype]
pub struct StrategyInfo {
    pub strategy: Address,
    pub allocation_bps: u32,
    pub active: bool,
}

fn check_initialized(e: &Env) {
    if e.storage().instance().get::<_, Address>(&Symbol::new(e, KEY_ASSET)).is_none() {
        panic_with_error!(e, Error::NotInitialized);
    }
}

fn check_not_initialized(e: &Env) {
    if e.storage().instance().get::<_, Address>(&Symbol::new(e, KEY_ASSET)).is_some() {
        panic_with_error!(e, Error::AlreadyInitialized);
    }
}

fn check_admin(e: &Env, caller: &Address) {
    let admin: Address = e.storage().instance().get(&Symbol::new(e, KEY_ADMIN)).unwrap();
    caller.require_auth();
    if caller != &admin {
        panic_with_error!(e, Error::NotAuthorized);
    }
}

fn check_not_paused(e: &Env) {
    let paused = e.storage().instance().get::<_, ()>(&Symbol::new(e, KEY_PAUSED)).is_some();
    if paused {
        panic_with_error!(e, Error::VaultPaused);
    }
}

#[contractimpl]
impl LumenVaultContract {
    pub fn initialize(
        e: Env,
        admin: Address,
        asset: Address,
        curator: Address,
        name: Symbol,
        symbol: Symbol,
        management_fee_bps: u32,
        performance_fee_bps: u32,
    ) {
        check_not_initialized(&e);

        // safety: reject fee > 50%
        if management_fee_bps > 5000 || performance_fee_bps > 5000 {
            panic_with_error!(&e, Error::InvalidAsset);
        }

        e.storage().instance().set(&Symbol::new(&e, KEY_ADMIN), &admin);
        e.storage().instance().set(&Symbol::new(&e, KEY_ASSET), &asset);
        e.storage().instance().set(&Symbol::new(&e, KEY_CURATOR), &curator);
        e.storage().instance().set(&Symbol::new(&e, KEY_NAME), &name);
        e.storage().instance().set(&Symbol::new(&e, KEY_SYMBOL), &symbol);
        e.storage().instance().set(&Symbol::new(&e, KEY_TOTAL_SHARES), &0i128);
        e.storage().instance().set(&Symbol::new(&e, KEY_MGMT_FEE_BPS), &management_fee_bps);
        e.storage().instance().set(&Symbol::new(&e, KEY_PERF_FEE_BPS), &performance_fee_bps);

        e.storage().instance().extend_ttl(LEDGERS_THRESHOLD, PERSIST);
    }

    // ------------------------------------------------------------------
    // Read-only
    // ------------------------------------------------------------------

    pub fn asset(e: Env) -> Address {
        check_initialized(&e);
        e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap()
    }

    pub fn name(e: Env) -> Symbol {
        check_initialized(&e);
        e.storage().instance().get(&Symbol::new(&e, KEY_NAME)).unwrap()
    }

    pub fn symbol(e: Env) -> Symbol {
        check_initialized(&e);
        e.storage().instance().get(&Symbol::new(&e, KEY_SYMBOL)).unwrap()
    }

    pub fn total_shares(e: Env) -> i128 {
        check_initialized(&e);
        e.storage().instance().get(&Symbol::new(&e, KEY_TOTAL_SHARES)).unwrap()
    }

    /// Balance of the underlying asset controlled by the vault.
    pub fn total_assets(e: Env) -> i128 {
        check_initialized(&e);
        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        let client = TokenClient::new(&e, &asset);
        client.balance(&e.current_contract_address())
    }

    /// Share price in 1e7 fixed point: total_assets / total_shares * 1e7.
    /// When no shares exist yet, the vault is 1:1.
    pub fn share_price(e: Env) -> i128 {
        check_initialized(&e);
        let total_shares = Self::total_shares(e.clone());
        let total_assets = Self::total_assets(e);
        if total_shares <= 0 {
            return SHARE_PRECISION;
        }
        total_assets.checked_mul(SHARE_PRECISION).unwrap_or(0) / total_shares
    }

    pub fn balance_of(e: Env, account: Address) -> i128 {
        check_initialized(&e);
        e.storage()
            .persistent()
            .get::<_, i128>(&Symbol::new(&e, "BAL").combine(&account))
            .unwrap_or(0)
    }

    /// Estimated shares received for a given asset deposit.
    pub fn preview_deposit(e: Env, amount: i128) -> i128 {
        check_initialized(&e);
        let price = Self::share_price(e.clone());
        amount.checked_mul(SHARE_PRECISION).unwrap_or(0) / price
    }

    /// Estimated assets received for a given share withdraw.
    pub fn preview_withdraw(e: Env, shares: i128) -> i128 {
        check_initialized(&e);
        let price = Self::share_price(e.clone());
        shares.checked_mul(price).unwrap_or(0) / SHARE_PRECISION
    }

    pub fn strategies(e: Env) -> soroban_sdk::Vec<StrategyInfo> {
        check_initialized(&e);
        e.storage()
            .persistent()
            .get(&Symbol::new(&e, KEY_STRATEGIES))
            .unwrap_or(soroban_sdk::Vec::new(&e))
    }

    // ------------------------------------------------------------------
    // Deposit / Withdraw
    // ------------------------------------------------------------------

    /// Deposit `amount` of the underlying asset, mint fresh shares to `to`.
    pub fn deposit(e: Env, from: Address, to: Address, amount: i128) -> i128 {
        check_initialized(&e);
        check_not_paused(&e);
        from.require_auth();

        if amount <= 0 {
            panic_with_error!(&e, Error::ZeroAmount);
        }

        let total_assets = Self::total_assets(e.clone());
        let total_shares = Self::total_shares(e.clone());
        let shares = if total_shares == 0 {
            amount
        } else {
            amount.checked_mul(total_shares).unwrap_or(0) / total_assets
        };
        if shares <= 0 {
            panic_with_error!(&e, Error::ZeroAmount);
        }

        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        let client = TokenClient::new(&e, &asset);
        client.transfer(&from, &e.current_contract_address(), &amount);

        e.storage()
            .persistent()
            .set(&Symbol::new(&e, "BAL").combine(&to), &(Self::balance_of(e.clone(), to.clone()) + shares));
        e.storage()
            .instance()
            .set(&Symbol::new(&e, KEY_TOTAL_SHARES), &(total_shares + shares));
        e.storage().persistent().extend_ttl(&Symbol::new(&e, "BAL").combine(&to), LEDGERS_THRESHOLD, PERSIST);

        e.events().publish(
            (Symbol::new(&e, "deposit"), from, to),
            (amount, shares),
        );
        shares
    }

    /// Burn `shares` and send the corresponding assets to `to`.
    pub fn withdraw(e: Env, from: Address, to: Address, shares: i128) -> i128 {
        check_initialized(&e);
        check_not_paused(&e);
        from.require_auth();

        if shares <= 0 {
            panic_with_error!(&e, Error::ZeroAmount);
        }

        let previous_shares = Self::balance_of(e.clone(), from.clone());
        if shares > previous_shares {
            panic_with_error!(&e, Error::StrategyNotAllowed); // insufficient balance
        }

        let total_assets = Self::total_assets(e.clone());
        let total_shares = Self::total_shares(e.clone());
        let amount = shares.checked_mul(total_assets).unwrap_or(0) / total_shares;

        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        let client = TokenClient::new(&e, &asset);
        client.transfer(&e.current_contract_address(), &to, &amount);

        let new_shares = previous_shares - shares;
        if new_shares == 0 {
            e.storage().persistent().remove(&Symbol::new(&e, "BAL").combine(&from));
        } else {
            e.storage()
                .persistent()
                .set(&Symbol::new(&e, "BAL").combine(&from), &new_shares);
        }
        e.storage()
            .instance()
            .set(&Symbol::new(&e, KEY_TOTAL_SHARES), &(total_shares - shares));

        e.events().publish(
            (Symbol::new(&e, "withdraw"), from, to),
            (shares, amount),
        );
        amount
    }

    // ------------------------------------------------------------------
    // Strategy management (curator / admin)
    // ------------------------------------------------------------------

    pub fn add_strategy(e: Env, caller: Address, strategy: Address, allocation_bps: u32) {
        check_initialized(&e);
        caller.require_auth();
        let curator: Address = e.storage().instance().get(&Symbol::new(&e, KEY_CURATOR)).unwrap();
        if caller != curator {
            panic_with_error!(&e, Error::NotAuthorized);
        }

        let mut strategies = Self::strategies(e.clone());
        let existing = strategies.clone().iter().find(|s| s.strategy == strategy);
        if let Some(mut info) = existing {
            info.allocation_bps = allocation_bps;
            info.active = true;
            strategies = strategies.iter().map(|s| {
                if s.strategy == strategy { info.clone() } else { s.clone() }
            }).collect();
        } else {
            strategies.push_back(StrategyInfo { strategy, allocation_bps, active: true });
        }
        e.storage()
            .persistent()
            .set(&Symbol::new(&e, KEY_STRATEGIES), &strategies);
        e.storage().persistent().extend_ttl(&Symbol::new(&e, KEY_STRATEGIES), LEDGERS_THRESHOLD, PERSIST);
    }

    pub fn remove_strategy(e: Env, caller: Address, strategy: Address) {
        check_initialized(&e);
        caller.require_auth();
        let curator: Address = e.storage().instance().get(&Symbol::new(&e, KEY_CURATOR)).unwrap();
        if caller != curator {
            panic_with_error!(&e, Error::NotAuthorized);
        }

        let strategies = Self::strategies(e.clone())
            .iter()
            .filter(|s| s.strategy != strategy)
            .collect::<soroban_sdk::Vec<StrategyInfo>>();
        e.storage()
            .persistent()
            .set(&Symbol::new(&e, KEY_STRATEGIES), &strategies);
    }

    // ------------------------------------------------------------------
    // Fee / pause admin controls
    // ------------------------------------------------------------------

    pub fn set_fees(e: Env, caller: Address, management_fee_bps: u32, performance_fee_bps: u32) {
        check_initialized(&e);
        check_admin(&e, &caller);
        if management_fee_bps > 5000 || performance_fee_bps > 5000 {
            panic_with_error!(&e, Error::InvalidAsset);
        }
        e.storage().instance().set(&Symbol::new(&e, KEY_MGMT_FEE_BPS), &management_fee_bps);
        e.storage().instance().set(&Symbol::new(&e, KEY_PERF_FEE_BPS), &performance_fee_bps);
    }

    pub fn pause(e: Env, caller: Address) {
        check_initialized(&e);
        check_admin(&e, &caller);
        e.storage().instance().set(&Symbol::new(&e, KEY_PAUSED), &());
    }

    pub fn unpause(e: Env, caller: Address) {
        check_initialized(&e);
        check_admin(&e, &caller);
        e.storage().instance().remove(&Symbol::new(&e, KEY_PAUSED));
    }

    // ------------------------------------------------------------------
    // Harvest
    // ------------------------------------------------------------------

    /// Pull accrued yield from all active strategies back into the vault.
    /// In this reference implementation the strategy contracts transfer
    /// their earned principal + yield directly.
    pub fn harvest_all(e: Env, caller: Address) {
        check_initialized(&e);
        caller.require_auth();
        let curator: Address = e.storage().instance().get(&Symbol::new(&e, KEY_CURATOR)).unwrap();
        if caller != curator {
            panic_with_error!(&e, Error::NotAuthorized);
        }

        let strategies = Self::strategies(e.clone());
        let mut harvested: i128 = 0;

        for info in strategies {
            if !info.active {
                continue;
            }
            // Invoke harvest on the strategy; strategies are required to
            // implement `harvest(caller, vault)` and transfer yield back.
            let client = StrategyClient::new(&e, &info.strategy);
            let amount = client.harvest(&e.current_contract_address());
            harvested += amount;
        }

        if harvested > 0 {
            e.events().publish(
                (Symbol::new(&e, "harvested"),),
                harvested,
            );
        }
    }

    pub fn migrate(e: Env, caller: Address, new_code_hash: soroban_sdk::BytesN<32>) {
        check_initialized(&e);
        check_admin(&e, &caller);
        e.deployer().update_current_contract_wasm(new_code_hash);
    }
}

/// Generated client for the strategy interface (stored locally to avoid a
/// circular crate dependency in this reference monorepo layout).
#[contractclient(name = "StrategyClient")]
pub trait StrategyInterface {
    fn harvest(env: Env, vault: Address) -> i128;
    fn get_current_apy(env: Env) -> i128;
    fn get_tvl(env: Env) -> i128;
}