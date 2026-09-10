const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const Deposit = require('../models/Deposit');
const UserPosition = require('../models/UserPosition');
const config = require('../config');

router.get('/supported-chains', async (req, res) => {
  try {
    const chains = [{
      name: 'stellar',
      chainId: config.chains.stellar.chainId,
      rpcUrl: config.chains.stellar.rpcUrl,
      explorerUrl: config.chains.stellar.explorerUrl,
      horizonUrl: config.chains.stellar.horizonUrl,
      networkPassphrase: config.chains.stellar.networkPassphrase,
    }];

    res.json({ success: true, data: chains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/vault-info/:chainName/:vaultAddress', async (req, res) => {
  try {
    const { vaultAddress } = req.params;
    const info = await blockchainService.getVaultInfo(vaultAddress, 'stellar');
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user-position/:chainName/:vaultAddress/:userAddress', async (req, res) => {
  try {
    const { vaultAddress, userAddress } = req.params;
    const position = await blockchainService.getUserPosition(vaultAddress, userAddress, 'stellar');
    res.json({ success: true, data: position });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/deposits/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const deposits = await Deposit.find({ user: userAddress })
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Deposit.countDocuments({ user: userAddress });

    res.json({
      success: true,
      data: deposits,
      pagination: { total, offset: parseInt(offset), limit: parseInt(limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/positions/:userAddress', async (req, res) => {
  try {
    const positions = await UserPosition.find({ user: req.params.userAddress });
    const totalValue = positions.reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
    const totalPnL = positions.reduce((sum, p) => sum + parseFloat(p.unrealizedPnL || '0'), 0);

    res.json({
      success: true,
      data: {
        positions,
        totalValue: totalValue.toString(),
        totalPnL: totalPnL.toString(),
        positionCount: positions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;