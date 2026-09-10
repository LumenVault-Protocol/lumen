const mongoose = require('mongoose');

const userPositionSchema = new mongoose.Schema({
  user: { type: String, required: true },
  vault: { type: String, required: true },
  chainId: { type: Number, required: true },
  shares: { type: String, default: '0' },
  depositedAmount: { type: String, default: '0' },
  currentValue: { type: String, default: '0' },
  unrealizedPnL: { type: String, default: '0' },
  realizedPnL: { type: String, default: '0' },
  firstDeposit: { type: Date },
  lastDeposit: { type: Date },
  lastWithdrawal: { type: Date },
  totalDeposited: { type: String, default: '0' },
  totalWithdrawn: { type: String, default: '0' },
  averageEntryPrice: { type: String, default: '1000000' },
  history: [{
    action: { type: String, enum: ['deposit', 'withdraw'] },
    amount: String,
    shares: String,
    timestamp: Date,
    txHash: String,
  }],
}, { timestamps: true });

userPositionSchema.index({ user: 1, vault: 1 }, { unique: true });
userPositionSchema.index({ user: 1 });
userPositionSchema.index({ vault: 1 });

const MongoModel = mongoose.model('UserPosition', userPositionSchema);
const memdb = require('../data/memdb');

module.exports = {
  find(filter) {
    return memdb.isEnabled()
      ? memdb.UserPosition.find(filter)
      : MongoModel.find(filter);
  },
  findOne(filter) {
    return memdb.isEnabled()
      ? memdb.UserPosition.findOne(filter)
      : MongoModel.findOne(filter);
  },
  countDocuments(filter) {
    return memdb.isEnabled()
      ? memdb.UserPosition.countDocuments(filter)
      : MongoModel.countDocuments(filter);
  },
  insertMany(docs) {
    return memdb.isEnabled()
      ? memdb.UserPosition.insertMany(docs)
      : MongoModel.insertMany(docs);
  },
};

