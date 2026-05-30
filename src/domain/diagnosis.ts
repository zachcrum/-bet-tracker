import { rateLegs } from './rating';
import type { RatedLeg, Slip, SlipDiagnosis } from './types';

export function diagnoseSlip(slip: Slip): SlipDiagnosis {
  const ratedLegs = rateLegs(slip.legs);
  const sortedByScore = [...ratedLegs].sort((a, b) => b.score - a.score);
  const strongestLegIds = sortedByScore.slice(0, 3).map((leg) => leg.id);
  const weakestLegIds = sortedByScore.slice(-3).map((leg) => leg.id);
  const riskTags = collectSlipRiskTags(ratedLegs);

  return {
    slip,
    ratedLegs,
    strongestLegIds,
    weakestLegIds,
    riskTags,
    summary: buildSummary(slip, ratedLegs, riskTags),
  };
}

function collectSlipRiskTags(legs: RatedLeg[]): string[] {
  const tags = new Set<string>();
  const playerCounts = new Map<string, number>();

  for (const leg of legs) {
    for (const tag of leg.riskTags) {
      tags.add(tag);
    }

    if (leg.player) {
      playerCounts.set(leg.player, (playerCounts.get(leg.player) ?? 0) + 1);
    }
  }

  if ([...playerCounts.values()].some((count) => count >= 2)) {
    tags.add('same-player-concentration');
  }

  if (legs.some((leg) => leg.marketFamily === 'steals' || leg.marketFamily === 'blocks')) {
    tags.add('high-variance-defensive-events');
  }

  if (legs.length >= 10) {
    tags.add('long-multi-variance');
  }

  return [...tags];
}

function buildSummary(slip: Slip, legs: RatedLeg[], riskTags: string[]): string {
  const greenCount = legs.filter((leg) => leg.trafficLight === 'green').length;
  const redCount = legs.filter((leg) => leg.trafficLight === 'red').length;
  const legCount = legs.length;
  const oddsText = slip.totalOdds ? ` at ${slip.totalOdds.toFixed(2)} odds` : '';

  return `${slip.title}${oddsText} has ${legCount} legs, ${greenCount} green ratings, ${redCount} red ratings, and ${riskTags.length} slip-level risk flags.`;
}
