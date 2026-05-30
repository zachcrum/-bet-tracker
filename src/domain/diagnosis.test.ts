import { diagnoseSlip } from './diagnosis';
import type { Slip } from './types';

const slip: Slip = {
  id: 'slip-1',
  title: 'Same Game Multi @ 900.00',
  game: 'San Antonio Spurs @ Oklahoma City Thunder',
  totalOdds: 900,
  stake: 5,
  legs: [
    {
      id: 'leg-1',
      player: 'Cason Wallace',
      marketFamily: 'steals',
      threshold: 2,
      label: 'To Record 2+ Steals',
      sourceText: '',
    },
    {
      id: 'leg-2',
      player: 'Cason Wallace',
      marketFamily: 'threes',
      threshold: 2,
      label: '2+ Made Threes',
      sourceText: '',
    },
    {
      id: 'leg-3',
      player: 'Victor Wembanyama',
      marketFamily: 'points',
      threshold: 25,
      label: 'To Score 25+ Points',
      sourceText: '',
    },
  ],
};

describe('diagnoseSlip', () => {
  it('rates legs and flags concentration risk', () => {
    const diagnosis = diagnoseSlip(slip);
    expect(diagnosis.ratedLegs).toHaveLength(3);
    expect(diagnosis.riskTags).toContain('same-player-concentration');
    expect(diagnosis.riskTags).toContain('high-variance-defensive-events');
    expect(diagnosis.weakestLegIds.length).toBeGreaterThan(0);
  });

  it('orders strongest and weakest legs by score', () => {
    const diagnosis = diagnoseSlip(slip);

    expect(diagnosis.strongestLegIds).toEqual(['leg-2', 'leg-1', 'leg-3']);
    expect(diagnosis.weakestLegIds).toEqual(['leg-1', 'leg-3', 'leg-2']);
  });

  it('normalizes player names when checking concentration risk', () => {
    const diagnosis = diagnoseSlip({
      ...slip,
      legs: [
        {
          id: 'leg-1',
          player: '  Cason Wallace ',
          marketFamily: 'threes',
          threshold: 2,
          label: '2+ Made Threes',
          sourceText: '',
        },
        {
          id: 'leg-2',
          player: 'cason wallace',
          marketFamily: 'assists',
          threshold: 2,
          label: '2+ Assists',
          sourceText: '',
        },
      ],
    });

    expect(diagnosis.riskTags).toContain('same-player-concentration');
  });

  it('does not flag concentration risk for different players', () => {
    const diagnosis = diagnoseSlip({
      ...slip,
      legs: [
        {
          id: 'leg-1',
          player: 'Cason Wallace',
          marketFamily: 'threes',
          threshold: 2,
          label: '2+ Made Threes',
          sourceText: '',
        },
        {
          id: 'leg-2',
          player: 'Victor Wembanyama',
          marketFamily: 'assists',
          threshold: 2,
          label: '2+ Assists',
          sourceText: '',
        },
      ],
    });

    expect(diagnosis.riskTags).not.toContain('same-player-concentration');
  });

  it('handles empty slips', () => {
    const diagnosis = diagnoseSlip({
      ...slip,
      title: 'Empty Slip',
      totalOdds: undefined,
      legs: [],
    });

    expect(diagnosis.ratedLegs).toEqual([]);
    expect(diagnosis.strongestLegIds).toEqual([]);
    expect(diagnosis.weakestLegIds).toEqual([]);
    expect(diagnosis.riskTags).toEqual([]);
    expect(diagnosis.summary).toBe(
      'Empty Slip has 0 legs, 0 green ratings, 0 red ratings, and 0 slip-level risk flags.',
    );
  });

  it('flags long multi variance for ten or more legs', () => {
    const diagnosis = diagnoseSlip({
      ...slip,
      legs: Array.from({ length: 10 }, (_, index) => ({
        id: `leg-${index + 1}`,
        player: `Player ${index + 1}`,
        marketFamily: 'points',
        threshold: 10,
        label: 'To Score 10+ Points',
        sourceText: '',
      })),
    });

    expect(diagnosis.riskTags).toContain('long-multi-variance');
  });

  it('summarizes the slip diagnosis', () => {
    const diagnosis = diagnoseSlip(slip);

    expect(diagnosis.summary).toBe(
      'Same Game Multi @ 900.00 at 900.00 odds has 3 legs, 1 green ratings, 0 red ratings, and 4 slip-level risk flags.',
    );
  });
});
