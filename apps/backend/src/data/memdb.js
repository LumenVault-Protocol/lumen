const crypto = require('crypto');

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// Stellar-native seed data. All addresses are real Soroban/Stellar strings:
//   C... = contract addresses (vaults, strategies, token contracts)
//   G... = Stellar public keys (curators, demo user)
// chainName is always "stellar", chainId is always 0 (Stellar is not EVM).
// ---------------------------------------------------------------------------

const TOKEN_CONTRACTS = {
  USDC: 'CD6KH6ZUPGHEW2DNOBFR4THGKMW57ESDXOG3KRJ3T66FZQSL52ST6KOD',
  XLM: 'CDGJMXRWJIYYMNC2LNCWDFPAGGQ2VS5T5KUACW57NRSDZAI37P7Q4BDH',
  USDT: 'CAYGF7W7OLMHRYMUIJVWPSEXTQOWGMP2OYA5TPYMFV46ERTE4ZSPXVNL',
  RLUSD: 'CDDKP4OVG5U6AHAV6C6KTRER3BCLV5UN755WEBT3MCJQQUAD2RBV5WBB',
};

const STRATEGY_CONTRACTS = {
  Blend: 'CB43NN7SW2F6VAOFAMFSJQ7IJFEIARFUZ25ZTJOMCWV63YNBYL4WD3M5',
  Lemmus: 'CDMZ3AVTSJ5A4RSWRS7JXFAFYIZIHARVG6CSI5L7THBGVSKCOQ6UYQXU',
  Phoenix: 'CAADVDUI4FVNSEEXGROUA7JIBYKJ7TSZRJ2DN6ZIDXUTZIBBDCNSR52C',
  Thylo: 'CARX5ZVSPP23SMAHGC77YIRACUKDEH2KAXNARBWU7D5RTL3QDZX6D43G',
  xlToken: 'CBCDT2X7767OUIWZS2OI2SY3FCUYVVW4IDHZSTUOXC7LTTKQPX73ASC5',
};

const CURATORS = [
  'GA5N25KCVLYRH4CGO5THSWKFUPDZEYZ4P54LDXMS3T74VPLXSWCMXKJ4',
  'GDGFRNXWL7HNKMJBO2L35Q54DOTEG2LL5E4NUATCI42ZM4P7LY75SHGJ',
  'GB7JDQ3ZVYFIQZD753B65Z7Q3AVYMB6V5VFH4QCSHLVLOADHYPH7NDFX',
  'GAEGTH7OZZPJANNRYVMTBN5FFQSY74E3GMSE2VRCSW5F2HXAXMNSQN4X',
  'GCSLG5U2VX3WWLFMHWOSLTK55ZXZEILB2IHPH7EYC5NWPIUPVB53A3IV',
];

const VAULT_CONTRACTS = [
  'CAQQE5TWGRJ3GUO2X2KPPCA3XCP62RGLR4CYW25SBC36QYVRUSBWPCDG',
  'CDD4FRCWO4I5BK6IPYR6SKNXX3BNZRH3YKGGLO5GQAPCBKUHNPZK7FWA',
  'CADT3BZGWV5XM6G4JWVDBS4BDSLEQZE3IP56NMKE6XTL4NFT5DCLXNG6',
  'CCOHZBLDYFNAJGPLBX5LYKBAKEWFVWNSZAJEZRWAJFXTVOY5GBGW65Y5',
  'CB2TQNXZK5D4VOF4PV32MW4IHG4MUH2IP377QRC2726EDKDL3KYUKYNC',
  'CBU74IBWW6TBI4IVXYQ5DVAA4SXJXTPZ5LNEXSZYNVWXZHZCUYRRIKQ5',
  'CAEO2F7WOJ3GMKSP44RE3HAFN2HLNMUKRCXPX5V45PWZ2AVP536HPB73',
  'CD42IPFRXAJUW46CF4CCYO3M2F46JC4ZDDOVWOK7SED7C5NKUMA2BEH7',
  'CD2Q5PGE6WICAQCKOQYUMA6THDSTR5IUXHAPE3BXR3RUCGM2VW7NH65E',
  'CBNMADZROWTJTIR2VPUIP75IPPFVACS2G2EKWBWC3CJHK3JWJLUN6KZC',
  'CBFHT5R7TVWCHYYKIYP6MT35LVLNZMTY2VHC7A7QZKSZ4RYLBVI2GXBM',
  'CBMGHBIIMFWVKRP5OG3GXN3BUV3BNE257EH5LYYISE4KB7KEUEZGHOBW',
  'CCUDTOQFXZY64EF2SFNCZEYPM3RRUNZV7PLY6QPJD7BAGRNFNYZVGZXU',
  'CACK6FDGOBHSFTBUO2EKC4BLROWFHCJTDS5JPCKRR3UWCIV2Y3TO3PVF',
  'CAXZNZNOB5DPSIPQXBEOF26EX2CEB2WGW7TDK7BAO25TFWD2SUQASRZM',
  'CCVR2PZHXWVYUXPSQRBQRQVZC4QC57VE4KXCS3NGLZCHWQX7HHCE6736',
  'CBCHHLXDOAIF6FXHJH4JLPB45DWESD4NQWCPBUQGRA6O353A56PC7GZN',
  'CBSLLL2V4FYBHV273WOZHJYUBV7ZCLCU7TSFID3SFRVZRF5BZGQAGBUC',
  'CBOWJIWDMGWVB4X4W37W3Z2EOLU42AY6IOMC4IANVWLNZ2Q5RRP6IHPG',
  'CCRFC2A7MNSN3KPOYBYRWYYEUA2IAJDPZ4R6OI2KQHNTVX7NLNOLXC4Q',
  'CBM4SYXJJPBIB5HXXNXQ5RDNI24QPARQXWPUTIHZ6YAMYD5K44SREODY',
  'CDNBWWMDPBOX5IACZLVTLKN5CYJDDSQSMOHPIRO5LKW2MVSDIMVCWZBB',
  'CCSEPHQYJMZVFG56WANBNOCGFF5VS3H3GRFAOPKGCODYRNCGFL7KKQBP',
  'CDNC2FSHOMZFZJOI3WQBAYJCN5SXLCKIP3ON7D5KHRQZMRB77XVDGZHU',
  'CC4LI6ZYFPGOGLYL2AJLVLCX5XLWWIACOZ5ZROGBYAJ23GLXLCVCVCFF',
  'CB7TW7WVBCZM2D2C2UJOLUG5HCRCXRDUUMO3H7HHRSXFHMYFBINA5RER',
  'CB2VIVP6J75ZZ4YSPQEZZUJJWI3MIDNTI7EMXRWPFOBPWCMH235STNU2',
  'CBD3PPHKL3PWDZHVOA4CV55ROPW3NAJGQKU6VUUDO3DTNQLIHXFXLLSR',
  'CBJ6UYZPWNMKBKTXJUGJZMFJ37LDWICQT3REJ6PHE5HZTOGM6VGBJLBP',
  'CD5SIREVVH2PN3WFBZ5K3B6C3N7MGK2A5QSR5G7X5P3LIVRIXLXMA2CC',
];

const demoUser = 'GDEJUQPNUB42FK4AR4W7N425DMOLXPYZFBZB645UQMJRQA5JSXEMO2IM';

// Deterministic PRNG so demo values are stable across restarts.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function txHash(seedText) {
  return crypto.createHash('sha256').update(seedText).digest('hex');
}

// [name, symbol, assetSymbol, strategy, apy, riskScore, mgmtFeeBps,
//  perfFeeBps, tvlUsd, ageDays]
const VAULT_SPECS = [
  ['LumenVault USDC - Blend Lending', 'lvUSDC-BL', 'USDC', 'Blend', 8.92, 35, 200, 1000, 348500000, 360],
  ['LumenVault USDC - Lemmus Money Market', 'lvUSDC-LM', 'USDC', 'Lemmus', 9.4, 30, 200, 1000, 282400000, 300],
  ['LumenVault USDC - Phoenix Stable LP', 'lvUSDC-PX', 'USDC', 'Phoenix', 11.2, 48, 300, 1500, 168200000, 240],
  ['LumenVault USDC - Thylo Yield', 'lvUSDC-TH', 'USDC', 'Thylo', 7.55, 22, 200, 800, 96800000, 180],
  ['LumenVault USDC - xlToken Earn', 'lvUSDC-XL', 'USDC', 'xlToken', 10.8, 55, 250, 1500, 74300000, 120],
  ['LumenVault USDC Core', 'lvUSDC-CO', 'USDC', 'Blend', 8.2, 28, 150, 1000, 512000000, 520],
  ['LumenVault USDC - Blend Leverage', 'lvUSDC-BLV', 'USDC', 'Blend', 12.6, 60, 300, 1800, 58900000, 90],
  ['LumenVault USDC - Phoenix Pool A', 'lvUSDC-PXA', 'USDC', 'Phoenix', 10.05, 44, 250, 1200, 41600000, 150],
  ['LumenVault USDC - Lemmus Euro', 'lvUSDC-LME', 'USDC', 'Lemmus', 8.85, 32, 200, 1000, 33500000, 210],
  ['LumenVault USDC - Thylo Flex', 'lvUSDC-THF', 'USDC', 'Thylo', 7.1, 18, 150, 800, 29200000, 100],
  ['LumenVault USDC - Stellar Blue', 'lvUSDC-SB', 'USDC', 'Blend', 9.65, 38, 200, 1200, 22800000, 75],
  ['LumenVault USDC - Phoenix Pool B', 'lvUSDC-PXB', 'USDC', 'Phoenix', 10.55, 50, 250, 1200, 15400000, 60],
  ['LumenVault USDC - xlToken Core', 'lvUSDC-XLC', 'USDC', 'xlToken', 10.2, 52, 250, 1500, 12600000, 45],
  ['LumenVault USDC - Lemmus Optimal', 'lvUSDC-LMO', 'USDC', 'Lemmus', 9.1, 34, 200, 1000, 9800000, 30],
  ['LumenVault XLM - Blend Lending', 'lvXLM-BL', 'XLM', 'Blend', 6.4, 25, 200, 800, 88200000, 280],
  ['LumenVault XLM - Lemmus Stables', 'lvXLM-LM', 'XLM', 'Lemmus', 6.9, 28, 200, 1000, 64500000, 200],
  ['LumenVault XLM - Phoenix XLM LP', 'lvXLM-PX', 'XLM', 'Phoenix', 8.7, 42, 250, 1200, 38900000, 150],
  ['LumenVault XLM - Thylo Passive', 'lvXLM-TH', 'XLM', 'Thylo', 5.8, 16, 150, 800, 47300000, 130],
  ['LumenVault XLM - xlToken Lumens', 'lvXLM-XL', 'XLM', 'xlToken', 9.3, 58, 300, 1500, 21700000, 80],
  ['LumenVault XLM Core', 'lvXLM-CO', 'XLM', 'Blend', 6.65, 24, 150, 900, 132000000, 400],
  ['LumenVault USDT - Blend Lending', 'lvUSDT-BL', 'USDT', 'Blend', 8.1, 33, 200, 1000, 156000000, 300],
  ['LumenVault USDT - Lemmus Tether', 'lvUSDT-LM', 'USDT', 'Lemmus', 8.55, 31, 200, 1000, 98400000, 220],
  ['LumenVault USDT - Phoenix Pool', 'lvUSDT-PX', 'USDT', 'Phoenix', 10.75, 46, 250, 1200, 52100000, 140],
  ['LumenVault USDT - Thylo Earn', 'lvUSDT-TH', 'USDT', 'Thylo', 7.35, 20, 150, 800, 36800000, 90],
  ['LumenVault USDT - xlToken Tether', 'lvUSDT-XL', 'USDT', 'xlToken', 9.9, 54, 250, 1500, 18900000, 70],
  ['LumenVault USDT Core', 'lvUSDT-CO', 'USDT', 'Blend', 8.3, 29, 150, 1000, 214000000, 460],
  ['LumenVault RLUSD - Blend', 'lvRLUSD-BL', 'RLUSD', 'Blend', 8.45, 26, 200, 1000, 12400000, 90],
  ['LumenVault RLUSD - Lemmus USD', 'lvRLUSD-LM', 'RLUSD', 'Lemmus', 9.05, 29, 200, 1000, 8700000, 60],
  ['LumenVault RLUSD - Phoenix Pool', 'lvRLUSD-PX', 'RLUSD', 'Phoenix', 10.65, 45, 250, 1200, 5300000, 40],
  ['LumenVault RLUSD - Thylo Earn', 'lvRLUSD-TH', 'RLUSD', 'Thylo', 8.05, 22, 150, 800, 3900000, 35],
];

const CURATOR_BY_STRATEGY = { Blend: 0, Lemmus: 1, Phoenix: 2, Thylo: 3, xlToken: 4 };

const vaultsData = VAULT_SPECS.map((spec, i) => {
  const [name, symbol, assetSymbol, strategy, apy, riskScore, mgmtFeeBps, perfFeeBps, tvlUsd, ageDays] = spec;
  const rand = mulberry32(1000 + i * 7);

  // Anchor-share-price convention: 1e6 => $1.00. Growth scales with age & apy.
  const sharePrice = 1000000 + Math.round(ageDays * apy * 10);
  const totalShares = Math.round((tvlUsd * 1e6) / sharePrice);

  const growth = [0.88, 0.92, 0.955, 0.985, 1.0];
  const apyCurve = [apy - 1.8, apy - 1.2, apy - 0.75, apy - 0.3, apy];
  const histDays = [60, 45, 30, 15, 1];

  const strategyAddress = STRATEGY_CONTRACTS[strategy];

  return {
    address: VAULT_CONTRACTS[i],
    name,
    symbol,
    asset: TOKEN_CONTRACTS[assetSymbol],
    assetSymbol,
    chainId: 0,
    chainName: 'stellar',
    curator: CURATORS[CURATOR_BY_STRATEGY[strategy]],
    managementFeeBps: mgmtFeeBps,
    performanceFeeBps: perfFeeBps,
    tvl: String(tvlUsd),
    totalShares: String(totalShares),
    sharePrice: String(sharePrice),
    apy,
    riskScore,
    isActive: true,
    strategies: [strategyAddress],
    strategyAllocations: [{ strategy: strategyAddress, allocationBps: 8000 }],
    historicalTVL: histDays.map((d, j) => ({ tvl: String(Math.round(tvlUsd * growth[j])), timestamp: daysAgo(d) })),
    historicalAPY: histDays.map((d, j) => ({ apy: safeApy(apyCurve[j]), timestamp: daysAgo(d) })),
    totalDeposits: String(Math.round(tvlUsd * 1.65)),
    totalWithdrawals: String(Math.round(tvlUsd * 0.65) + Math.round(tvlUsd * apy * 0.005)),
    totalHarvested: String(Math.round(tvlUsd * apy * 0.005)),
    depositCount: Math.round((tvlUsd / 100000) * (0.8 + rand() * 0.5)),
    withdrawalCount: Math.round((tvlUsd / 100000) * (0.25 + rand() * 0.3)),
    uniqueDepositors: Math.round((tvlUsd / 100000) * (0.55 + rand() * 0.3)),
    maxDrawdown: Math.round((1.5 + riskScore * 0.08) * 100) / 100,
    sharpeRatio: Math.round((2.4 - riskScore * 0.015) * 100) / 100,
    volatility: Math.round((1.5 + riskScore * 0.08) * 1.6 * 100) / 100,
  };
});

function safeApy(value) {
  return Math.round(value * 100) / 100;
}

const strategiesData = [
  {
    address: STRATEGY_CONTRACTS.Blend,
    name: 'Blend Lending Market',
    protocol: 'Blend',
    chainId: 0,
    chainName: 'stellar',
    asset: TOKEN_CONTRACTS.USDC,
    assetSymbol: 'USDC',
    apy: 8.9,
    tvl: '254000000',
    riskScore: 28,
    isActive: true,
    maxAllocation: '8000',
    lastUpdated: daysAgo(0),
    historicalAPY: [
      { apy: 7.8, timestamp: daysAgo(30) },
      { apy: 8.3, timestamp: daysAgo(15) },
      { apy: 8.9, timestamp: daysAgo(1) },
    ],
  },
  {
    address: STRATEGY_CONTRACTS.Lemmus,
    name: 'Lemmus Money Market',
    protocol: 'Lemmus',
    chainId: 0,
    chainName: 'stellar',
    asset: TOKEN_CONTRACTS.USDC,
    assetSymbol: 'USDC',
    apy: 9.4,
    tvl: '188000000',
    riskScore: 31,
    isActive: true,
    maxAllocation: '8000',
    lastUpdated: daysAgo(0),
    historicalAPY: [
      { apy: 8.4, timestamp: daysAgo(30) },
      { apy: 8.9, timestamp: daysAgo(15) },
      { apy: 9.4, timestamp: daysAgo(1) },
    ],
  },
  {
    address: STRATEGY_CONTRACTS.Phoenix,
    name: 'Phoenix Stable Pools',
    protocol: 'Phoenix',
    chainId: 0,
    chainName: 'stellar',
    asset: TOKEN_CONTRACTS.USDC,
    assetSymbol: 'USDC',
    apy: 11.2,
    tvl: '124000000',
    riskScore: 44,
    isActive: true,
    maxAllocation: '7500',
    lastUpdated: daysAgo(0),
    historicalAPY: [
      { apy: 9.8, timestamp: daysAgo(30) },
      { apy: 10.4, timestamp: daysAgo(15) },
      { apy: 11.2, timestamp: daysAgo(1) },
    ],
  },
  {
    address: STRATEGY_CONTRACTS.Thylo,
    name: 'Thylo Yield',
    protocol: 'Thylo',
    chainId: 0,
    chainName: 'stellar',
    asset: TOKEN_CONTRACTS.USDC,
    assetSymbol: 'USDC',
    apy: 7.55,
    tvl: '96000000',
    riskScore: 18,
    isActive: true,
    maxAllocation: '8000',
    lastUpdated: daysAgo(0),
    historicalAPY: [
      { apy: 6.8, timestamp: daysAgo(30) },
      { apy: 7.1, timestamp: daysAgo(15) },
      { apy: 7.55, timestamp: daysAgo(1) },
    ],
  },
  {
    address: STRATEGY_CONTRACTS.xlToken,
    name: 'xlToken Liquid Staking',
    protocol: 'xlToken',
    chainId: 0,
    chainName: 'stellar',
    asset: TOKEN_CONTRACTS.XLM,
    assetSymbol: 'XLM',
    apy: 9.3,
    tvl: '54000000',
    riskScore: 56,
    isActive: true,
    maxAllocation: '7000',
    lastUpdated: daysAgo(0),
    historicalAPY: [
      { apy: 8.2, timestamp: daysAgo(30) },
      { apy: 8.8, timestamp: daysAgo(15) },
      { apy: 9.3, timestamp: daysAgo(1) },
    ],
  },
];

const depositsData = [
  {
    txHash: txHash('deposit-1'),
    user: demoUser,
    vault: VAULT_CONTRACTS[0],
    chainId: 0,
    amount: '50000',
    shares: '49806',
    ledger: 45350001,
    timestamp: daysAgo(45),
    status: 'confirmed',
  },
  {
    txHash: txHash('deposit-2'),
    user: demoUser,
    vault: VAULT_CONTRACTS[14],
    chainId: 0,
    amount: '20000',
    shares: '19910',
    ledger: 45482100,
    timestamp: daysAgo(28),
    status: 'confirmed',
  },
  {
    txHash: txHash('deposit-3'),
    user: demoUser,
    vault: VAULT_CONTRACTS[20],
    chainId: 0,
    amount: '100000',
    shares: '99280',
    ledger: 45611320,
    timestamp: daysAgo(12),
    status: 'confirmed',
  },
  {
    txHash: txHash('deposit-4'),
    user: demoUser,
    vault: VAULT_CONTRACTS[26],
    chainId: 0,
    amount: '30000',
    shares: '29895',
    ledger: 45704218,
    timestamp: daysAgo(3),
    status: 'pending',
  },
];

const positionsData = [
  {
    user: demoUser,
    vault: VAULT_CONTRACTS[0],
    chainId: 0,
    shares: '49806',
    depositedAmount: '50000',
    currentValue: '50142',
    unrealizedPnL: '142',
    realizedPnL: '0',
    firstDeposit: daysAgo(45),
    lastDeposit: daysAgo(45),
    lastWithdrawal: null,
    totalDeposited: '50000',
    totalWithdrawn: '0',
    averageEntryPrice: '1000000',
    history: [
      { action: 'deposit', amount: '50000', shares: '49806', timestamp: daysAgo(45), txHash: txHash('deposit-1') },
    ],
  },
  {
    user: demoUser,
    vault: VAULT_CONTRACTS[14],
    chainId: 0,
    shares: '19910',
    depositedAmount: '20000',
    currentValue: '20197',
    unrealizedPnL: '197',
    realizedPnL: '0',
    firstDeposit: daysAgo(28),
    lastDeposit: daysAgo(28),
    lastWithdrawal: null,
    totalDeposited: '20000',
    totalWithdrawn: '0',
    averageEntryPrice: '1000000',
    history: [
      { action: 'deposit', amount: '20000', shares: '19910', timestamp: daysAgo(28), txHash: txHash('deposit-2') },
    ],
  },
  {
    user: demoUser,
    vault: VAULT_CONTRACTS[20],
    chainId: 0,
    shares: '99280',
    depositedAmount: '100000',
    currentValue: '101795',
    unrealizedPnL: '1795',
    realizedPnL: '0',
    firstDeposit: daysAgo(12),
    lastDeposit: daysAgo(12),
    lastWithdrawal: null,
    totalDeposited: '100000',
    totalWithdrawn: '0',
    averageEntryPrice: '1000000',
    history: [
      { action: 'deposit', amount: '100000', shares: '99280', timestamp: daysAgo(12), txHash: txHash('deposit-3') },
    ],
  },
];

function matches(item, filter) {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined) return true;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const ops = Object.entries(value);
      if (ops.every(([op]) => op.startsWith('$'))) {
        return ops.every(([op, operand]) => {
          switch (op) {
            case '$in': return operand.includes(item[key]);
            case '$gte': return item[key] >= operand;
            case '$lte': return item[key] <= operand;
            case '$ne': return item[key] !== operand;
            default: return true;
          }
        });
      }
    }
    return item[key] === value;
  });
}

class MemoryQuery {
  constructor(items) {
    this._items = items;
    this._skip = 0;
    this._limit = null;
  }

  sort(sortObj) {
    if (!sortObj) return this;
    const key = Object.keys(sortObj)[0];
    const dir = sortObj[key] === -1 ? -1 : 1;
    this._items = [...this._items].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  then(onFulfilled, onRejected) {
    let out = this._items;
    if (this._skip > 0) out = out.slice(this._skip);
    if (this._limit !== null) out = out.slice(0, this._limit);
    return Promise.resolve(out).then(onFulfilled, onRejected);
  }
}

function createMemoryModel(name, seed) {
  const data = seed.map((item) => ({ ...item }));

  return {
    find(filter = {}) {
      return new MemoryQuery(data.filter((item) => matches(item, filter)));
    },
    findOne(filter = {}) {
      return data.find((item) => matches(item, filter)) || null;
    },
    countDocuments(filter = {}) {
      return data.filter((item) => matches(item, filter)).length;
    },
    insertMany(docs) {
      data.push(...docs.map((d) => ({ ...d })));
      return docs.length;
    },
    _data: data,
  };
}

module.exports = {
  isEnabled: () => Boolean(global.USE_IN_MEMORY_DB),
  enable() {
    global.USE_IN_MEMORY_DB = true;
  },
  Vault: createMemoryModel('Vault', vaultsData),
  Strategy: createMemoryModel('Strategy', strategiesData),
  Deposit: createMemoryModel('Deposit', depositsData),
  UserPosition: createMemoryModel('UserPosition', positionsData),
  demoUser,
};