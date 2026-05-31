import type { SlipDiagnosis } from '../domain/types';

interface SlipSummaryProps {
  diagnosis?: SlipDiagnosis;
}

export function SlipSummary({ diagnosis }: SlipSummaryProps) {
  if (!diagnosis) {
    return (
      <section className="panel empty-state">
        <h2>No slip loaded</h2>
        <p>Paste a Sportsbet multi or upload a screenshot to start the analysis.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{diagnosis.slip.title}</h2>
        <span className="eyebrow">{diagnosis.slip.legs.length} legs</span>
      </div>
      <p className="summary-copy">{diagnosis.summary}</p>
      <div className="metrics-grid">
        <div>
          <span>Stake</span>
          <strong>{formatMoney(diagnosis.slip.stake)}</strong>
        </div>
        <div>
          <span>Odds</span>
          <strong>{diagnosis.slip.totalOdds?.toFixed(2) ?? '-'}</strong>
        </div>
        <div>
          <span>Potential</span>
          <strong>{formatMoney(diagnosis.slip.potentialPayout)}</strong>
        </div>
      </div>
      <div className="tag-row">
        {diagnosis.riskTags.map((tag) => (
          <span key={tag} className="risk-tag">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

function formatMoney(value: number | undefined): string {
  return value === undefined ? '-' : `$${value.toFixed(2)}`;
}
