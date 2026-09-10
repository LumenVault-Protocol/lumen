const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  protocol: { type: String, required: true },
  chainId: { type: Number, required: true },
  chainName: { type: String, required: true },
  asset: { type: String, required: true },
  assetSymbol: { type: String, required: true },
  apy: { type: Number, default: 0 },
  tvl: { type: String, default: '0' },
  riskScore: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true },
  maxAllocation: { type: String, default: '0' },
  lastUpdated: { type: Date, default: Date.now },
  historicalAPY: [{
    apy: Number,
    timestamp: Date,
  }],
}, { timestamps: true });

strategySchema.index({ chainId: 1, isActive: 1 });
strategySchema.index({ protocol: 1 });
strategySchema.index({ apy: -1 });

const MongoModel = mongoose.model('Strategy', strategySchema);
const memdb = require('../data/memdb');

module.exports = {
  find(filter) {
    return memdb.isEnabled() ? memdb.Strategy.find(filter) : MongoModel.find(filter);
  },
  findOne(filter) {
    return memdb.isEnabled() ? memdb.Strategy.findOne(filter) : MongoModel.findOne(filter);
  },
  countDocuments(filter) {
    return memdb.isEnabled()
      ? memdb.Strategy.countDocuments(filter)
      : MongoModel.countDocuments(filter);
  },
  insertMany(docs) {
    return memdb.isEnabled()
      ? memdb.Strategy.insertMany(docs)
      : MongoModel.insertMany(docs);
  },
};

