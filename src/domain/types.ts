export type MarketFamily =
  | 'points'
  | 'rebounds'
  | 'assists'
  | 'threes'
  | 'steals'
  | 'blocks'
  | 'moneyline'
  | 'spread'
  | 'total'
  | 'quarter'
  | 'half'
  | 'unknown';

export type TrafficLight = 'green' | 'yellow' | 'red';
export type Confidence = 'low' | 'medium' | 'high';
export type MultiMode = 'conservative' | 'balanced' | 'aggressive' | 'lotto';
export type LegResult = 'pending' | 'won' | 'lost' | 'void' | 'push';

export interface NormalizedLeg {
  id: string;
  player?: string;
  team?: string;
  opponent?: string;
  game?: string;
  marketFamily: MarketFamily;
  threshold?: number;
  label: string;
  odds?: number;
  sourceText: string;
}

export interface Slip {
  id: string;
  title: string;
  game?: string;
  placedAt?: string;
  stake?: number;
  totalOdds?: number;
  potentialPayout?: number;
  legs: NormalizedLeg[];
}

export interface RatedLeg extends NormalizedLeg {
  trafficLight: TrafficLight;
  score: number;
  estimatedProbability: number;
  impliedProbability?: number;
  edge?: number;
  confidence: Confidence;
  reasons: string[];
  riskTags: string[];
}

export interface SlipDiagnosis {
  slip: Slip;
  ratedLegs: RatedLeg[];
  strongestLegIds: string[];
  weakestLegIds: string[];
  riskTags: string[];
  summary: string;
}

export interface BuiltMulti {
  id: string;
  mode: MultiMode;
  title: string;
  targetLegCount: number;
  legs: RatedLeg[];
  estimatedOdds: number;
  estimatedProbability: number;
  summary: string;
}

export interface SavedSlip extends Slip {
  savedAt: string;
  status: 'suggested' | 'placed' | 'settled';
  legResults: Record<string, LegResult>;
  profitLoss?: number;
  notes?: string;
}
