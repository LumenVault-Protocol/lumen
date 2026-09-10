const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  txHash: { type: String, required: true },
  user: { type: String, required: true },
  vault: { type: String, required: true },
  chainId: { type: Number, default: 0 },
  amount: { type: String, required: true },
  shares: { type: String, required: true },
  ledger: { type: Number },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
}, { timestamps: true });

depositSchema.index({ user: 1, timestamp: -1 });
depositSchema.index({ vault: 1, timestamp: -1 });
depositSchema.index({ txHash: 1 }, { unique: true });
depositSchema.index({ status: 1 });

const MongoModel = mongoose.model('Deposit', depositSchema);
const memdb = require('../data/memdb');

module.exports = {
  find(filter) {
    return memdb.isEnabled() ? memdb.Deposit.find(filter) : MongoModel.find(filter);
  },
  findOne(filter) {
    return memdb.isEnabled() ? memdb.Deposit.findOne(filter) : MongoModel.findOne(filter);
  },
  countDocuments(filter) {
    return memdb.isEnabled()
      ? memdb.Deposit.countDocuments(filter)
      : MongoModel.countDocuments(filter);
  },
  insertMany(docs) {
    return memdb.isEnabled() ? memdb.Deposit.insertMany(docs) : MongoModel.insertMany(docs);
  },
};

