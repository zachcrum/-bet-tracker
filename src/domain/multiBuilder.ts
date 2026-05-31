import { multiplyDecimalOdds } from './odds';
import type { BuiltMulti, MultiMode, RatedLeg } from './types';

const MODE_TARGETS: Record<MultiMode, { label: string; legCount: number; minScore: number }> = {
  conservative: { label: 'Conservative', legCount: 5, minScore: 7 },
  balanced: { label: 'Balanced', legCount: 8, minScore: 6 },
  aggressive: { label: 'Aggressive', legCount: 12, minScore: 5 },
  lotto: { label: 'Lotto', legCount: 18, minScore: 4 },
};

export function buildMultiSuggestions(ratedLegs: RatedLeg[]): BuiltMulti[] {
  return (Object.keys(MODE_TARGETS) as MultiMode[]).map((mode) => buildMode(mode, ratedLegs));
}

function buildMode(mode: MultiMode, ratedLegs: RatedLeg[]): BuiltMulti {
  const target = MODE_TARGETS[mode];
  const candidates = ratedLegs
    .filter((leg) => leg.score >= target.minScore)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  const selected = reducePlayerConcentration(candidates).slice(0, target.legCount);
  const estimatedOdds = estimateSlipOdds(selected);
  const estimatedProbability = selected.reduce((probability, leg) => probability * leg.estimatedProbability, 1);

  return {
    id: `built-${mode}`,
    mode,
    title: `${target.label} ${selected.length}-leg multi`,
    targetLegCount: target.legCount,
    legs: selected,
    estimatedOdds,
    estimatedProbability,
    summary: `${target.label} mode uses ${selected.length} legs with a minimum score target of ${target.minScore}.`,
  };
}

function reducePlayerConcentration(legs: RatedLeg[]): RatedLeg[] {
  const firstPass: RatedLeg[] = [];
  const extraPass: RatedLeg[] = [];
  const seenPlayers = new Set<string>();

  for (const leg of legs) {
    if (!leg.player || !seenPlayers.has(leg.player)) {
      firstPass.push(leg);
      if (leg.player) {
        seenPlayers.add(leg.player);
      }
    } else {
      extraPass.push(leg);
    }
  }

  return [...firstPass, ...extraPass];
}

function estimateSlipOdds(legs: RatedLeg[]): number {
  const syntheticOdds = legs.map((leg) => leg.odds ?? Math.max(1.01, 1 / leg.estimatedProbability));
  return multiplyDecimalOdds(syntheticOdds);
}
