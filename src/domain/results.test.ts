import type { SavedSlip } from './types';
import { summarizeResults } from './results';

const slips: SavedSlip[] = [
  {
    id: 'slip-1',
    title: 'Win',
    savedAt: '2026-05-31T00:00:00.000Z',
    status: 'settled',
    stake: 5,
    potentialPayout: 500,
    legs: [],
    legResults: {},
    profitLoss: 495,
  },
  {
    id: 'slip-2',
    title: 'Loss',
    savedAt: '2026-05-31T00:00:00.000Z',
    status: 'settled',
    stake: 10,
    potentialPayout: 1000,
    legs: [],
    legResults: {},
    profitLoss: -10,
  },
];

describe('summarizeResults', () => {
  it('summarizes settled slips', () => {
    expect(summarizeResults(slips)).toEqual({
      totalStaked: 15,
      profitLoss: 485,
      settledCount: 2,
      winCount: 1,
      lossCount: 1,
    });
  });
});
