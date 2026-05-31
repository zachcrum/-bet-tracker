import { summarizeResults } from '../domain/results';
import type { SavedSlip } from '../domain/types';

interface HistoryPanelProps {
  slips: SavedSlip[];
}

export function HistoryPanel({ slips }: HistoryPanelProps) {
  const summary = summarizeResults(slips);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>History</h2>
        <span className="eyebrow">{slips.length} saved</span>
      </div>
      <div className="metrics-grid">
        <div>
          <span>Staked</span>
          <strong>${summary.totalStaked.toFixed(2)}</strong>
        </div>
        <div>
          <span>P/L</span>
          <strong>${summary.profitLoss.toFixed(2)}</strong>
        </div>
        <div>
          <span>Settled</span>
          <strong>{summary.settledCount}</strong>
        </div>
      </div>
    </section>
  );
}
