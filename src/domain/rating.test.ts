import type { NormalizedLeg } from './types';
import { rateLeg } from './rating';

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
});
