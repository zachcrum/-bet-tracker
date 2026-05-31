import { buildMultiSuggestions } from './multiBuilder';
import type { RatedLeg } from './types';

function ratedLeg(id: string, score: number, player: string, overrides: Partial<RatedLeg> = {}): RatedLeg {
  return {
    id,
    player,
    marketFamily: 'points',
    threshold: 10,
    label: 'To Score 10+ Points',
    sourceText: '',
    trafficLight: score >= 7 ? 'green' : 'yellow',
    score,
    estimatedProbability: 0.35 + score * 0.055,
    confidence: 'medium',
    reasons: ['Test leg'],
    riskTags: [],
    ...overrides,
  };
}

describe('buildMultiSuggestions', () => {
  it('creates four modes', () => {
    const legs = Array.from({ length: 24 }, (_, index) => ratedLeg(`leg-${index}`, 9 - (index % 5), `Player ${index}`));
    const suggestions = buildMultiSuggestions(legs);
    expect(suggestions.map((suggestion) => suggestion.mode)).toEqual([
      'conservative',
      'balanced',
      'aggressive',
      'lotto',
    ]);
  });

  it('uses more legs for aggressive modes', () => {
    const legs = Array.from({ length: 24 }, (_, index) => ratedLeg(`leg-${index}`, 8, `Player ${index}`));
    const suggestions = buildMultiSuggestions(legs);
    const conservative = suggestions.find((suggestion) => suggestion.mode === 'conservative');
    const lotto = suggestions.find((suggestion) => suggestion.mode === 'lotto');
    expect(lotto?.legs.length).toBeGreaterThan(conservative?.legs.length ?? 0);
  });

  it('uses zero odds and probability with clear summaries for empty input', () => {
    const suggestions = buildMultiSuggestions([]);
    expect(suggestions).toHaveLength(4);
    expect(suggestions.every((suggestion) => suggestion.legs.length === 0)).toBe(true);
    expect(suggestions.every((suggestion) => suggestion.estimatedOdds === 0)).toBe(true);
    expect(suggestions.every((suggestion) => suggestion.estimatedProbability === 0)).toBe(true);
    expect(suggestions.every((suggestion) => suggestion.summary.includes('No eligible legs'))).toBe(true);
  });

  it('uses zero odds and probability when no legs meet a mode score target', () => {
    const suggestions = buildMultiSuggestions([ratedLeg('leg-low', 3, 'Low Score Player')]);
    const conservative = suggestions.find((suggestion) => suggestion.mode === 'conservative');
    expect(conservative?.legs).toEqual([]);
    expect(conservative?.estimatedOdds).toBe(0);
    expect(conservative?.estimatedProbability).toBe(0);
    expect(conservative?.summary).toContain('No eligible legs');
  });

  it.each([0, -0.1, 1.1, Number.POSITIVE_INFINITY, Number.NaN])(
    'throws for invalid estimated probability %s',
    (estimatedProbability) => {
      expect(() =>
        buildMultiSuggestions([ratedLeg('leg-invalid', 8, 'Invalid Player', { estimatedProbability })]),
      ).toThrow('Estimated probability must be greater than 0 and at most 1');
    },
  );

  it('estimates odds and probability from selected legs', () => {
    const suggestions = buildMultiSuggestions([
      ratedLeg('leg-a', 9, 'Player A', { estimatedProbability: 0.5, odds: 2 }),
      ratedLeg('leg-b', 8, 'Player B', { estimatedProbability: 0.25, odds: 3 }),
    ]);
    const conservative = suggestions.find((suggestion) => suggestion.mode === 'conservative');
    expect(conservative?.estimatedOdds).toBe(6);
    expect(conservative?.estimatedProbability).toBeCloseTo(0.125);
  });

  it('prefers one leg per player before duplicate player legs', () => {
    const suggestions = buildMultiSuggestions([
      ratedLeg('a-1', 8, 'Alpha', { label: 'Same Market' }),
      ratedLeg('a-2', 8, 'Alpha', { label: 'Same Market' }),
      ratedLeg('b-1', 8, 'Beta', { label: 'Same Market' }),
      ratedLeg('c-1', 8, 'Charlie', { label: 'Same Market' }),
      ratedLeg('d-1', 8, 'Delta', { label: 'Same Market' }),
      ratedLeg('e-1', 8, 'Echo', { label: 'Same Market' }),
    ]);
    const conservative = suggestions.find((suggestion) => suggestion.mode === 'conservative');
    expect(conservative?.legs.map((leg) => leg.id)).toEqual(['a-1', 'b-1', 'c-1', 'd-1', 'e-1']);
  });

  it('uses deterministic score, label, player, and id ordering', () => {
    const suggestions = buildMultiSuggestions([
      ratedLeg('beta-2', 8, 'Beta', { label: 'Same Market' }),
      ratedLeg('alpha-2', 8, 'Alpha', { label: 'Same Market' }),
      ratedLeg('alpha-1', 8, 'Alpha', { label: 'Same Market' }),
      ratedLeg('top', 9, 'Zulu', { label: 'Later Market' }),
      ratedLeg('early', 8, 'Omega', { label: 'Earlier Market' }),
    ]);
    const conservative = suggestions.find((suggestion) => suggestion.mode === 'conservative');
    expect(conservative?.legs.map((leg) => leg.id)).toEqual(['top', 'early', 'alpha-1', 'beta-2', 'alpha-2']);
  });
});
