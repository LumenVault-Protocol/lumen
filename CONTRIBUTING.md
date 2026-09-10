# Contributing to LumenVault

Thanks for your interest in contributing. LumenVault is a Stellar-native DeFi
vault aggregator built on Soroban — Rust contracts, a Node/Express backend, and
a React (Vite) frontend.

## Ways to contribute

- Report bugs that don't already have an open issue
- Propose features or improvements
- Improve documentation, tests, or the UI
- Help with Soroban contracts, yield strategies, or the API

Please follow the issue templates when opening an issue, and the pull request
template when submitting a PR.

## Security

Do **not** open a public issue for security vulnerabilities. Use GitHub's
**Security → Report a vulnerability** for the repository so it can be handled
privately.

## Development setup

Prerequisites: Node.js ≥ 18, npm ≥ 9. Rust toolchain is only needed for
contract work (see `contracts/soroban/README.md`).

```bash
npm install --legacy-peer-deps
cp .env.example .env   # optional; defaults work
npm run dev            # backend :3001 + frontend :3000
```

Repository layout (see README for details):

```
apps/backend/     Express API (src/app.js wiring, src/index.js boot)
apps/frontend/    React + Vite + Tailwind (src/api, src/types, src/pages)
contracts/soroban/  Rust/Soroban contracts (cargo workspace)
```

## Before you submit a PR

1. Run the checks that CI runs:
   ```bash
   npm run typecheck
   npm run build
   ```
   The backend has no linter or test runner configured, so make sure any backend
   files pass `node --check` (CI does this automatically).
2. Keep changes focused. One concern per PR.
3. Follow the existing code style and patterns (shared types in
   `apps/frontend/src/types/`, API client in `apps/frontend/src/api/`,
   backend routes thin — logic lives in `services/`).
4. Do not commit secrets, `.env` files, build output, or logs.

## Git workflow

1. Fork the repo (or work on a branch if you have write access).
2. Branch from `main`: `git checkout -b feat/my-change`.
3. Commit with a concise, conventional message:
   ```
   feat: add RLUSD treasury vault
   fix: correct share-price scaling in vault
   docs: expand API reference
   refactor: move request validation into middleware
   ```
4. Push and open a pull request against `main`. Fill in the PR template.
5. Address review comments; keep the PR up to date with `main`.

## Code of conduct

Be respectful and constructive. Harassment, trolling, or abusive behavior will
result in removal from the project.