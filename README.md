# LumenVault Protocol

> 100% Stellar-native DeFi vault aggregator. Vaults, liquidity strategies, and
> risk management are expressed as **Soroban smart contracts** (Rust). No EVM. No
> Solidity.

LumenVault is a non-custodial yield platform where users deposit Stellar assets
(USDC, USDT, XLM, RLUSD) into curated, auto-compounding vaults. A factory deploys
vaults, a risk manager scores and monitors them, and strategy contracts generate
yield — all on-chain, all governed by the Stellar network.

---

## Repository layout

A standard npm-workspaces monorepo:

```
lumenvault-protocol/
├─ apps/
│  ├─ backend/            # Express API (Stellar + demo-data fallback)
│  └─ frontend/           # React (Vite) web app
├─ contracts/
│  └─ soroban/            # Rust/Soroban contracts (cargo workspace)
├─ .env.example           # Stellar-only configuration template
└─ package.json           # Workspace root + orchestration scripts
```

| Area        | Tech                                                           |
|-------------|----------------------------------------------------------------|
| Contracts   | Rust, `soroban-sdk 21.0.0`                                     |
| Backend     | Node.js, Express, `@stellar/stellar-sdk`, Mongoose, node-cron  |
| Frontend    | React 18, Vite, Tailwind CSS, Zustand, Freighter (`freighter-api`) |

---

## Getting started

### Prerequisites

- **Node.js ≥ 18** and npm ≥ 9
- (Optional) Rust toolchain + `wasm32-unknown-unknown` to build the contracts
- (Optional) Local MongoDB if you want persistence (otherwise the backend runs
  on seeded in-memory demo data)

### Install

```bash
npm install --legacy-peer-deps
```

### Configure

```bash
cp .env.example .env
```

Everything has safe defaults, so the app runs before you add any secrets.

### Run (both servers)

```bash
npm run dev
```

| Service        | URL                    | Port |
|----------------|------------------------|------|
| Web app        | http://localhost:3000  | 3000 |
| Backend API    | http://localhost:3001  | 3001 |
| API (via Vite) | http://localhost:3000/api/v1 | 3000 → 3001 proxy |

Start individually with `npm run dev:backend` or `npm run dev:frontend`.

> **Windows note:** always start servers through the npm scripts above. Do not
> invoke `node_modules/.bin/vite` directly — that is a POSIX shim; npm uses the
> correct `.cmd` wrapper.

---

## Root scripts

| Script            | Description                                        |
|-------------------|----------------------------------------------------|
| `npm run dev`     | Run backend + frontend concurrently                |
| `npm run dev:backend` | Backend only (nodemon)                        |
| `npm run dev:frontend` | Frontend only (Vite dev server)              |
| `npm run build`   | Frontend production build (runs `tsc` first)       |
| `npm run start`   | Backend only (production mode)                     |
| `npm run typecheck` | Frontend TypeScript check (`tsc --noEmit`)      |
| `npm run deploy:soroban` | Deploy the four Soroban contracts (see below)  |

---

## Smart contracts (`contracts/soroban`)

| Crate                          | Purpose                                               |
|--------------------------------|-------------------------------------------------------|
| `contracts/vault`              | ERC-4626-style share vault for any Stellar asset     |
| `contracts/vault_factory`      | Deploys vaults from a registered WASM hash            |
| `contracts/strategy_lending`   | Blend-style lending/earn strategy (accrual)          |
| `contracts/risk_manager`       | 0–100 risk registry with blacklist/whitelist         |

Build all crates:

```bash
cd contracts/soroban
cargo build --release   # → target/wasm32-unknown-unknown/release/*.wasm
```

Deploy (requires a funded account + built WASM):

```bash
# mainnet/testnet/futurenet
npm run deploy:soroban -- --network testnet --secret <SECRET_KEY>
```

JSON output includes the four contract addresses; set them as
`VAULT_FACTORY_ADDRESS`, `VAULT_TEMPLATE_ADDRESS`, `STRATEGY_LENDING_ADDRESS`,
and `RISK_MANAGER_ADDRESS`. Full manual `soroban-cli` workflow lives in
[`contracts/soroban/README.md`](contracts/soroban/README.md).

---

## Backend API

Base URL: `/api/v1` (proxied through the app at `:3000`). Responses use a
consistent envelope: `{ success, data, ... }`.

| Method | Endpoint                                | Description                          |
|--------|-----------------------------------------|--------------------------------------|
| GET    | `/health`                               | Service status + data mode           |
| GET    | `/vaults?sort=&limit=&chain=&...`       | List vaults (filters, pagination)    |
| GET    | `/vaults/stats`                         | Aggregate TVL/APY/depositors stats   |
| GET    | `/vaults/chains`                        | Per-chain breakdown                  |
| GET    | `/vaults/:address`                      | Single vault                         |
| GET    | `/vaults/:address/strategies`           | A vault's strategies                 |
| GET    | `/vaults/:address/history?period=`      | TVL/APY history (24h/7d/…/1y)        |
| GET    | `/vaults/positions/:user`               | Vault positions for a user           |
| GET    | `/yield/yields?chain=&stablecoin=`      | DefiLlama yields                     |
| GET    | `/yield/yields/compare?vaults=a,b`      | Compare pools                        |
| POST   | `/yield/optimize`                       | Suggest allocation by risk tolerance |
| GET    | `/yield/risk/:address`                  | Risk metric placeholders             |
| GET    | `/chain/supported-chains`               | Supported networks (Stellar)         |
| GET    | `/chain/vault-info/:chain/:address`     | On-chain vault introspection         |
| GET    | `/chain/user-position/:chain/:address/:user` | On-chain position query        |

See the source in `apps/backend/src/routes/` for query/body shapes.

---

## Frontend (`apps/frontend`)

| Route         | Page                          |
|---------------|-------------------------------|
| `/`           | Marketing landing             |
| `/dashboard`  | Overview + top vaults         |
| `/vaults`     | Browse/filter/search vaults   |
| `/analytics`  | Protocol + yield analytics    |
| `/faq` `/terms` `/privacy` `/disclaimer` | Static pages |

- **Wallet:** connect a **Freighter** account to deposit; the UI never sees your
  secret key.
- **Theme:** light/dark toggle persisted under the `lumen-theme` key
  (Tailwind `dark.*` tokens are CSS-variable driven).
- **Data flow:** pages call typed clients in `src/api/` backed by shared types
  in `src/types/`; no store duplication.

---

## Configuration (`.env.example`)

| Variable          | Default                                  | Notes                          |
|-------------------|------------------------------------------|--------------------------------|
| `PORT`            | `3001`                                   | Backend port                   |
| `MONGODB_URI`     | `mongodb://localhost:27017/lumenvault`   | Leave unset → in-memory demo   |
| `STELLAR_RPC_URL` | `https://soroban-rpc.stellar.org`        | Testnet/futurenet options in file |
| `STELLAR_NETWORK` | `Public Global Stellar Network ; September 2015` | Network passphrase    |
| `STELLAR_HORIZON_URL` | `https://horizon.stellar.org`        | Horizon endpoint               |
| `SECRET_KEY`      | *(empty)*                                | Funded account for deployment  |
| `VAULT_WASM` … `FACTORY_WASM` | *(empty)*               | Optional wasm path overrides   |

When MongoDB is unreachable the backend logs `- Data source: in-memory demo`
and serves seeded demo vaults/positions so the full UI works offline.

---

## Verification

```bash
npm run typecheck        # frontend TypeScript
npm run build            # production build (typecheck + vite)
curl http://localhost:3001/api/v1/health
curl "http://localhost:3001/api/v1/vaults?sort=tvl&limit=4"
```

---

## Disclaimer

Demo/prototype software. Contracts are not audited. Nothing here is financial
advice; use at your own risk.