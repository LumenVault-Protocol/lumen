#![no_std]
use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Env, Map, Symbol};

const PERSIST: u32 = 34_560;
const LEDGERS_THRESHOLD: u32 = 17_280;

const KEY_ADMIN: &str = "ADMIN";
const KEY_BLACKLIST: &str = "BL";
const KEY_SCORES: &str = "SCORES";

const MAX_RISK_SCORE: u32 = 100;

#[derive(Debug)]
#[contracttype]
pub enum Error {
    NotAuthorized = 1,
    AlreadyInitialized = 2,
    OutOfRange = 3,
}

/// RiskManager - on-chain risk registry for the LumenVault protocol.
///
/// Stores a 0-100 risk score per vault address and maintains a blacklist /
/// whitelist of counterparties (vaults, strategies, users).
#[contract]
pub struct RiskManagerContract;

fn guard_admin(e: &Env, caller: &Address) {
    let admin: Address = e.storage().instance().get(&Symbol::new(e, KEY_ADMIN)).unwrap();
    caller.require_auth();
    if caller != &admin {
        panic_with_error!(e, Error::NotAuthorized);
    }
}

#[contractimpl]
impl RiskManagerContract {
    pub fn initialize(e: Env, admin: Address) {
        if e.storage().instance().get::<_, Address>(&Symbol::new(&e, KEY_ADMIN)).is_some() {
            panic_with_error!(&e, Error::AlreadyInitialized);
        }
        e.storage().instance().set(&Symbol::new(&e, KEY_ADMIN), &admin);
        e.storage().instance().extend_ttl(LEDGERS_THRESHOLD, PERSIST);
    }

    /// Record/overwrite the risk score for a vault.
    pub fn assess(e: Env, caller: Address, target: Address, score: u32) {
        guard_admin(&e, &caller);
        if score > MAX_RISK_SCORE {
            panic_with_error!(&e, Error::OutOfRange);
        }
        let mut scores: Map<Address, u32> = e.storage().persistent().get(&Symbol::new(&e, KEY_SCORES)).unwrap_or(Map::new(&e));
        scores.set(target, score);
        e.storage().persistent().set(&Symbol::new(&e, KEY_SCORES), &scores);
        e.storage().persistent().extend_ttl(&Symbol::new(&e, KEY_SCORES), LEDGERS_THRESHOLD, PERSIST);
    }

    pub fn risk_score(e: Env, target: Address) -> u32 {
        let scores: Map<Address, u32> = e.storage().persistent().get(&Symbol::new(&e, KEY_SCORES)).unwrap_or(Map::new(&e));
        scores.get(target).unwrap_or(50)
    }

    pub fn assess_batch(e: Env, caller: Address, targets: soroban_sdk::Vec<Address>, scores: soroban_sdk::Vec<u32>) {
        guard_admin(&e, &caller);
        if targets.len() != scores.len() {
            panic_with_error!(&e, Error::OutOfRange);
        }
        for i in 0..targets.len() {
            let score = scores.get_unchecked(i);
            if score > MAX_RISK_SCORE {
                panic_with_error!(&e, Error::OutOfRange);
            }
            Self::assess(e.clone(), caller.clone(), targets.get_unchecked(i), score);
        }
    }

    // ------------------------------------------------------------------
    // Blacklist / whitelist
    // ------------------------------------------------------------------

    pub fn blacklist(e: Env, caller: Address, target: Address) {
        guard_admin(&e, &caller);
        let mut list: Map<Address, bool> = e.storage().persistent().get(&Symbol::new(&e, KEY_BLACKLIST)).unwrap_or(Map::new(&e));
        list.set(target, false); // present = blocked
        e.storage().persistent().set(&Symbol::new(&e, KEY_BLACKLIST), &list);
        e.storage().persistent().extend_ttl(&Symbol::new(&e, KEY_BLACKLIST), LEDGERS_THRESHOLD, PERSIST);
    }

    pub fn whitelist(e: Env, caller: Address, target: Address) {
        guard_admin(&e, &caller);
        let mut list: Map<Address, bool> = e.storage().persistent().get(&Symbol::new(&e, KEY_BLACKLIST)).unwrap_or(Map::new(&e));
        list.remove(target);
        e.storage().persistent().set(&Symbol::new(&e, KEY_BLACKLIST), &list);
    }

    pub fn is_blocked(e: Env, target: Address) -> bool {
        let list: Map<Address, bool> = e.storage().persistent().get(&Symbol::new(&e, KEY_BLACKLIST)).unwrap_or(Map::new(&e));
        list.contains_key(target)
    }

    // ------------------------------------------------------------------
    // Health
    // ------------------------------------------------------------------

    /// Aggregate health check over a set of vaults.
    /// Returns `(unhealthy_vaults, total_severity)`.
    pub fn health_check(e: Env, vaults: soroban_sdk::Vec<Address>) -> (u32, u32) {
        let scores: Map<Address, u32> = e.storage().persistent().get(&Symbol::new(&e, KEY_SCORES)).unwrap_or(Map::new(&e));
        let list: Map<Address, bool> = e.storage().persistent().get(&Symbol::new(&e, KEY_BLACKLIST)).unwrap_or(Map::new(&e));

        let mut unhealthy: u32 = 0;
        let mut severity: u32 = 0;
        for v in vaults.iter() {
            if list.contains_key(v.clone()) {
                unhealthy += 1;
                severity += 100;
                continue;
            }
            let score = scores.get(v).unwrap_or(50);
            severity += score;
            if score >= 80 {
                unhealthy += 1;
            }
        }
        (unhealthy, severity)
    }
}