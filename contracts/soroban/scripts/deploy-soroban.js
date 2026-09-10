#!/usr/bin/env node
/**
 * Deploy LumenVault Soroban contracts to a Stellar network.
 *
 * Prerequisites:
 *   cargo build --release   (produces target/wasm32-unknown-unknown/release/*.wasm)
 *   A funded account for the network you target (testnet/futurenet/mainnet).
 *
 * Usage:
 *   node scripts/deploy-soroban.js --network testnet --secret <SECRET_KEY>
 *
 * Config via env:
 *   SOROBAN_RPC_URL, SOROBAN_HORIZON_URL, SECRET_KEY
 *   VAULT_WASM / STRATEGY_WASM / RISK_WASM / FACTORY_WASM override wasm paths.
 */
const fs = require('fs');
const path = require('path');
const stellar = require('@stellar/stellar-sdk');
const { Keypair } = stellar;

const WASM_DIR = path.resolve(__dirname, '..', 'target', 'wasm32-unknown-unknown', 'release');

function loadArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return process.env[name.toUpperCase()] || fallback;
}

function readWasm(name) {
  const file = process.env[name.toUpperCase()] || path.join(WASM_DIR, name);
  if (!fs.existsSync(file)) {
    console.error(`Build ${name} first: cargo build --release  (expected ${file})`);
    process.exit(1);
  }
  return fs.readFileSync(file);
}

async function main() {
  const network = loadArg('network', 'mainnet');
  const networks = {
    mainnet: { passphrase: stellar.Networks.PUBLIC, rpc: 'https://soroban-rpc.stellar.org', horizon: 'https://horizon.stellar.org' },
    testnet: { passphrase: stellar.Networks.TESTNET, rpc: 'https://soroban-testnet.stellar.org', horizon: 'https://horizon-testnet.stellar.org' },
    futurenet: { passphrase: stellar.Networks.FUTURENET, rpc: 'https://rpc-futurenet.stellar.org', horizon: 'https://horizon-futurenet.stellar.org' },
  };
  const config = networks[network] || networks.mainnet;

  const rpcUrl = loadArg('rpc-url', config.rpc);
  const horizonUrl = loadArg('horizon-url', config.horizon);
  const secret = loadArg('secret', null);

  if (!secret) {
    console.error('Provide --secret <SECRET_KEY> (funded account) to deploy.');
    process.exit(1);
  }

  const source = Keypair.fromSecret(secret);
  const rpc = new stellar.rpc.Server(rpcUrl, { allowHttp: true });
  const account = await rpc.getAccount(source.publicKey());

  async function deployContract(wasmBytes, label) {
    const tx = new stellar.TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: config.passphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(stellar.Operation.createContract({
        source: source.publicKey(),
        wasm: wasmBytes,
      }))
      .build();
    tx.sign(source);

    const send = await rpc.sendTransaction(tx);
    if (send.status !== 'PENDING' && send.status !== 'DUPLICATE') {
      console.error(`${label}: send failed (${send.status})`, send.errorResult);
      process.exit(1);
    }

    for (let i = 0; i < 30; i++) {
      const status = await rpc.getTransaction(send.hash);
      if (status.status === 'SUCCESS') {
        const id = stellar.Address.fromScVal(status.returnValue).toString();
        console.log(`${label} deployed: ${id}`);
        return id;
      }
      if (status.status === 'FAILED') {
        console.error(`${label}: deployment FAILED`);
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    console.error(`${label}: timeout awaiting confirmation`);
    process.exit(1);
  }

  const factoryId = await deployContract(readWasm('lumenvault_vault_factory.wasm'), 'vault_factory');
  const vaultId = await deployContract(readWasm('lumenvault_vault.wasm'), 'vault_template');
  const strategyId = await deployContract(readWasm('lumenvault_strategy_lending.wasm'), 'strategy_lending');
  const riskId = await deployContract(readWasm('lumenvault_risk_manager.wasm'), 'risk_manager');

  console.log('\nCONTRACT ADDRESSES (set these in backend/.env)');
  console.log(`  VAULT_FACTORY_ADDRESS=${factoryId}`);
  console.log(`  VAULT_TEMPLATE_ADDRESS=${vaultId}`);
  console.log(`  STRATEGY_LENDING_ADDRESS=${strategyId}`);
  console.log(`  RISK_MANAGER_ADDRESS=${riskId}`);

  console.log('Next steps:');
  console.log('  1. invoke vault_factory.initialize with the vault template wasm hash');
  console.log('  2. invoke factory.create_and_initialize_vault per asset');
  console.log('  3. initialize strategy + risk manager, then vault.add_strategy/assess');
  horizonUrl; // horizon configured for future account funding utilities
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});