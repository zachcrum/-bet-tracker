import { formatProbability } from '../domain/odds';
import type { RatedLeg } from '../domain/types';

interface LegTableProps {
  legs: RatedLeg[];
}

export function LegTable({ legs }: LegTableProps) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <h2>Line Ratings</h2>
        <span className="eyebrow">{legs.length} rated</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Leg</th>
              <th>Market</th>
              <th>Score</th>
              <th>Prob.</th>
              <th>Confidence</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {legs.map((leg) => (
              <tr key={leg.id}>
                <td>
                  <strong>{leg.player ?? 'Team market'}</strong>
                  <span>{leg.label}</span>
                </td>
                <td>{leg.marketFamily}</td>
                <td>
                  <span className={`light ${leg.trafficLight}`}>{leg.score}/10</span>
                </td>
                <td>{formatProbability(leg.estimatedProbability)}</td>
                <td>{leg.confidence}</td>
                <td>{leg.reasons[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
