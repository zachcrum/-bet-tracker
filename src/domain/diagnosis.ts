import { rateLegs } from './rating';
import type { RatedLeg, Slip, SlipDiagnosis } from './types';

export function diagnoseSlip(slip: Slip): SlipDiagnosis {
  const ratedLegs = rateLegs(slip.legs);
  const sortedByScore = [...ratedLegs].sort((a, b) => b.score - a.score);
  const sortedByWeakest = [...ratedLegs].sort((a, b) => a.score - b.score);
  const strongestLegIds = sortedByScore.slice(0, 3).map((leg) => leg.id);
  const weakestLegIds = sortedByWeakest.slice(0, 3).map((leg) => leg.id);
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

    const normalizedPlayer = normalizePlayerName(leg.player);
    if (normalizedPlayer) {
      playerCounts.set(normalizedPlayer, (playerCounts.get(normalizedPlayer) ?? 0) + 1);
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

function normalizePlayerName(player: string | undefined): string | undefined {
  const normalized = player?.trim().replace(/\s+/g, ' ').toLowerCase();
  return normalized || undefined;
}

function buildSummary(slip: Slip, legs: RatedLeg[], riskTags: string[]): string {
  const greenCount = legs.filter((leg) => leg.trafficLight === 'green').length;
  const redCount = legs.filter((leg) => leg.trafficLight === 'red').length;
  const legCount = legs.length;
  const oddsText = slip.totalOdds ? ` at ${slip.totalOdds.toFixed(2)} odds` : '';

  return `${slip.title}${oddsText} has ${legCount} legs, ${greenCount} green ratings, ${redCount} red ratings, and ${riskTags.length} slip-level risk flags.`;
}
