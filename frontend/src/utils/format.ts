export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBalance(balance: bigint, decimals: number = 18): number {
  return Number(balance) / Math.pow(10, decimals);
}

export function parseAmount(amount: string, decimals: number = 18): bigint {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return 0n;
  return BigInt(Math.floor(parsed * Math.pow(10, decimals)));
}