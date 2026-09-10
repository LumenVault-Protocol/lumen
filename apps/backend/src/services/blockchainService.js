const stellar = require('@stellar/stellar-sdk');
const config = require('../config');

const { Horizon, Contract, Address, Keypair } = stellar;

/**
 * Stellar-only blockchain service.
 *
 * Reads from the Soroban RPC (simulateTransaction for read-only calls) against
 * the LumenVault Soroban contracts (contracts/soroban): vault, strategy and
 * risk-manager. The vault interface uses i128 amounts (native asset precision)
 * and a 1e6 fixed-point share price, matching the backend memdb seeds.
 */
class StellarBlockchainService {
  constructor() {
    this.rpc = new stellar.rpc.Server(config.chains.stellar.rpcUrl, {
      allowHttp: true,
    });
    this.horizon = new Horizon.Server(config.chains.stellar.horizonUrl);
    this.networkPassphrase = config.chains.stellar.networkPassphrase;
  }

  /**
   * Wrap a read-only Soroban call in a simulated transaction.
   * Resolves with the raw ScVal result; throws on reversion/RPC errors.
   */
  async _call(address, fn, ...args) {
    if (!this.rpc) {
      throw new Error('Soroban RPC is not configured');
    }
    const op = new Contract(Address.fromString(address).toString()).call(fn, ...args);
    const source = Keypair.random();
    const tx = new stellar.TransactionBuilder(source.publicKey(), {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(0x20)
      .build();

    const simulation = await this.rpc.simulateTransaction(tx);
    if (simulation.error) {
      throw new Error(`Soroban simulation failed for "${fn}": ${simulation.error}`);
    }
    if (!simulation.result || !simulation.result.retval) {
      throw new Error(`Soroban call "${fn}" returned no result`);
    }
    return simulation.result.retval;
  }

  /**
   * Read an i128 ScVal as a decimal string (native precision).
   */
  _readI128(val) {
    if (!val || typeof val.x !== 'function') {
      throw new Error('Unexpected ScVal (expected i128)');
    }
    return val.x().toString();
  }

  /**
   * Read on-chain vault info. Throws if the contract/RPC is unreachable;
   * callers may fall back to seeded localStorage data.
   */
  async getVaultInfo(vaultAddress) {
    const assetScVal = await this._call(vaultAddress, 'asset');
    const totalAssets = await this._call(vaultAddress, 'total_assets');
    const totalShares = await this._call(vaultAddress, 'total_shares');
    const sharePrice = await this._call(vaultAddress, 'share_price');

    return {
      address: vaultAddress,
      chain: 'stellar',
      networkPassphrase: this.networkPassphrase,
      asset: Address.fromScVal(assetScVal).toString(),
      totalAssets: this._readI128(totalAssets),
      totalShares: this._readI128(totalShares),
      sharePrice: this._readI128(sharePrice),
      chainId: config.chains.stellar.chainId,
    };
  }

  /**
   * Read the on-chain share balance and value for a depositor.
   */
  async getUserPosition(vaultAddress, userAddress) {
    const user = Address.fromString(userAddress);
    const shares = await this._call(vaultAddress, 'balance_of', user.toScVal());
    const totalAssets = await this._call(vaultAddress, 'total_assets');
    const totalShares = await this._call(vaultAddress, 'total_shares');
    const sharePrice = await this._call(vaultAddress, 'share_price');

    const sharesNum = BigInt(this._readI128(shares));
    const assetsNum = BigInt(this._readI128(totalAssets));
    const sharesTotal = BigInt(this._readI128(totalShares));
    const currentValue = sharesTotal > 0n ? (sharesNum * assetsNum) / sharesTotal : 0n;

    return {
      shares: this._readI128(shares),
      currentValue: currentValue.toString(),
      sharePrice: this._readI128(sharePrice),
      chain: 'stellar',
    };
  }
}

module.exports = new StellarBlockchainService();