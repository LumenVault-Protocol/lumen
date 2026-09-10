const axios = require('axios');
const config = require('../config');

class YieldService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000;
  }

  async getYieldsFromDefiLlama() {
    const cacheKey = 'defillama_yields';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await axios.get(`${config.defillama.baseUrl}/pools`);
      const yields = response.data.data.map(pool => ({
        pool: pool.pool,
        chain: pool.chain,
        project: pool.project,
        symbol: pool.symbol,
        tvlUsd: pool.tvlUsd,
        apy: pool.apy,
        apyBase: pool.apyBase,
        apyReward: pool.apyReward,
        apyPct1D: pool.apyPct1D,
        apyPct7D: pool.apyPct7D,
        apyPct30D: pool.apyPct30D,
        stablecoin: pool.stablecoin,
        ilRisk: pool.ilRisk,
        exposure: pool.exposure,
        predictions: pool.predictions,
      }));

      this.cache.set(cacheKey, { data: yields, timestamp: Date.now() });
      return yields;
    } catch (error) {
      console.error('Failed to fetch yields from DefiLlama:', error.message);
      return [];
    }
  }

  async getChainsTVL() {
    const cacheKey = 'defillama_chains';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await axios.get('https://api.llama.fi/v2/chains');
      const chains = response.data.map(chain => ({
        name: chain.name,
        chainId: chain.chainId,
        tvl: chain.tvl,
        slug: chain.slug,
      }));

      this.cache.set(cacheKey, { data: chains, timestamp: Date.now() });
      return chains;
    } catch (error) {
      console.error('Failed to fetch chains:', error.message);
      return [];
    }
  }

  async getTopYieldsByChain(chainName, limit = 20) {
    const allYields = await this.getYieldsFromDefiLlama();
    return allYields
      .filter(y => y.chain.toLowerCase() === chainName.toLowerCase() && y.tvlUsd > 1000000)
      .sort((a, b) => (b.apy || 0) - (a.apy || 0))
      .slice(0, limit);
  }

  async getStablecoinYields(limit = 50) {
    const allYields = await this.getYieldsFromDefiLlama();
    return allYields
      .filter(y => y.stablecoin && y.tvlUsd > 1000000 && y.apy > 0)
      .sort((a, b) => (b.apy || 0) - (a.apy || 0))
      .slice(0, limit);
  }

  async calculateRiskMetrics(vaultAddress, chainId) {
    return {
      volatility: Math.random() * 10,
      sharpeRatio: Math.random() * 3,
      maxDrawdown: Math.random() * 5,
      sortinoRatio: Math.random() * 4,
      calmarRatio: Math.random() * 2,
    };
  }

  async optimizeAllocation(vaultStrategies, totalTVL) {
    const allocations = [];
    let remaining = 10000;

    const sortedStrategies = [...vaultStrategies].sort((a, b) => {
      const riskAdjustedA = (a.apy / 100) / Math.max(a.riskScore, 1);
      const riskAdjustedB = (b.apy / 100) / Math.max(b.riskScore, 1);
      return riskAdjustedB - riskAdjustedA;
    });

    for (const strategy of sortedStrategies) {
      const maxAlloc = Math.min(
        parseInt(strategy.maxAllocation) || 3000,
        remaining
      );
      const allocation = Math.min(maxAlloc, remaining);
      if (allocation > 0) {
        allocations.push({
          strategy: strategy.address,
          allocationBps: allocation,
          expectedAPY: strategy.apy,
          riskScore: strategy.riskScore,
        });
        remaining -= allocation;
      }
      if (remaining <= 0) break;
    }

    return allocations;
  }
}

module.exports = new YieldService();
