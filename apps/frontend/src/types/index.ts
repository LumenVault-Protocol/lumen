export interface Chain {
  name: string;
  chainId: number;
  tvl: string;
  vaultCount: number;
  avgAPY: number;
}

export interface Vault {
  address: string;
  name: string;
  symbol: string;
  asset: string;
  assetSymbol: string;
  chainId: number;
  chainName: string;
  curator: string;
  managementFeeBps: number;
  performanceFeeBps: number;
  tvl: string;
  totalShares: string;
  sharePrice: string;
  apy: number;
  riskScore: number;
  isActive: boolean;
  strategies: string[];
  strategyAllocations?: { strategy: string; allocationBps: number }[];
  historicalTVL?: { tvl: string; timestamp: string }[];
  historicalAPY?: { apy: number; timestamp: string }[];
  totalDeposits: string;
  totalWithdrawals: string;
  totalHarvested: string;
  depositCount: number;
  withdrawalCount: number;
  uniqueDepositors: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaultStats {
  totalVaults: number;
  totalTVL: string;
  avgAPY: number | string;
  totalDepositors: number;
  chainDistribution: Record<string, number>;
  topVault?: Vault;
}

export interface YieldPool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  apyPct1D: number;
  apyPct7D: number;
  apyPct30D: number;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
}

export interface Allocation {
  strategy: string;
  allocationBps: number;
  expectedAPY: number;
  riskScore: number;
}

export interface OptimizeResult {
  allocations: Allocation[];
  riskTolerance: string;
  totalAllocation: number;
  expectedAPY: string;
}

export interface UserPosition {
  user: string;
  vault: string;
  asset: string;
  shares: string;
  tokenBalance: string;
  costBasis: string;
  pnl: string;
}

export interface Strategy {
  address: string;
  name: string;
  description: string;
  apy: number;
  tvl: string;
  riskScore: number;
  maxAllocation: string;
  farmAddress: string;
  protocol: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}