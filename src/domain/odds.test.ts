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

  it('rejects invalid decimal odds when multiplying', () => {
    expect(() => multiplyDecimalOdds([1.2, 1])).toThrow('Decimal odds must be greater than 1');
    expect(() => multiplyDecimalOdds([1.2, Number.NaN])).toThrow('Decimal odds must be greater than 1');
  });

  it('formats probability as a percentage', () => {
    expect(formatProbability(0.276)).toBe('27.6%');
    expect(formatProbability(0)).toBe('0.0%');
    expect(formatProbability(1)).toBe('100.0%');
  });

  it('rejects probabilities outside the display range', () => {
    expect(() => formatProbability(-0.1)).toThrow('Probability must be between 0 and 1');
    expect(() => formatProbability(1.1)).toThrow('Probability must be between 0 and 1');
    expect(() => formatProbability(Number.NaN)).toThrow('Probability must be between 0 and 1');
  });
});
