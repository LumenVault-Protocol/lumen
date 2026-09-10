export function formatUSD(value: string | number, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
}

export function formatAPY(apy: number | string): string {
  const num = typeof apy === 'string' ? parseFloat(apy) : apy;
  if (isNaN(num)) return '0%';
  return `${num.toFixed(2)}%`;
}

export function formatShares(shares: string, decimals = 6): string {
  const num = parseFloat(shares);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}

export function formatSharePrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '$1.00';
  if (num > 1000) return `$${(num / 1e6).toFixed(4)}`;
  return `$${num.toFixed(4)}`;
}

export function getChainColor(chainName: string): string {
  const colors: Record<string, string> = {
    stellar: '#7D00FF',
  };
  return colors[chainName.toLowerCase()] || '#6b7280';
}

export function getRiskLabel(score: number | string): { label: string; color: string } {
  const num = typeof score === 'string' ? parseFloat(score) : score;
  if (isNaN(num)) return { label: 'Unknown', color: 'badge-yellow' };
  if (num <= 20) return { label: 'Very Low', color: 'badge-green' };
  if (num <= 40) return { label: 'Low', color: 'badge-green' };
  if (num <= 60) return { label: 'Medium', color: 'badge-yellow' };
  if (num <= 80) return { label: 'High', color: 'badge-red' };
  return { label: 'Very High', color: 'badge-red' };
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function calculateTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
