import type { SlipDiagnosis } from '../domain/types';

interface ChatPanelProps {
  diagnosis?: SlipDiagnosis;
}

export function ChatPanel({ diagnosis }: ChatPanelProps) {
  const weakest = diagnosis?.weakestLegIds
    .map((id) => diagnosis.ratedLegs.find((leg) => leg.id === id))
    .filter(Boolean)
    .map((leg) => `${leg?.player}: ${leg?.label}`)
    .join('; ');

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Chat Analyst</h2>
        <span className="eyebrow">Structured v1</span>
      </div>
      <div className="chat-response">
        {diagnosis
          ? `Weakest legs to review first: ${weakest || 'none identified'}.`
          : 'Load a slip and I will call out weak legs, risk clusters, and safer replacements.'}
      </div>
    </section>
  );
}
