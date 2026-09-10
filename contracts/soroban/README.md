# LumenVault Soroban Contracts

100% Stellar-native smart contracts for the LumenVault Protocol, written in
Rust for **Soroban** (Stellar's smart-contract platform). No EVM. No Solidity.

## Contracts

| Contract            | Path                                        | Purpose                                              |
|---------------------|---------------------------------------------|------------------------------------------------------|
| `lumenvault-vault`   | `contracts/vault`                           | ERC-4626-style share vault for any Stellar asset     |
| `lumenvault-vault-factory` | `contracts/vault_factory`             | Deploys vaults from registered WASM via `create_contract` |
| `lumenvault-strategy-lending` | `contracts/strategy_lending`        | Lending/earn strategy (Blend-style); accrual model   |
| `lumenvault-risk-manager` | `contracts/risk_manager`             | 0-100 risk registry + blacklist/whitelist + health   |

## Prerequisites

- Rust toolchain: `rustup` + `wasm32-unknown-unknown` target
- `soroban-cli`
- Stellar network access (Futurenet / Testnet / Mainnet)

```bash
# Install Rust + WASM target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install soroban-cli --locked

# Build all contracts
cargo build --release
# Produces target/wasm32-unknown-unknown/release/*.wasm
```

> Pinned to `soroban-sdk = "21.0.0"`. If your CLI is a different major
> version, bump the workspace dependency in `Cargo.toml` accordingly
> (`cargo search soroban-sdk`).

## Workflow

1. **Deploy the vault strategy** first, then the risk manager:
   ```bash
   soroban contract deploy \
     --wasm target/wasm32-unknown-unknown/release/lumenvault_strategy_lending.wasm \
     --source <ADMIN_KEY> --network testnet
   ```
2. **Deploy the vault WASM** and register its hash in the factory:
   ```bash
   soroban contract deploy \
     --wasm target/wasm32-unknown-unknown/release/lumenvault_vault.wasm \
     --source <ADMIN_KEY> --network testnet
   ```
3. **Initialize the factory** with the vault WASM hash.
4. **Create vaults**:
   ```bash
   soroban contract invoke \
     --id <FACTORY_ADDRESS> --source <ADMIN_KEY> --network testnet \
     -- create_and_initialize_vault \
     --caller <ADMIN> --salt <32-BYTE-SALT_HEX> \
     --asset <TOKEN> --curator <CURATOR> \
     --name '\"LumenVault USDC\"' --symbol '\"lvUSDC\"' \
     --management_fee_bps 200 --performance_fee_bps 1000
   ```
5. **Deposit** into a vault:
   ```bash
   soroban contract invoke \
     --id <VAULT_ADDRESS> --source <DEPOSITOR_KEY> --network testnet \
     -- deposit --from <DEPOSITOR> --to <DEPOSITOR> --amount 10000000
   ```
6. **Harvest** accrued yield (curator):
   ```bash
   soroban contract invoke \
     --id <VAULT_ADDRESS> --source <CURATOR_KEY> --network testnet \
     -- harvest_all --caller <CURATOR>
   ```

## Deployment Script

`scripts/deploy-soroban.js` (Node/`stellar-sdk`) automates the end-to-end
deployment of all four contracts. Runnable from the repo root:

```bash
npm run deploy:soroban -- --network testnet --secret <SECRET_KEY>
```

It prints the deployed addresses as environment variables
(`VAULT_FACTORY_ADDRESS`, `VAULT_TEMPLATE_ADDRESS`, `STRATEGY_LENDING_ADDRESS`,
`RISK_MANAGER_ADDRESS`) plus the follow-up `initialize`/`create_and_initialize_vault`
invocations.

## Notes

- The vault `harvest_all` calls the `StrategyInterface` contractclient; the
  strategy lives in the same workspace so enable `--workspace` linking when
  building for tests.
- All amounts use the asset's native precision; share price is reported in
  fixed-point (the backend demo data seeds `1000000`, i.e. `1e6` base units) so
  growth is observable on 4-decimal stablecoins.
- The vault is non-custodial: it holds the underlying token itself and only
  the `curator` may route to strategies; `admin` is the upgradable guardian.