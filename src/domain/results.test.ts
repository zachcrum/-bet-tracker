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
  it('returns zero summary for empty input', () => {
    expect(summarizeResults([])).toEqual({
      totalStaked: 0,
      profitLoss: 0,
      settledCount: 0,
      winCount: 0,
      lossCount: 0,
    });
  });

  it('summarizes settled slips', () => {
    expect(summarizeResults(slips)).toEqual({
      totalStaked: 15,
      profitLoss: 485,
      settledCount: 2,
      winCount: 1,
      lossCount: 1,
    });
  });

  it('ignores unsettled slips', () => {
    expect(
      summarizeResults([
        {
          id: 'slip-1',
          title: 'Placed',
          savedAt: '2026-05-31T00:00:00.000Z',
          status: 'placed',
          stake: 20,
          legs: [],
          legResults: {},
          profitLoss: 100,
        },
        {
          id: 'slip-2',
          title: 'Suggested',
          savedAt: '2026-05-31T00:00:00.000Z',
          status: 'suggested',
          stake: 30,
          legs: [],
          legResults: {},
          profitLoss: -30,
        },
      ]),
    ).toEqual({
      totalStaked: 0,
      profitLoss: 0,
      settledCount: 0,
      winCount: 0,
      lossCount: 0,
    });
  });

  it('does not count zero profit as a win or loss', () => {
    expect(
      summarizeResults([
        {
          id: 'slip-1',
          title: 'Push',
          savedAt: '2026-05-31T00:00:00.000Z',
          status: 'settled',
          stake: 10,
          legs: [],
          legResults: {},
          profitLoss: 0,
        },
      ]),
    ).toEqual({
      totalStaked: 10,
      profitLoss: 0,
      settledCount: 1,
      winCount: 0,
      lossCount: 0,
    });
  });

  it('excludes settled slips without finite profit loss data', () => {
    expect(
      summarizeResults([
        {
          id: 'slip-1',
          title: 'Missing result',
          savedAt: '2026-05-31T00:00:00.000Z',
          status: 'settled',
          stake: 10,
          legs: [],
          legResults: {},
        },
        {
          id: 'slip-2',
          title: 'Non-finite result',
          savedAt: '2026-05-31T00:00:00.000Z',
          status: 'settled',
          stake: 20,
          legs: [],
          legResults: {},
          profitLoss: Number.POSITIVE_INFINITY,
        },
        {
          id: 'slip-3',
          title: 'Valid result',
          savedAt: '2026-05-31T00:00:00.000Z',
          status: 'settled',
          stake: 5,
          legs: [],
          legResults: {},
          profitLoss: 15,
        },
      ]),
    ).toEqual({
      totalStaked: 5,
      profitLoss: 15,
      settledCount: 1,
      winCount: 1,
      lossCount: 0,
    });
  });
});
