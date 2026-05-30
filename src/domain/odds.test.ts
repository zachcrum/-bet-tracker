import { decimalOddsToImpliedProbability, formatProbability, multiplyDecimalOdds } from './odds';

describe('odds helpers', () => {
  it('converts decimal odds to implied probability', () => {
    expect(decimalOddsToImpliedProbability(2)).toBe(0.5);
    expect(decimalOddsToImpliedProbability(10)).toBe(0.1);
  });

  it('rejects invalid decimal odds', () => {
    expect(() => decimalOddsToImpliedProbability(0)).toThrow('Decimal odds must be greater than 1');
    expect(() => decimalOddsToImpliedProbability(1)).toThrow('Decimal odds must be greater than 1');
  });

  it('multiplies decimal odds', () => {
    expect(multiplyDecimalOdds([1.2, 2, 3])).toBeCloseTo(7.2, 5);
  });

  it('formats probability as a percentage', () => {
    expect(formatProbability(0.276)).toBe('27.6%');
  });
});
