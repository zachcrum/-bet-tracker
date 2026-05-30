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
  'sportsbet',
  'what are you prepared',
  'set a deposit limit',
];

const NOISE_PREFIXES = [
  'pending',
  'selection boosted',
  'boosted',
  'odds',
  'stake',
  'return',
  'cash out',
];

const UNKNOWN_MARKET_WORD_PATTERN = /\b(market|line|points?|rebounds?|assists?|threes?|steals?|blocks?|made|score|record|total|spread)\b/i;

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

  for (let index = 0; index < candidateLines.length; index += 1) {
    const player = candidateLines[index];

    if (!looksLikePlayerName(player)) {
      continue;
    }

    const labelIndex = findMarketLabelIndex(candidateLines, index + 1);
    if (labelIndex === undefined) {
      continue;
    }

    const label = candidateLines[labelIndex];
    const parsedMarket = parseMarketLabel(label);
    legs.push({
      id: `leg-${legs.length + 1}`,
      player,
      game,
      marketFamily: parsedMarket.family,
      threshold: parsedMarket.threshold,
      label,
      sourceText: candidateLines.slice(index, labelIndex + 1).join('\n'),
    });

    index = labelIndex;
  }

  return {
    id: createSlipId(text),
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
  return /^\p{Lu}[\p{L}'.-]+(?:\s+\p{Lu}[\p{L}'.-]+)+$/u.test(line);
}

function findMarketLabelIndex(lines: string[], startIndex: number): number | undefined {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];

    if (isSkippableNoiseLine(line)) {
      continue;
    }

    if (parseMarketLabel(line).family !== 'unknown' || looksLikeUnknownMarketLabel(line)) {
      return index;
    }

    if (looksLikePlayerName(line)) {
      if (hasKnownMarketAhead(lines, index + 1)) {
        return undefined;
      }

      return looksLikePlayerNameMarketFallback(line) ? index : undefined;
    }

    return undefined;
  }

  return undefined;
}

function looksLikeUnknownMarketLabel(line: string): boolean {
  return Boolean(line) && !looksLikePlayerName(line) && !isSkippableNoiseLine(line);
}

function looksLikePlayerNameMarketFallback(line: string): boolean {
  return UNKNOWN_MARKET_WORD_PATTERN.test(line);
}

function hasKnownMarketAhead(lines: string[], startIndex: number): boolean {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];

    if (isSkippableNoiseLine(line)) {
      continue;
    }

    return parseMarketLabel(line).family !== 'unknown';
  }

  return false;
}

function isSkippableNoiseLine(line: string): boolean {
  const lower = line.toLowerCase();
  return NOISE_PREFIXES.some((prefix) => lower.startsWith(prefix)) || /^\$?[\d,.]+$/.test(line);
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

function createSlipId(text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return `slip-${hash.toString(36)}`;
}
