#![no_std]
use soroban_sdk::token::{TokenClient, TokenInterface};
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Symbol};

const PERSIST: u32 = 34_560;
const LEDGERS_THRESHOLD: u32 = 17_280;

const KEY_OWNER: &str = "OWNER";
const KEY_VAULT: &str = "VAULT";
const KEY_ASSET: &str = "ASSET";
const KEY_APY_BPS: &str = "APY_BPS";
const KEY_CAP: &str = "CAP";
const KEY_ACTIVE: &str = "ACTIVE";
const KEY_LAST_ACCUMULATOR: &str = "ACCUM";

/// StrategyLending - a Stellar-native lending/earn strategy.
///
/// In production this contract would deposit into a Soroban lending market
/// (e.g. Blend / Lemmus). This reference implementation simulates accrual:
/// the strategy holds the asset, and `harvest` computes yield since the last
/// accumulator checkpoint using a configured APY (in basis points) and
/// returns the freshly accrued amount to the vault.
///
/// The APY is snapshotted into an accumulator (`1e7` fixed point) so the
/// value-per-share grows over time without any external market dependency.

#[derive(Debug)]
#[contracttype]
pub enum Error {
    NotAuthorized = 1,
    AlreadyInitialized = 2,
    NotInitialized = 3,
    ZeroAmount = 4,
    CapExceeded = 5,
    Inactive = 6,
    MathOverflow = 7,
}

fn guard_owner(e: &Env, caller: &Address) {
    let owner: Address = e.storage().instance().get(&Symbol::new(e, KEY_OWNER)).unwrap();
    caller.require_auth();
    if caller != &owner {
        panic_with_error!(e, Error::NotAuthorized);
    }
}

#[contract]
pub struct StrategyLendingContract;

#[contractimpl]
impl StrategyLendingContract {
    /// owner: the vault contract allowed to deposit/harvest
    /// asset: underlying token (USDC/XLM/USDT/RLUSD)
    /// apy_bps: configured APY in basis points (e.g. 850 = 8.5%)
    pub fn initialize(e: Env, owner: Address, asset: Address, apy_bps: u32) {
        if e.storage().instance().get::<_, Address>(&Symbol::new(&e, KEY_ASSET)).is_some() {
            panic_with_error!(&e, Error::AlreadyInitialized);
        }
        if apy_bps > 100_00 {
            panic_with_error!(&e, Error::MathOverflow);
        }
        e.storage().instance().set(&Symbol::new(&e, KEY_OWNER), &owner);
        e.storage().instance().set(&Symbol::new(&e, KEY_VAULT), &owner);
        e.storage().instance().set(&Symbol::new(&e, KEY_ASSET), &asset);
        e.storage().instance().set(&Symbol::new(&e, KEY_APY_BPS), &apy_bps);
        e.storage().instance().set(&Symbol::new(&e, KEY_ACTIVE), &true);
        e.storage().instance().set(&Symbol::new(&e, KEY_LAST_ACCUMULATOR), &10_000_000i128);
        e.storage().instance().extend_ttl(LEDGERS_THRESHOLD, PERSIST);
    }

    // ------------------------------------------------------------------
    // Read-only
    // ------------------------------------------------------------------

    pub fn asset(e: Env) -> Address {
        e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap()
    }

    pub fn vault(e: Env) -> Address {
        e.storage().instance().get(&Symbol::new(&e, KEY_VAULT)).unwrap()
    }

    pub fn get_current_apy(e: Env) -> i128 {
        e.storage().instance().get(&Symbol::new(&e, KEY_APY_BPS)).unwrap_or(0) as i128
    }

    pub fn get_tvl(e: Env) -> i128 {
        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        TokenClient::new(&e, &asset).balance(&e.current_contract_address())
    }

    pub fn is_active(e: Env) -> bool {
        e.storage().instance().get(&Symbol::new(&e, KEY_ACTIVE)).unwrap_or(false)
    }

    // ------------------------------------------------------------------
    // Vault-facing
    // ------------------------------------------------------------------

    /// Accept assets from the owning vault and deploy them.
    pub fn deposit(e: Env, caller: Address, from: Address, amount: i128) {
        guard_owner(&e, &caller);
        from.require_auth();
        if amount <= 0 {
            panic_with_error!(&e, Error::ZeroAmount);
        }
        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        TokenClient::new(&e, &asset).transfer(&from, &e.current_contract_address(), &amount);
    }

    /// Return `amount` of the underlying asset to the owner vault.
    pub fn withdraw(e: Env, caller: Address, to: Address, amount: i128) {
        guard_owner(&e, &caller);
        if amount <= 0 {
            panic_with_error!(&e, Error::ZeroAmount);
        }
        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        TokenClient::new(&e, &asset).transfer(&e.current_contract_address(), &to, &amount);
    }

    /// Simulate a yield sweep. Computes yield accrued since the last
    /// checkpoint on the held balance and transfers it to `to` (the vault).
    /// Returns the amount harvested.
    pub fn harvest(e: Env, to: Address) -> i128 {
        to.require_auth();
        let active: bool = e.storage().instance().get(&Symbol::new(&e, KEY_ACTIVE)).unwrap_or(false);
        if !active {
            panic_with_error!(&e, Error::Inactive);
        }

        let asset: Address = e.storage().instance().get(&Symbol::new(&e, KEY_ASSET)).unwrap();
        let token = TokenClient::new(&e, &asset);
        let balance = token.balance(&e.current_contract_address());

        // Continuous compounding over elapsed ledgers (5s blocks).
        let now = e.ledger().timestamp();
        let last: u64 = e.storage().instance().get(&Symbol::new(&e, "_TS")).unwrap_or(now);
        let apy_bps: u32 = e.storage().instance().get(&Symbol::new(&e, KEY_APY_BPS)).unwrap_or(0);
        let seconds = now.saturating_sub(last);
        let mut yield_amount: i128 = 0;
        if balance > 0 && apy_bps > 0 && seconds > 0 {
            // r_seconds = apy * seconds / (365*24*3600)
            let r = motor_apy(balance, apy_bps, seconds);
            yield_amount = r;
        }

        e.storage().instance().set(&Symbol::new(&e, "_TS"), &now);

        if yield_amount > 0 {
            token.transfer(&e.current_contract_address(), &to, &yield_amount);
        }
        e.events().publish((Symbol::new(&e, "harvested"),), yield_amount);
        yield_amount
    }

    pub fn set_apy(e: Env, caller: Address, apy_bps: u32) {
        guard_owner(&e, &caller);
        if apy_bps > 100_00 {
            panic_with_error!(&e, Error::MathOverflow);
        }
        e.storage().instance().set(&Symbol::new(&e, KEY_APY_BPS), &apy_bps);
    }

    pub fn set_active(e: Env, caller: Address, active: bool) {
        guard_owner(&e, &caller);
        e.storage().instance().set(&Symbol::new(&e, KEY_ACTIVE), &active);
    }
}

/// Simple linear APY model (no libm dep): yield = balance * apy_bps * seconds / (1e4 * 31536000)
fn motor_apy(balance: i128, apy_bps: u32, seconds: u64) -> i128 {
    const SECONDS_PER_YEAR: i128 = 31_536_000;
    balance * apy_bps as i128 * seconds as i128 / (10_000 * SECONDS_PER_YEAR)
}