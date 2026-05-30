export function decimalOddsToImpliedProbability(decimalOdds: number): number {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) {
    throw new Error('Decimal odds must be greater than 1');
  }

  return 1 / decimalOdds;
}

export function multiplyDecimalOdds(odds: number[]): number {
  return odds.reduce((product, value) => product * value, 1);
}

export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}
