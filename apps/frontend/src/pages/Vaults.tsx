import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, Check, Info } from 'lucide-react';
import { vaultApi, getApiErrorMessage } from '../api';
import { formatUSD, formatAPY, formatSharePrice, getChainColor, getRiskLabel, truncateAddress } from '../utils/format';
import { useWalletStore } from '../store/useWalletStore';
import { Vault } from '../types';

const chainOptions = [
  { label: 'Stellar', value: 'stellar' },
];

const sortOptions = [
  { value: 'tvl', label: 'TVL' },
  { value: 'apy', label: 'APY' },
  { value: 'risk', label: 'Risk Score' },
  { value: 'depositors', label: 'Depositors' },
];

export default function Vaults() {
  const { status, publicKey } = useWalletStore();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [sortBy, setSortBy] = useState('tvl');
  const [showFilters, setShowFilters] = useState(false);
  const [maxRisk, setMaxRisk] = useState(100);
  const [stablecoinOnly, setStablecoinOnly] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadVaults() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          sort: sortBy,
          limit: '100',
        };
        if (selectedChain) params.chain = selectedChain;
        if (stablecoinOnly) params.stablecoin = 'true';
        if (maxRisk < 100) params.maxRisk = maxRisk.toString();

        const res = await vaultApi.getAll(params);
        if (!cancelled) setVaults(res.data.data);
      } catch (err: any) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load vaults'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadVaults();
    return () => { cancelled = true; };
  }, [selectedChain, sortBy, stablecoinOnly, maxRisk]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const isConnected = status === 'connected' || status === 'demo';

  function handleDeposit(vault: Vault) {
    if (!isConnected) {
      showToast('Connect a wallet (Freighter) to deposit');
      return;
    }
    const asset = vault.assetSymbol || 'USDC';
    const account = publicKey ? truncateAddress(publicKey) : 'account';
    setToast(`Deposit simulated: 1,000 ${asset} from ${account}`);
    setTimeout(() => setToast(null), 3000);
  }

  const filteredVaults = vaults.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.assetSymbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/20 animate-pulse-glow">
          <Info className="w-4 h-4" />
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Vaults</span>
        </h1>
        <p className="text-gray-400">
          Browse and deposit into curated Stellar yield vaults
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search vaults by name or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="input-field"
          >
            <option value="">All Chains</option>
            {chainOptions.map(chain => (
              <option key={chain.value} value={chain.value}>{chain.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-primary-500' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Max Risk Score: {maxRisk}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={maxRisk}
                onChange={(e) => setMaxRisk(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="stablecoin"
                checked={stablecoinOnly}
                onChange={(e) => setStablecoinOnly(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="stablecoin" className="text-sm text-gray-300">Stablecoin vaults only</label>
            </div>
            <button onClick={() => setShowFilters(false)} className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card mb-6 border-red-500/30">
          <p className="text-red-400 text-sm">Failed to load vaults: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVaults.map((vault) => {
            const risk = getRiskLabel(vault.riskScore);
            return (
              <div
                key={vault.address}
                className="card-hover cursor-pointer"
                onClick={() => setSelectedVault(vault)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-400">
                        {vault.assetSymbol?.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{vault.name}</h3>
                      <p className="text-xs text-gray-500">
                        {vault.assetSymbol} on {vault.chainName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">TVL</p>
                      <p className="font-mono font-semibold">{formatUSD(vault.tvl)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">APY</p>
                      <p className="font-mono font-semibold text-green-400">{formatAPY(vault.apy)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Risk</p>
                      <span className={risk.color}>{risk.label}</span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500">Share Price</p>
                      <p className="font-mono text-sm">{formatSharePrice(vault.sharePrice)}</p>
                    </div>
                    <button
                      className="btn-primary text-sm py-2 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeposit(vault);
                      }}
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredVaults.length === 0 && !error && (
            <div className="text-center py-16 text-gray-500">
              No vaults found matching your criteria
            </div>
          )}
        </div>
      )}

      {selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedVault(null)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <span className="font-bold text-primary-400">{selectedVault.assetSymbol?.slice(0, 3)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedVault.name}</h2>
                  <span
                    className="chain-badge mt-1"
                    style={{
                      backgroundColor: `${getChainColor(selectedVault.chainName)}15`,
                      color: getChainColor(selectedVault.chainName),
                      border: `1px solid ${getChainColor(selectedVault.chainName)}30`,
                    }}
                  >
                    {selectedVault.chainName}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedVault(null)} className="p-2 rounded-lg hover:bg-dark-surface">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">TVL</p>
                <p className="font-mono font-semibold mt-1">{formatUSD(selectedVault.tvl)}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">APY</p>
                <p className="font-mono font-semibold mt-1 text-green-400">{formatAPY(selectedVault.apy)}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">Share Price</p>
                <p className="font-mono font-semibold mt-1">{formatSharePrice(selectedVault.sharePrice)}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">Depositors</p>
                <p className="font-mono font-semibold mt-1">{selectedVault.uniqueDepositors?.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">Management Fee</p>
                <p className="font-mono font-semibold mt-1">{selectedVault.managementFeeBps / 100}%</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">Performance Fee</p>
                <p className="font-mono font-semibold mt-1">{selectedVault.performanceFeeBps / 100}%</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">Max Drawdown</p>
                <p className="font-mono font-semibold mt-1">{selectedVault.maxDrawdown}%</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface">
                <p className="text-xs text-gray-500">Sharpe Ratio</p>
                <p className="font-mono font-semibold mt-1">{selectedVault.sharpeRatio}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  handleDeposit(selectedVault);
                  setSelectedVault(null);
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Deposit {selectedVault.assetSymbol}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}