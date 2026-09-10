import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, AlertTriangle } from 'lucide-react';
import { vaultApi, yieldApi, getApiErrorMessage } from '../api';
import { formatUSD, formatAPY, getChainColor } from '../utils/format';
import { VaultStats, YieldPool } from '../types';

export default function Analytics() {
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [yields, setYields] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, yieldsRes] = await Promise.all([
          vaultApi.getStats(),
          yieldApi.getYields({ limit: '20', minTvl: '10000000' }),
        ]);
        setStats(statsRes.data.data);
        setYields(yieldsRes.data.data);
      } catch (err: any) {
        setError(getApiErrorMessage(err, 'Failed to load analytics data'));
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-gray-400">
          Track protocol metrics, yield trends, and cross-chain performance
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="stat-label">Total TVL</p>
              <p className="stat-value">{formatUSD(stats?.totalTVL || '0')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="stat-label">Avg APY</p>
              <p className="stat-value">{formatAPY(stats?.avgAPY || 0)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stellar-cyan/10">
              <BarChart3 className="w-5 h-5 text-stellar-cyan" />
            </div>
            <div>
              <p className="stat-label">Total Vaults</p>
              <p className="stat-value">{stats?.totalVaults || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stellar-purple/10">
              <PieChart className="w-5 h-5 text-stellar-purple" />
            </div>
            <div>
              <p className="stat-label">Depositors</p>
              <p className="stat-value">{stats?.totalDepositors?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Yield Opportunities</h2>
          <div className="space-y-3">
            {yields.slice(0, 10).map((y, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-dark-surface hover:bg-dark-surface/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-400">
                      {y.symbol?.split('-')[0]?.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{y.symbol}</p>
                    <p className="text-xs text-gray-500">{y.project} · {y.chain}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-green-400">{(y.apy || 0).toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">{formatUSD(y.tvlUsd)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Chain Performance</h2>
          {Object.keys(stats?.chainDistribution || {}).length === 0 ? (
            <p className="text-sm text-gray-500">No chain performance data available</p>
          ) : (
          <div className="space-y-4">
            {Object.entries(stats?.chainDistribution || {}).map(([chain, rawTvl]) => {
              const tvl = Number(rawTvl) || 0;
              const totalTVL = Object.values(stats?.chainDistribution || {}).reduce(
                (sum: number, v: any) => sum + (Number(v) || 0), 0
              );
              const percentage = totalTVL > 0 ? (tvl / totalTVL) * 100 : 0;
              return (
                <div key={chain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getChainColor(chain) }} />
                      {chain}
                    </span>
                    <span className="font-mono">{formatUSD(tvl)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getChainColor(chain),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Top Yield Sources by Protocol</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Aave', 'Compound', 'Morpho', 'Yearn', 'Convex', 'Uniswap', 'Pendle', 'Spark'].map(protocol => {
            const protocolYields = yields.filter(y => y.project?.toLowerCase().includes(protocol.toLowerCase()));
            const avgAPY = protocolYields.length > 0
              ? protocolYields.reduce((sum, y) => sum + (y.apy || 0), 0) / protocolYields.length
              : 0;
            const totalTVL = protocolYields.reduce((sum, y) => sum + (y.tvlUsd || 0), 0);

            return (
              <div key={protocol} className="p-4 rounded-lg bg-dark-surface border border-dark-border hover:border-primary-500/30 transition-all">
                <h3 className="font-semibold mb-2">{protocol}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg APY</span>
                    <span className="font-mono text-green-400">{avgAPY.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">TVL</span>
                    <span className="font-mono">{formatUSD(totalTVL)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pools</span>
                    <span>{protocolYields.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
