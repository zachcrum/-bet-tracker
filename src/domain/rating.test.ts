import type { NormalizedLeg } from './types';
import { rateLeg, rateLegs } from './rating';

function leg(overrides: Partial<NormalizedLeg>): NormalizedLeg {
  return {
    id: 'leg-1',
    player: 'Chet Holmgren',
    marketFamily: 'rebounds',
    threshold: 8,
    label: 'To Record 8+ Rebounds',
    sourceText: 'Chet Holmgren\nTo Record 8+ Rebounds',
    ...overrides,
  };
}

describe('rateLeg', () => {
  it('rates low threshold role props as stronger', () => {
    const rated = rateLeg(leg({ threshold: 4, label: 'To Record 4+ Rebounds' }));
    expect(rated.trafficLight).toBe('green');
    expect(rated.score).toBeGreaterThanOrEqual(7);
    expect(rated.reasons).toContain('Low threshold for this market family.');
  });

  it('marks high threshold props as fragile', () => {
    const rated = rateLeg(leg({ marketFamily: 'points', threshold: 25, label: 'To Score 25+ Points' }));
    expect(rated.trafficLight).toBe('yellow');
    expect(rated.riskTags).toContain('high-threshold');
  });

  it('uses implied probability when odds are present', () => {
    const rated = rateLeg(leg({ odds: 2 }));
    expect(rated.impliedProbability).toBe(0.5);
    expect(rated.edge).toBeDefined();
  });

  it('rejects zero odds as invalid provided odds', () => {
    expect(() => rateLeg(leg({ odds: 0 }))).toThrow('Decimal odds must be greater than 1');
  });

  it('rejects NaN odds as invalid provided odds', () => {
    expect(() => rateLeg(leg({ odds: Number.NaN }))).toThrow('Decimal odds must be greater than 1');
  });

  it('marks unknown markets as low confidence and risky', () => {
    const rated = rateLeg(leg({ marketFamily: 'unknown' }));

    expect(rated.confidence).toBe('low');
    expect(rated.score).toBe(3);
    expect(rated.trafficLight).toBe('red');
    expect(rated.riskTags).toContain('unknown-market');
  });

  it('tags defensive event props for variance', () => {
    const rated = rateLeg(leg({ marketFamily: 'blocks', threshold: 2, label: 'To Record 2+ Blocks' }));

    expect(rated.score).toBe(4);
    expect(rated.trafficLight).toBe('yellow');
    expect(rated.riskTags).toContain('event-variance');
    expect(rated.reasons).toContain('Defensive event props have higher single-game variance.');
  });

  it('uses medium confidence when odds are not present', () => {
    const rated = rateLeg(leg({ odds: undefined }));

    expect(rated.confidence).toBe('medium');
    expect(rated.impliedProbability).toBeUndefined();
    expect(rated.edge).toBeUndefined();
  });

  it('maps multiple legs through rateLegs', () => {
    const rated = rateLegs([
      leg({ id: 'leg-1', threshold: 4, label: 'To Record 4+ Rebounds' }),
      leg({ id: 'leg-2', marketFamily: 'points', threshold: 25, label: 'To Score 25+ Points' }),
    ]);

    expect(rated).toHaveLength(2);
    expect(rated.map((item) => item.id)).toEqual(['leg-1', 'leg-2']);
    expect(rated.map((item) => item.score)).toEqual([7, 4]);
  });
});
