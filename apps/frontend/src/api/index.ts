import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const vaultApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/vaults', { params }),
  getStats: () => api.get('/vaults/stats'),
  getChains: () => api.get('/vaults/chains'),
  getByAddress: (address: string) => api.get(`/vaults/${address}`),
  getStrategies: (address: string) => api.get(`/vaults/${address}/strategies`),
  getHistory: (address: string, period: string) =>
    api.get(`/vaults/${address}/history`, { params: { period } }),
  getUserPositions: (userAddress: string) =>
    api.get(`/vaults/positions/${userAddress}`),
};

export const yieldApi = {
  getYields: (params?: Record<string, string>) =>
    api.get('/yield/yields', { params }),
  compare: (vaults: string) =>
    api.get('/yield/yields/compare', { params: { vaults } }),
  getChains: () => api.get('/yield/yields/chains'),
  optimize: (data: { strategies: any[]; totalTVL: string; riskTolerance: string }) =>
    api.post('/yield/optimize', data),
  getRisk: (vaultAddress: string) =>
    api.get(`/yield/risk/${vaultAddress}`),
};

export const chainApi = {
  getSupportedChains: () => api.get('/chain/supported-chains'),
  getVaultInfo: (chainName: string, vaultAddress: string) =>
    api.get(`/chain/vault-info/${chainName}/${vaultAddress}`),
  getUserPosition: (chainName: string, vaultAddress: string, userAddress: string) =>
    api.get(`/chain/user-position/${chainName}/${vaultAddress}/${userAddress}`),
  getDeposits: (userAddress: string) =>
    api.get(`/chain/deposits/${userAddress}`),
  getPositions: (userAddress: string) =>
    api.get(`/chain/positions/${userAddress}`),
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: string } | undefined)?.error ?? err.message;
  }
  return err instanceof Error ? err.message : fallback;
}

export default api;
