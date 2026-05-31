import type { RatedLeg } from './types';
import { buildMultiSuggestions } from './multiBuilder';

function ratedLeg(id: string, score: number, player: string): RatedLeg {
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
});
