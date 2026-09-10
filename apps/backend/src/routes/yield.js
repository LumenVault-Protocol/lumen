const express = require('express');
const router = express.Router();
const yieldService = require('../services/yieldService');
const cacheService = require('../services/cacheService');

router.get('/yields', async (req, res) => {
  try {
    const { chain, stablecoin, minTvl = 1000000, limit = 50 } = req.query;

    const yields = await cacheService.getOrSet(
      `yields_${chain || 'all'}_${stablecoin || 'all'}`,
      async () => {
        if (chain) {
          return yieldService.getTopYieldsByChain(chain, parseInt(limit));
        }
        if (stablecoin === 'true') {
          return yieldService.getStablecoinYields(parseInt(limit));
        }
        return yieldService.getYieldsFromDefiLlama();
      },
      300000
    );

    const filtered = yields.filter(y => y.tvlUsd >= parseInt(minTvl));

    res.json({
      success: true,
      data: filtered.slice(0, parseInt(limit)),
      total: filtered.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/yields/compare', async (req, res) => {
  try {
    const { vaults } = req.query;
    if (!vaults) {
      return res.status(400).json({ success: false, error: 'vaults param required' });
    }

    const vaultAddresses = vaults.split(',');
    const allYields = await yieldService.getYieldsFromDefiLlama();

    const comparison = vaultAddresses.map(addr => {
      const yieldData = allYields.find(y => y.pool === addr);
      return {
        address: addr,
        apy: yieldData?.apy || 0,
        tvl: yieldData?.tvlUsd || 0,
        chain: yieldData?.chain || 'unknown',
        stablecoin: yieldData?.stablecoin || false,
        predictions: yieldData?.predictions || {},
      };
    });

    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/yields/chains', async (req, res) => {
  try {
    const chains = await cacheService.getOrSet('llama_chains', async () => {
      return yieldService.getChainsTVL();
    }, 600000);

    res.json({ success: true, data: chains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/optimize', async (req, res) => {
  try {
    const { strategies, totalTVL, riskTolerance = 'medium' } = req.body;

    if (!strategies || !Array.isArray(strategies)) {
      return res.status(400).json({ success: false, error: 'strategies array required' });
    }

    let maxRisk = 60;
    if (riskTolerance === 'low') maxRisk = 30;
    if (riskTolerance === 'high') maxRisk = 80;

    const filteredStrategies = strategies.filter(s => s.riskScore <= maxRisk);
    const allocations = await yieldService.optimizeAllocation(filteredStrategies, totalTVL);

    res.json({
      success: true,
      data: {
        allocations,
        riskTolerance,
        totalAllocation: allocations.reduce((sum, a) => sum + a.allocationBps, 0),
        expectedAPY: allocations.reduce((sum, a) => sum + (a.expectedAPY * a.allocationBps) / 10000, 0).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/risk/:vaultAddress', async (req, res) => {
  try {
    const metrics = await yieldService.calculateRiskMetrics(req.params.vaultAddress, 1);
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
