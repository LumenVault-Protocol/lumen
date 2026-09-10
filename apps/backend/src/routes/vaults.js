const express = require('express');
const router = express.Router();
const Vault = require('../models/Vault');
const Strategy = require('../models/Strategy');
const UserPosition = require('../models/UserPosition');
const cacheService = require('../services/cacheService');

router.get('/', async (req, res) => {
  try {
    const { chain, sort, limit = 50, offset = 0, stablecoin, minTvl, maxRisk } = req.query;

    const filter = { isActive: true };
    if (chain) filter.chainName = chain.toLowerCase();
    if (stablecoin === 'true') filter.assetSymbol = { $in: ['USDC', 'USDT', 'DAI', 'RLUSD'] };
    if (maxRisk) filter.riskScore = { $lte: parseInt(maxRisk) };

    let sortObj = { tvl: -1 };
    if (sort === 'apy') sortObj = { apy: -1 };
    if (sort === 'risk') sortObj = { riskScore: 1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'depositors') sortObj = { uniqueDepositors: -1 };

    let vaults = await Vault.find(filter)
      .sort(sortObj)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    if (minTvl) {
      const minTvlNum = parseFloat(minTvl);
      vaults = vaults.filter(v => parseFloat(v.tvl || '0') >= minTvlNum);
    }

    const total = await Vault.countDocuments(filter);

    res.json({
      success: true,
      data: vaults,
      pagination: {
        total,
        offset: parseInt(offset),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await cacheService.getOrSet('vault_stats', async () => {
      const totalVaults = await Vault.countDocuments({ isActive: true });
      const vaults = await Vault.find({ isActive: true });

      let totalTVL = 0;
      let avgAPY = 0;
      let totalDepositors = 0;
      const chainDistribution = {};

      for (const vault of vaults) {
        totalTVL += parseFloat(vault.tvl || '0');
        avgAPY += vault.apy || 0;
        totalDepositors += vault.uniqueDepositors || 0;

        if (!chainDistribution[vault.chainName]) {
          chainDistribution[vault.chainName] = 0;
        }
        chainDistribution[vault.chainName] += parseFloat(vault.tvl || '0');
      }

      return {
        totalVaults,
        totalTVL: totalTVL.toString(),
        avgAPY: totalVaults > 0 ? (avgAPY / totalVaults).toFixed(2) : 0,
        totalDepositors,
        chainDistribution,
        topVault: vaults.sort((a, b) => parseFloat(b.tvl || '0') - parseFloat(a.tvl || '0'))[0],
      };
    }, 30000);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/chains', async (req, res) => {
  try {
    const chains = await cacheService.getOrSet('supported_chains', async () => {
      const vaults = await Vault.find({ isActive: true });
      const chainMap = {};

      for (const vault of vaults) {
        if (!chainMap[vault.chainName]) {
          chainMap[vault.chainName] = {
            name: vault.chainName,
            chainId: vault.chainId,
            tvl: '0',
            vaultCount: 0,
            avgAPY: 0,
          };
        }
        chainMap[vault.chainName].tvl = (
          parseFloat(chainMap[vault.chainName].tvl) + parseFloat(vault.tvl || '0')
        ).toString();
        chainMap[vault.chainName].vaultCount++;
        chainMap[vault.chainName].avgAPY += vault.apy || 0;
      }

      return Object.values(chainMap).map(c => ({
        ...c,
        avgAPY: c.vaultCount > 0 ? (c.avgAPY / c.vaultCount).toFixed(2) : 0,
      }));
    }, 60000);

    res.json({ success: true, data: chains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:vaultAddress', async (req, res) => {
  try {
    const vault = await Vault.findOne({ address: req.params.vaultAddress });
    if (!vault) {
      return res.status(404).json({ success: false, error: 'Vault not found' });
    }
    res.json({ success: true, data: vault });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:vaultAddress/strategies', async (req, res) => {
  try {
    const vault = await Vault.findOne({ address: req.params.vaultAddress });
    if (!vault) {
      return res.status(404).json({ success: false, error: 'Vault not found' });
    }

    const strategies = await Strategy.find({
      address: { $in: vault.strategies },
    });

    res.json({ success: true, data: strategies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:vaultAddress/history', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const vault = await Vault.findOne({ address: req.params.vaultAddress });
    if (!vault) {
      return res.status(404).json({ success: false, error: 'Vault not found' });
    }

    let cutoff;
    switch (period) {
      case '24h': cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
      case '7d': cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); break;
      case '1y': cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); break;
      default: cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const tvlHistory = (vault.historicalTVL || []).filter(h => h.timestamp >= cutoff);
    const apyHistory = (vault.historicalAPY || []).filter(h => h.timestamp >= cutoff);

    res.json({
      success: true,
      data: {
        tvl: tvlHistory,
        apy: apyHistory,
        period,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/positions/:userAddress', async (req, res) => {
  try {
    const positions = await UserPosition.find({ user: req.params.userAddress });
    res.json({ success: true, data: positions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
