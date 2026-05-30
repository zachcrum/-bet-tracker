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
});
