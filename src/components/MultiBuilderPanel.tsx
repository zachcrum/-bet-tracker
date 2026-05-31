import { formatProbability } from '../domain/odds';
import type { BuiltMulti } from '../domain/types';

interface MultiBuilderPanelProps {
  suggestions: BuiltMulti[];
}

export function MultiBuilderPanel({ suggestions }: MultiBuilderPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Generated Multis</h2>
        <span className="eyebrow">Compare modes</span>
      </div>
      {suggestions.length === 0 ? (
        <p className="empty-copy">Generated multis will appear after a slip has rated legs.</p>
      ) : null}
      <div className="multi-grid">
        {suggestions.map((suggestion) => (
          <article key={suggestion.id} className="multi-card">
            <h3>{suggestion.title}</h3>
            <p>{suggestion.summary}</p>
            <div className="metrics-grid compact">
              <div>
                <span>Odds</span>
                <strong>{suggestion.estimatedOdds.toFixed(2)}</strong>
              </div>
              <div>
                <span>Est. hit</span>
                <strong>{formatProbability(suggestion.estimatedProbability)}</strong>
              </div>
            </div>
            <ol>
              {suggestion.legs.slice(0, 6).map((leg) => (
                <li key={leg.id}>
                  {leg.player}: {leg.label}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}
