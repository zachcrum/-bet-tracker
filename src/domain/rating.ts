import { decimalOddsToImpliedProbability } from './odds';
import type { Confidence, MarketFamily, NormalizedLeg, RatedLeg, TrafficLight } from './types';

const LOW_THRESHOLDS: Partial<Record<MarketFamily, number>> = {
  points: 10,
  rebounds: 4,
  assists: 2,
  threes: 2,
  steals: 1,
  blocks: 1,
};

const HIGH_THRESHOLDS: Partial<Record<MarketFamily, number>> = {
  points: 25,
  rebounds: 10,
  assists: 8,
  threes: 4,
  steals: 3,
  blocks: 3,
};

export function rateLeg(leg: NormalizedLeg): RatedLeg {
  let score = 5;
  const reasons: string[] = [];
  const riskTags: string[] = [];

  const lowThreshold = LOW_THRESHOLDS[leg.marketFamily];
  const highThreshold = HIGH_THRESHOLDS[leg.marketFamily];

  if (leg.threshold !== undefined && lowThreshold !== undefined && leg.threshold <= lowThreshold) {
    score += 2;
    reasons.push('Low threshold for this market family.');
  }

  if (leg.threshold !== undefined && highThreshold !== undefined && leg.threshold >= highThreshold) {
    score -= 1;
    riskTags.push('high-threshold');
    reasons.push('High threshold needs a stronger role, minutes, and game script.');
  }

  if (leg.marketFamily === 'steals' || leg.marketFamily === 'blocks') {
    score -= 1;
    riskTags.push('event-variance');
    reasons.push('Defensive event props have higher single-game variance.');
  }

  if (leg.marketFamily === 'unknown') {
    score -= 2;
    riskTags.push('unknown-market');
    reasons.push('Market could not be classified from the slip text.');
  }

  const estimatedProbability = probabilityFromScore(score);
  const impliedProbability = leg.odds ? decimalOddsToImpliedProbability(leg.odds) : undefined;
  const edge = impliedProbability === undefined ? undefined : estimatedProbability - impliedProbability;

  const finalScore = clamp(Math.round(score), 1, 10);

  return {
    ...leg,
    trafficLight: trafficLightFromScore(finalScore),
    score: finalScore,
    estimatedProbability,
    impliedProbability,
    edge,
    confidence: confidenceFromLeg(leg),
    reasons: reasons.length > 0 ? reasons : ['No strong positive or negative rule triggered.'],
    riskTags,
  };
}

export function rateLegs(legs: NormalizedLeg[]): RatedLeg[] {
  return legs.map(rateLeg);
}

function probabilityFromScore(score: number): number {
  return clamp(0.35 + score * 0.055, 0.05, 0.9);
}

function trafficLightFromScore(score: number): TrafficLight {
  if (score >= 7) {
    return 'green';
  }

  if (score >= 4) {
    return 'yellow';
  }

  return 'red';
}

function confidenceFromLeg(leg: NormalizedLeg): Confidence {
  if (leg.marketFamily === 'unknown') {
    return 'low';
  }

  if (leg.odds === undefined) {
    return 'medium';
  }

  return 'high';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
