const Vault = require('../models/Vault');
const Strategy = require('../models/Strategy');
const Deposit = require('../models/Deposit');
const UserPosition = require('../models/UserPosition');

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 60 * 1000;
  }

  set(key, value, ttl = this.defaultTTL) {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  get(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  delete(key) {
    this.memoryCache.delete(key);
  }

  flush() {
    this.memoryCache.clear();
  }

  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    let value = this.get(key);
    if (value !== null) return value;

    value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }
}

module.exports = new CacheService();
