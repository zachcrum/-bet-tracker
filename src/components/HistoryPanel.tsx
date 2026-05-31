import { useState } from 'react';
import { summarizeResults } from '../domain/results';
import type { SavedSlip } from '../domain/types';

interface HistoryPanelProps {
  slips: SavedSlip[];
  onSettleSlip?: (slip: SavedSlip, profitLoss: number) => void;
}

export function HistoryPanel({ slips, onSettleSlip }: HistoryPanelProps) {
  const [profitLossBySlip, setProfitLossBySlip] = useState<Record<string, string>>({});
  const summary = summarizeResults(slips);

  return (
    <section className="panel" aria-labelledby="history-heading">
      <div className="panel-heading">
        <h2 id="history-heading">History</h2>
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
      {slips.length === 0 ? (
        <p className="empty-copy">Saved slips will appear here.</p>
      ) : (
        <ul className="history-list">
          {slips.map((slip) => (
            <li key={`${slip.id}-${slip.savedAt}`} className="history-item">
              <div>
                <strong>{slip.title}</strong>
                <span>{formatSavedDate(slip.savedAt)}</span>
              </div>
              <div className="history-meta">
                <span className="risk-tag">{slip.status}</span>
                <span>Stake {formatMoney(slip.stake)}</span>
                <span>Odds {slip.totalOdds?.toFixed(2) ?? '-'}</span>
                <span>
                  {slip.legs.length} {slip.legs.length === 1 ? 'leg' : 'legs'}
                </span>
                {Number.isFinite(slip.profitLoss) ? <span>P/L {formatMoney(slip.profitLoss)}</span> : null}
              </div>
              <form
                className="settle-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const inputValue = profitLossBySlip[slipKey(slip)] ?? formatInputValue(slip.profitLoss);
                  if (inputValue.trim() === '') {
                    return;
                  }

                  const profitLoss = Number(inputValue);
                  if (Number.isFinite(profitLoss)) {
                    onSettleSlip?.(slip, profitLoss);
                  }
                }}
              >
                <input
                  aria-label={`Profit/loss for ${slip.title}`}
                  inputMode="decimal"
                  placeholder="P/L"
                  type="number"
                  step="0.01"
                  value={profitLossBySlip[slipKey(slip)] ?? formatInputValue(slip.profitLoss)}
                  onChange={(event) =>
                    setProfitLossBySlip((current) => ({
                      ...current,
                      [slipKey(slip)]: event.target.value,
                    }))
                  }
                />
                <button
                  type="submit"
                  className="secondary-button"
                  disabled={!onSettleSlip}
                  aria-label={`Settle ${slip.title}`}
                >
                  Settle
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatMoney(value: number | undefined): string {
  return value === undefined ? '-' : `$${value.toFixed(2)}`;
}

function formatInputValue(value: number | undefined): string {
  return Number.isFinite(value) ? String(value) : '';
}

function slipKey(slip: SavedSlip): string {
  return `${slip.id}-${slip.savedAt}`;
}

function formatSavedDate(savedAt: string): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return savedAt;
  }

  return date.toLocaleDateString();
}
