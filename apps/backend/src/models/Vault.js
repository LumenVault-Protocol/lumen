const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  asset: { type: String, required: true },
  assetSymbol: { type: String, required: true },
  chainId: { type: Number, required: true },
  chainName: { type: String, required: true },
  curator: { type: String, required: true },
  managementFeeBps: { type: Number, default: 200 },
  performanceFeeBps: { type: Number, default: 1000 },
  tvl: { type: String, default: '0' },
  totalShares: { type: String, default: '0' },
  sharePrice: { type: String, default: '1000000' },
  apy: { type: Number, default: 0 },
  riskScore: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true },
  strategies: [{ type: String }],
  strategyAllocations: [{
    strategy: String,
    allocationBps: Number,
  }],
  historicalTVL: [{
    tvl: String,
    timestamp: Date,
  }],
  historicalAPY: [{
    apy: Number,
    timestamp: Date,
  }],
  totalDeposits: { type: String, default: '0' },
  totalWithdrawals: { type: String, default: '0' },
  totalHarvested: { type: String, default: '0' },
  depositCount: { type: Number, default: 0 },
  withdrawalCount: { type: Number, default: 0 },
  uniqueDepositors: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 },
  sharpeRatio: { type: Number, default: 0 },
  volatility: { type: Number, default: 0 },
}, { timestamps: true });

vaultSchema.index({ chainId: 1, isActive: 1 });
vaultSchema.index({ tvl: -1 });
vaultSchema.index({ apy: -1 });
vaultSchema.index({ riskScore: 1 });

const MongoModel = mongoose.model('Vault', vaultSchema);
const memdb = require('../data/memdb');

module.exports = {
  find(filter) {
    return memdb.isEnabled() ? memdb.Vault.find(filter) : MongoModel.find(filter);
  },
  findOne(filter) {
    return memdb.isEnabled() ? memdb.Vault.findOne(filter) : MongoModel.findOne(filter);
  },
  countDocuments(filter) {
    return memdb.isEnabled()
      ? memdb.Vault.countDocuments(filter)
      : MongoModel.countDocuments(filter);
  },
  insertMany(docs) {
    return memdb.isEnabled() ? memdb.Vault.insertMany(docs) : MongoModel.insertMany(docs);
  },
};

