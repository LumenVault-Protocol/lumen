require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lumenvault',
  },
  chains: {
    stellar: {
      rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-rpc.stellar.org',
      networkPassphrase: process.env.STELLAR_NETWORK || 'Public Global Stellar Network ; September 2015',
      chainId: 0,
      explorerUrl: 'https://stellar.expert',
      horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org',
    },
  },
  defillama: {
    baseUrl: 'https://yields.llama.fi',
  },
};