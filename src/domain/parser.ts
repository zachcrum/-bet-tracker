import type { MarketFamily, NormalizedLeg, Slip } from './types';

const MARKET_PATTERNS: Array<{ family: MarketFamily; pattern: RegExp }> = [
  { family: 'points', pattern: /(?:score|record)\s+(\d+(?:\.\d+)?)\+\s+points?/i },
  { family: 'rebounds', pattern: /record\s+(\d+(?:\.\d+)?)\+\s+rebounds?/i },
  { family: 'assists', pattern: /record\s+(\d+(?:\.\d+)?)\+\s+assists?/i },
  { family: 'threes', pattern: /(\d+(?:\.\d+)?)\+\s+made\s+threes?/i },
  { family: 'steals', pattern: /record\s+(\d+(?:\.\d+)?)\+\s+steals?/i },
  { family: 'blocks', pattern: /record\s+(\d+(?:\.\d+)?)\+\s+blocks?/i },
];

const NON_LEG_PREFIXES = [
  'same game multi',
  'potential winnings',
  'bet placed on',
  'tomorrow',
  'today',
  'pending',
  'sportsbet',
  'what are you prepared',
  'set a deposit limit',
];

export function parseSlipText(text: string): Slip {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const totalOdds = extractNumberAfter(text, /Same Game Multi\s*@\s*([\d,.]+)/i);
  const stake = extractNumberAfter(text, /Stake\s*\$([\d,.]+)/i);
  const potentialPayout = extractNumberAfter(text, /Potential Winnings\s*\$([\d,.]+)/i);
  const game = lines.find((line) => line.includes(' @ ') && !line.toLowerCase().includes('same game multi'));

  const candidateLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    return !NON_LEG_PREFIXES.some((prefix) => lower.startsWith(prefix)) && !line.includes('• Stake');
  });

  const legs: NormalizedLeg[] = [];

  for (let index = 0; index < candidateLines.length - 1; index += 1) {
    const player = candidateLines[index];
    const label = candidateLines[index + 1];

    if (!looksLikePlayerName(player) || !looksLikeMarketLabel(label)) {
      continue;
    }

    const parsedMarket = parseMarketLabel(label);
    legs.push({
      id: `leg-${legs.length + 1}`,
      player,
      game,
      marketFamily: parsedMarket.family,
      threshold: parsedMarket.threshold,
      label,
      sourceText: `${player}\n${label}`,
    });

    index += 1;
  }

  return {
    id: `slip-${Date.now()}`,
    title: totalOdds ? `Same Game Multi @ ${totalOdds.toFixed(2)}` : 'Imported Sportsbet Slip',
    game,
    stake,
    totalOdds,
    potentialPayout,
    legs,
  };
}

function extractNumberAfter(text: string, pattern: RegExp): number | undefined {
  const match = text.match(pattern);
  if (!match) {
    return undefined;
  }

  return Number(match[1].replace(/,/g, ''));
}

function looksLikePlayerName(line: string): boolean {
  return /^[A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+)+$/.test(line);
}

function looksLikeMarketLabel(line: string): boolean {
  return Boolean(line);
}

function parseMarketLabel(label: string): { family: MarketFamily; threshold?: number } {
  for (const marketPattern of MARKET_PATTERNS) {
    const match = label.match(marketPattern.pattern);
    if (match) {
      return {
        family: marketPattern.family,
        threshold: Number(match[1]),
      };
    }
  }

  return { family: 'unknown' };
}
