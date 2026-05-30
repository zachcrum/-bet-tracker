export function decimalOddsToImpliedProbability(decimalOdds: number): number {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) {
    throw new Error('Decimal odds must be greater than 1');
  }

  return 1 / decimalOdds;
}

export function multiplyDecimalOdds(odds: number[]): number {
  odds.forEach(decimalOddsToImpliedProbability);
  return odds.reduce((product, value) => product * value, 1);
}

export function formatProbability(probability: number): string {
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new Error('Probability must be between 0 and 1');
  }

  return `${(probability * 100).toFixed(1)}%`;
}
