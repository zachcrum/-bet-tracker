import type { SavedSlip } from './types';

export interface ResultSummary {
  totalStaked: number;
  profitLoss: number;
  settledCount: number;
  winCount: number;
  lossCount: number;
}

export function summarizeResults(slips: SavedSlip[]): ResultSummary {
  const settled = slips.filter((slip) => slip.status === 'settled' && Number.isFinite(slip.profitLoss));

  return settled.reduce<ResultSummary>(
    (summary, slip) => {
      const profitLoss = slip.profitLoss as number;
      const stake = Number.isFinite(slip.stake) ? (slip.stake as number) : 0;

      return {
        totalStaked: summary.totalStaked + stake,
        profitLoss: summary.profitLoss + profitLoss,
        settledCount: summary.settledCount + 1,
        winCount: summary.winCount + (profitLoss > 0 ? 1 : 0),
        lossCount: summary.lossCount + (profitLoss < 0 ? 1 : 0),
      };
    },
    {
      totalStaked: 0,
      profitLoss: 0,
      settledCount: 0,
      winCount: 0,
      lossCount: 0,
    },
  );
}
