import React, { useEffect, useState } from 'react';
import { TrendingUp, Lock, Users, Layers, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { vaultApi, getApiErrorMessage } from '../api';
import { formatUSD, formatAPY, getChainColor } from '../utils/format';
import { Vault, VaultStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [topVaults, setTopVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, vaultsRes] = await Promise.all([
          vaultApi.getStats(),
          vaultApi.getAll({ limit: '6', sort: 'tvl' }),
        ]);
        setStats(statsRes.data.data);
        setTopVaults(vaultsRes.data.data);
      } catch (err: any) {
        setError(getApiErrorMessage(err, 'Failed to load dashboard data'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Value Locked',
      value: formatUSD(stats?.totalTVL || '0'),
      icon: Lock,
      change: '+12.5%',
      color: 'text-primary-400',
    },
    {
      label: 'Average APY',
      value: formatAPY(stats?.avgAPY || 0),
      icon: TrendingUp,
      change: '+2.1%',
      color: 'text-green-400',
    },
    {
      label: 'Active Vaults',
      value: stats?.totalVaults?.toString() || '0',
      icon: Layers,
      change: '+3',
      color: 'text-stellar-cyan',
    },
    {
      label: 'Total Depositors',
      value: stats?.totalDepositors?.toLocaleString() || '0',
      icon: Users,
      change: '+156',
      color: 'text-stellar-purple',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Stellar DeFi <span className="gradient-text">Vault Aggregator</span>
        </h1>
        <p className="text-gray-400">
          Deposit assets into curated Stellar vaults and earn optimized yields on Stellar
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Data Unavailable</p>
            <p className="text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-dark-surface ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400">{stat.change}</span>
              <span className="text-gray-500">30d</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">Chain Distribution</h2>
          {Object.keys(stats?.chainDistribution || {}).length === 0 ? (
            <p className="text-sm text-gray-500">No chain distribution data available</p>
          ) : (
          <div className="space-y-3">
            {Object.entries(stats?.chainDistribution || {}).map(([chain, tvl]) => {
              const totalTVL = Object.values(stats?.chainDistribution || {}).reduce(
                (sum, v) => sum + v, 0
              );
              const percentage = totalTVL > 0 ? (tvl / totalTVL) * 100 : 0;
              return (
                <div key={chain} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getChainColor(chain) }}
                  />
                  <span className="text-sm text-gray-300 w-24">{chain}</span>
                  <div className="flex-1 h-2 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getChainColor(chain),
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono text-gray-400 w-20 text-right">
                    {formatUSD(tvl)}
                  </span>
                </div>
              );
            })}
          </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/vaults" className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface hover:bg-primary-500/10 transition-colors group">
              <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-primary-400 transition-colors">Browse Vaults</p>
                <p className="text-xs text-gray-500">Explore yield opportunities</p>
              </div>
            </a>
            <a href="/analytics" className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface hover:bg-primary-500/10 transition-colors group">
              <div className="p-2 rounded-lg bg-stellar-purple/10 text-stellar-purple">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-stellar-purple transition-colors">Analytics</p>
                <p className="text-xs text-gray-500">Track performance metrics</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Top Vaults by TVL</h2>
          <a href="/vaults" className="text-sm text-primary-400 hover:text-primary-300">
            View All
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-dark-border">
                <th className="pb-3 font-medium">Vault</th>
                <th className="pb-3 font-medium">Chain</th>
                <th className="pb-3 font-medium text-right">TVL</th>
                <th className="pb-3 font-medium text-right">APY</th>
                <th className="pb-3 font-medium text-right">Risk</th>
                <th className="pb-3 font-medium text-right">Depositors</th>
              </tr>
            </thead>
            <tbody>
              {topVaults.map((vault) => (
                <tr key={vault.address} className="table-row">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-400">
                          {vault.assetSymbol?.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{vault.name}</p>
                        <p className="text-xs text-gray-500">{vault.assetSymbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className="chain-badge"
                      style={{
                        backgroundColor: `${getChainColor(vault.chainName)}15`,
                        color: getChainColor(vault.chainName),
                        border: `1px solid ${getChainColor(vault.chainName)}30`,
                      }}
                    >
                      {vault.chainName}
                    </span>
                  </td>
                  <td className="py-4 text-right font-mono">{formatUSD(vault.tvl)}</td>
                  <td className="py-4 text-right">
                    <span className="text-green-400 font-mono">{formatAPY(vault.apy)}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className={`badge ${vault.riskScore <= 30 ? 'badge-green' : vault.riskScore <= 60 ? 'badge-yellow' : 'badge-red'}`}>
                      {vault.riskScore}
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-400">
                    {vault.uniqueDepositors?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
