# NBA Multi Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first useful local NBA multi assistant: manual/Screenshot slip diagnosis, rule-based line ratings, multi generation modes, and local result tracking.

**Architecture:** Create a Vite React TypeScript app with pure domain services for parsing, rating, diagnosis, multi building, and persistence. The first slice works without live Sportsbet automation, while keeping data shapes compatible with a Chrome scanner integration in the next slice.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, Tesseract.js for client-side OCR, localStorage for first-slice persistence.

---

## Scope

This plan implements the first slice from `docs/superpowers/specs/2026-05-31-nba-multi-assistant-design.md`.

Included:

- Local dashboard shell.
- Manual slip text entry.
- Screenshot upload with OCR.
- Sportsbet-style slip parsing.
- Normalized leg and slip data models.
- Rule-based ratings with transparent reasoning.
- Multi diagnosis for long same-game multis.
- Conservative, balanced, aggressive, and lotto multi suggestions.
- Local result tracking and calibration summary.
- Guardrail constants for blocked betting actions.

Excluded from this first slice:

- Live Chrome Sportsbet scanning.
- Adding legs to Sportsbet.
- Public NBA injury/stat enrichment.
- Cloud sync.

## File Structure

- `package.json`: scripts and dependencies.
- `index.html`: Vite app entry.
- `tsconfig.json`: strict TypeScript configuration.
- `tsconfig.node.json`: Vite config TypeScript configuration.
- `vite.config.ts`: Vite and Vitest setup.
- `src/main.tsx`: React bootstrap.
- `src/App.tsx`: top-level app state and layout.
- `src/styles.css`: dashboard styling.
- `src/domain/types.ts`: shared domain types.
- `src/domain/odds.ts`: odds and probability helpers.
- `src/domain/parser.ts`: Sportsbet slip text parser.
- `src/domain/rating.ts`: rule-based line rating engine.
- `src/domain/diagnosis.ts`: slip diagnosis and risk aggregation.
- `src/domain/multiBuilder.ts`: generated multi modes.
- `src/domain/results.ts`: result and calibration helpers.
- `src/services/storage.ts`: localStorage persistence.
- `src/services/ocr.ts`: Tesseract.js OCR wrapper.
- `src/services/guardrails.ts`: blocked browser automation actions.
- `src/components/SlipInput.tsx`: paste/upload form.
- `src/components/SlipSummary.tsx`: parsed slip and diagnosis summary.
- `src/components/LegTable.tsx`: line-by-line rating table.
- `src/components/MultiBuilderPanel.tsx`: generated slip cards.
- `src/components/HistoryPanel.tsx`: saved slips and result updates.
- `src/components/ChatPanel.tsx`: structured local chat helper.
- `src/test/setup.ts`: test setup.
- `src/**/*.test.ts`: unit tests.
- `src/**/*.test.tsx`: component tests.

---

### Task 1: Scaffold The Vite React App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json`:

```json
{
  "name": "nba-multi-assistant",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tesseract.js": "^5.1.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5",
    "jsdom": "^24.1.1"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NBA Multi Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Add TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Configure Vite and Vitest**

Create `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 5: Add React bootstrap**

Create `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>NBA Multi Assistant</h1>
          <p>Rate long Sportsbet same-game multis before you place them.</p>
        </div>
      </header>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #15202b;
  background: #f5f7f8;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  background: #f5f7f8;
}

.topbar {
  background: #ffffff;
  border-bottom: 1px solid #d9e2e7;
  padding: 20px 28px;
}

.topbar h1 {
  font-size: 28px;
  margin: 0 0 4px;
}

.topbar p {
  color: #536471;
  margin: 0;
}
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 7: Verify scaffold**

Run:

```bash
npm run build
npm test
```

Expected: build passes; test command reports no test files or exits successfully once Vitest is configured.

- [ ] **Step 8: Commit scaffold**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src
git commit -m "feat: scaffold NBA multi assistant app"
```

---

### Task 2: Add Domain Types And Odds Helpers

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/odds.ts`
- Create: `src/domain/odds.test.ts`

- [ ] **Step 1: Write odds helper tests**

Create `src/domain/odds.test.ts`:

```ts
import { decimalOddsToImpliedProbability, formatProbability, multiplyDecimalOdds } from './odds';

describe('odds helpers', () => {
  it('converts decimal odds to implied probability', () => {
    expect(decimalOddsToImpliedProbability(2)).toBe(0.5);
    expect(decimalOddsToImpliedProbability(10)).toBe(0.1);
  });

  it('rejects invalid decimal odds', () => {
    expect(() => decimalOddsToImpliedProbability(0)).toThrow('Decimal odds must be greater than 1');
    expect(() => decimalOddsToImpliedProbability(1)).toThrow('Decimal odds must be greater than 1');
  });

  it('multiplies decimal odds', () => {
    expect(multiplyDecimalOdds([1.2, 2, 3])).toBeCloseTo(7.2, 5);
  });

  it('formats probability as a percentage', () => {
    expect(formatProbability(0.276)).toBe('27.6%');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/domain/odds.test.ts
```

Expected: FAIL because `src/domain/odds.ts` does not exist.

- [ ] **Step 3: Create domain types**

Create `src/domain/types.ts`:

```ts
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
```

- [ ] **Step 4: Implement odds helpers**

Create `src/domain/odds.ts`:

```ts
export function decimalOddsToImpliedProbability(decimalOdds: number): number {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) {
    throw new Error('Decimal odds must be greater than 1');
  }

  return 1 / decimalOdds;
}

export function multiplyDecimalOdds(odds: number[]): number {
  return odds.reduce((product, value) => product * value, 1);
}

export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}
```

- [ ] **Step 5: Verify odds helpers**

Run:

```bash
npm test -- src/domain/odds.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit domain foundation**

```bash
git add src/domain/types.ts src/domain/odds.ts src/domain/odds.test.ts
git commit -m "feat: add betting domain types and odds helpers"
```

---

### Task 3: Parse Sportsbet-Style Slip Text

**Files:**
- Create: `src/domain/parser.ts`
- Create: `src/domain/parser.test.ts`

- [ ] **Step 1: Write parser tests**

Create `src/domain/parser.test.ts`:

```ts
import { parseSlipText } from './parser';

const sampleSlip = `
Same Game Multi @ 1450.00
15 Legs • Stake $15.00
San Antonio Spurs @ Oklahoma City Thunder
Tomorrow 31 May 10:10
Potential Winnings $21,750.00

Victor Wembanyama
To Score 25+ Points
Stephon Castle
To Score 15+ Points
Chet Holmgren
To Record 8+ Rebounds
Alex Caruso
2+ Made Threes
Cason Wallace
To Record 2+ Steals
`;

describe('parseSlipText', () => {
  it('extracts slip metadata and player prop legs', () => {
    const slip = parseSlipText(sampleSlip);

    expect(slip.totalOdds).toBe(1450);
    expect(slip.stake).toBe(15);
    expect(slip.potentialPayout).toBe(21750);
    expect(slip.game).toBe('San Antonio Spurs @ Oklahoma City Thunder');
    expect(slip.legs).toHaveLength(5);
    expect(slip.legs[0]).toMatchObject({
      player: 'Victor Wembanyama',
      marketFamily: 'points',
      threshold: 25,
      label: 'To Score 25+ Points',
    });
    expect(slip.legs[3]).toMatchObject({
      player: 'Alex Caruso',
      marketFamily: 'threes',
      threshold: 2,
      label: '2+ Made Threes',
    });
  });

  it('keeps unknown labels without dropping the leg', () => {
    const slip = parseSlipText('Same Game Multi @ 10.00\\nPlayer One\\nMystery Market');
    expect(slip.legs[0].marketFamily).toBe('unknown');
    expect(slip.legs[0].label).toBe('Mystery Market');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/domain/parser.test.ts
```

Expected: FAIL because `parseSlipText` is not defined.

- [ ] **Step 3: Implement parser**

Create `src/domain/parser.ts`:

```ts
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
  return /\d+(?:\.\d+)?\+/.test(line) || /moneyline|spread|total/i.test(line) || !looksLikePlayerName(line);
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
```

- [ ] **Step 4: Verify parser**

Run:

```bash
npm test -- src/domain/parser.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit parser**

```bash
git add src/domain/parser.ts src/domain/parser.test.ts
git commit -m "feat: parse Sportsbet slip text"
```

---

### Task 4: Add Rule-Based Line Ratings

**Files:**
- Create: `src/domain/rating.ts`
- Create: `src/domain/rating.test.ts`

- [ ] **Step 1: Write rating tests**

Create `src/domain/rating.test.ts`:

```ts
import type { NormalizedLeg } from './types';
import { rateLeg } from './rating';

function leg(overrides: Partial<NormalizedLeg>): NormalizedLeg {
  return {
    id: 'leg-1',
    player: 'Chet Holmgren',
    marketFamily: 'rebounds',
    threshold: 8,
    label: 'To Record 8+ Rebounds',
    sourceText: 'Chet Holmgren\nTo Record 8+ Rebounds',
    ...overrides,
  };
}

describe('rateLeg', () => {
  it('rates low threshold role props as stronger', () => {
    const rated = rateLeg(leg({ threshold: 4, label: 'To Record 4+ Rebounds' }));
    expect(rated.trafficLight).toBe('green');
    expect(rated.score).toBeGreaterThanOrEqual(7);
    expect(rated.reasons).toContain('Low threshold for this market family.');
  });

  it('marks high threshold props as fragile', () => {
    const rated = rateLeg(leg({ marketFamily: 'points', threshold: 25, label: 'To Score 25+ Points' }));
    expect(rated.trafficLight).toBe('yellow');
    expect(rated.riskTags).toContain('high-threshold');
  });

  it('uses implied probability when odds are present', () => {
    const rated = rateLeg(leg({ odds: 2 }));
    expect(rated.impliedProbability).toBe(0.5);
    expect(rated.edge).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/domain/rating.test.ts
```

Expected: FAIL because `rateLeg` is not defined.

- [ ] **Step 3: Implement rating engine**

Create `src/domain/rating.ts`:

```ts
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
```

- [ ] **Step 4: Verify ratings**

Run:

```bash
npm test -- src/domain/rating.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit ratings**

```bash
git add src/domain/rating.ts src/domain/rating.test.ts
git commit -m "feat: rate normalized bet legs"
```

---

### Task 5: Diagnose Imported Slips

**Files:**
- Create: `src/domain/diagnosis.ts`
- Create: `src/domain/diagnosis.test.ts`

- [ ] **Step 1: Write diagnosis tests**

Create `src/domain/diagnosis.test.ts`:

```ts
import { diagnoseSlip } from './diagnosis';
import type { Slip } from './types';

const slip: Slip = {
  id: 'slip-1',
  title: 'Same Game Multi @ 900.00',
  game: 'San Antonio Spurs @ Oklahoma City Thunder',
  totalOdds: 900,
  stake: 5,
  legs: [
    {
      id: 'leg-1',
      player: 'Cason Wallace',
      marketFamily: 'steals',
      threshold: 2,
      label: 'To Record 2+ Steals',
      sourceText: '',
    },
    {
      id: 'leg-2',
      player: 'Cason Wallace',
      marketFamily: 'threes',
      threshold: 2,
      label: '2+ Made Threes',
      sourceText: '',
    },
    {
      id: 'leg-3',
      player: 'Victor Wembanyama',
      marketFamily: 'points',
      threshold: 25,
      label: 'To Score 25+ Points',
      sourceText: '',
    },
  ],
};

describe('diagnoseSlip', () => {
  it('rates legs and flags concentration risk', () => {
    const diagnosis = diagnoseSlip(slip);
    expect(diagnosis.ratedLegs).toHaveLength(3);
    expect(diagnosis.riskTags).toContain('same-player-concentration');
    expect(diagnosis.riskTags).toContain('high-variance-defensive-events');
    expect(diagnosis.weakestLegIds.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/domain/diagnosis.test.ts
```

Expected: FAIL because `diagnoseSlip` is not defined.

- [ ] **Step 3: Implement diagnosis**

Create `src/domain/diagnosis.ts`:

```ts
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
```

- [ ] **Step 4: Verify diagnosis**

Run:

```bash
npm test -- src/domain/diagnosis.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit diagnosis**

```bash
git add src/domain/diagnosis.ts src/domain/diagnosis.test.ts
git commit -m "feat: diagnose imported multis"
```

---

### Task 6: Build Multi Suggestions

**Files:**
- Create: `src/domain/multiBuilder.ts`
- Create: `src/domain/multiBuilder.test.ts`

- [ ] **Step 1: Write multi builder tests**

Create `src/domain/multiBuilder.test.ts`:

```ts
import type { RatedLeg } from './types';
import { buildMultiSuggestions } from './multiBuilder';

function ratedLeg(id: string, score: number, player: string): RatedLeg {
  return {
    id,
    player,
    marketFamily: 'points',
    threshold: 10,
    label: 'To Score 10+ Points',
    sourceText: '',
    trafficLight: score >= 7 ? 'green' : 'yellow',
    score,
    estimatedProbability: 0.35 + score * 0.055,
    confidence: 'medium',
    reasons: ['Test leg'],
    riskTags: [],
  };
}

describe('buildMultiSuggestions', () => {
  it('creates four modes', () => {
    const legs = Array.from({ length: 24 }, (_, index) => ratedLeg(`leg-${index}`, 9 - (index % 5), `Player ${index}`));
    const suggestions = buildMultiSuggestions(legs);
    expect(suggestions.map((suggestion) => suggestion.mode)).toEqual([
      'conservative',
      'balanced',
      'aggressive',
      'lotto',
    ]);
  });

  it('uses more legs for aggressive modes', () => {
    const legs = Array.from({ length: 24 }, (_, index) => ratedLeg(`leg-${index}`, 8, `Player ${index}`));
    const suggestions = buildMultiSuggestions(legs);
    const conservative = suggestions.find((suggestion) => suggestion.mode === 'conservative');
    const lotto = suggestions.find((suggestion) => suggestion.mode === 'lotto');
    expect(lotto?.legs.length).toBeGreaterThan(conservative?.legs.length ?? 0);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/domain/multiBuilder.test.ts
```

Expected: FAIL because `buildMultiSuggestions` is not defined.

- [ ] **Step 3: Implement multi builder**

Create `src/domain/multiBuilder.ts`:

```ts
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
```

- [ ] **Step 4: Verify multi builder**

Run:

```bash
npm test -- src/domain/multiBuilder.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit multi builder**

```bash
git add src/domain/multiBuilder.ts src/domain/multiBuilder.test.ts
git commit -m "feat: build multi suggestions"
```

---

### Task 7: Add Result Tracking And Local Persistence

**Files:**
- Create: `src/domain/results.ts`
- Create: `src/domain/results.test.ts`
- Create: `src/services/storage.ts`
- Create: `src/services/storage.test.ts`

- [ ] **Step 1: Write result helper tests**

Create `src/domain/results.test.ts`:

```ts
import type { SavedSlip } from './types';
import { summarizeResults } from './results';

const slips: SavedSlip[] = [
  {
    id: 'slip-1',
    title: 'Win',
    savedAt: '2026-05-31T00:00:00.000Z',
    status: 'settled',
    stake: 5,
    potentialPayout: 500,
    legs: [],
    legResults: {},
    profitLoss: 495,
  },
  {
    id: 'slip-2',
    title: 'Loss',
    savedAt: '2026-05-31T00:00:00.000Z',
    status: 'settled',
    stake: 10,
    potentialPayout: 1000,
    legs: [],
    legResults: {},
    profitLoss: -10,
  },
];

describe('summarizeResults', () => {
  it('summarizes settled slips', () => {
    expect(summarizeResults(slips)).toEqual({
      totalStaked: 15,
      profitLoss: 485,
      settledCount: 2,
      winCount: 1,
      lossCount: 1,
    });
  });
});
```

Create `src/services/storage.test.ts`:

```ts
import type { SavedSlip } from '../domain/types';
import { createSlipStorage } from './storage';

describe('createSlipStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves and loads slips', () => {
    const storage = createSlipStorage('test-slips');
    const slip: SavedSlip = {
      id: 'slip-1',
      title: 'Saved slip',
      savedAt: '2026-05-31T00:00:00.000Z',
      status: 'suggested',
      legs: [],
      legResults: {},
    };

    storage.saveSlip(slip);
    expect(storage.loadSlips()).toEqual([slip]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/domain/results.test.ts src/services/storage.test.ts
```

Expected: FAIL because the result and storage modules do not exist.

- [ ] **Step 3: Implement result helpers**

Create `src/domain/results.ts`:

```ts
import type { SavedSlip } from './types';

export interface ResultSummary {
  totalStaked: number;
  profitLoss: number;
  settledCount: number;
  winCount: number;
  lossCount: number;
}

export function summarizeResults(slips: SavedSlip[]): ResultSummary {
  const settled = slips.filter((slip) => slip.status === 'settled');

  return settled.reduce<ResultSummary>(
    (summary, slip) => {
      const profitLoss = slip.profitLoss ?? 0;
      return {
        totalStaked: summary.totalStaked + (slip.stake ?? 0),
        profitLoss: summary.profitLoss + profitLoss,
        settledCount: summary.settledCount + 1,
        winCount: summary.winCount + (profitLoss > 0 ? 1 : 0),
        lossCount: summary.lossCount + (profitLoss <= 0 ? 1 : 0),
      };
    },
    {
      totalStaked: 0,
      profitLoss: 0,
      settledCount: 0,
      winCount: 0,
      lossCount: 0,
    },
  );
}
```

- [ ] **Step 4: Implement local storage**

Create `src/services/storage.ts`:

```ts
import type { SavedSlip } from '../domain/types';

export interface SlipStorage {
  loadSlips(): SavedSlip[];
  saveSlip(slip: SavedSlip): void;
  updateSlip(slip: SavedSlip): void;
}

export function createSlipStorage(key = 'nba-multi-assistant-slips'): SlipStorage {
  return {
    loadSlips() {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      return JSON.parse(raw) as SavedSlip[];
    },
    saveSlip(slip) {
      const slips = this.loadSlips();
      window.localStorage.setItem(key, JSON.stringify([slip, ...slips]));
    },
    updateSlip(updatedSlip) {
      const slips = this.loadSlips().map((slip) => (slip.id === updatedSlip.id ? updatedSlip : slip));
      window.localStorage.setItem(key, JSON.stringify(slips));
    },
  };
}
```

- [ ] **Step 5: Verify result tracking**

Run:

```bash
npm test -- src/domain/results.test.ts src/services/storage.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit result tracking**

```bash
git add src/domain/results.ts src/domain/results.test.ts src/services/storage.ts src/services/storage.test.ts
git commit -m "feat: track local slip results"
```

---

### Task 8: Add OCR And Guardrail Services

**Files:**
- Create: `src/services/ocr.ts`
- Create: `src/services/guardrails.ts`
- Create: `src/services/guardrails.test.ts`

- [ ] **Step 1: Write guardrail tests**

Create `src/services/guardrails.test.ts`:

```ts
import { assertBrowserActionAllowed } from './guardrails';

describe('assertBrowserActionAllowed', () => {
  it('allows scanning actions', () => {
    expect(() => assertBrowserActionAllowed('read-odds')).not.toThrow();
    expect(() => assertBrowserActionAllowed('add-leg-to-slip')).not.toThrow();
  });

  it('blocks wallet and bet confirmation actions', () => {
    expect(() => assertBrowserActionAllowed('deposit-money')).toThrow('Blocked browser action');
    expect(() => assertBrowserActionAllowed('confirm-bet')).toThrow('Blocked browser action');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/services/guardrails.test.ts
```

Expected: FAIL because `assertBrowserActionAllowed` is not defined.

- [ ] **Step 3: Implement guardrails**

Create `src/services/guardrails.ts`:

```ts
export type BrowserAction =
  | 'open-sportsbet'
  | 'navigate-market'
  | 'read-odds'
  | 'expand-market-group'
  | 'add-leg-to-slip'
  | 'deposit-money'
  | 'add-wallet-funds'
  | 'confirm-bet'
  | 'change-account-settings';

const BLOCKED_ACTIONS = new Set<BrowserAction>([
  'deposit-money',
  'add-wallet-funds',
  'confirm-bet',
  'change-account-settings',
]);

export function assertBrowserActionAllowed(action: BrowserAction): void {
  if (BLOCKED_ACTIONS.has(action)) {
    throw new Error(`Blocked browser action: ${action}`);
  }
}
```

- [ ] **Step 4: Add OCR wrapper**

Create `src/services/ocr.ts`:

```ts
import { createWorker } from 'tesseract.js';

export async function readSlipImage(file: File): Promise<string> {
  const worker = await createWorker('eng');

  try {
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}
```

- [ ] **Step 5: Verify guardrails**

Run:

```bash
npm test -- src/services/guardrails.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit OCR and guardrails**

```bash
git add src/services/ocr.ts src/services/guardrails.ts src/services/guardrails.test.ts
git commit -m "feat: add OCR service and betting guardrails"
```

---

### Task 9: Build Dashboard Components

**Files:**
- Create: `src/components/SlipInput.tsx`
- Create: `src/components/SlipSummary.tsx`
- Create: `src/components/LegTable.tsx`
- Create: `src/components/MultiBuilderPanel.tsx`
- Create: `src/components/HistoryPanel.tsx`
- Create: `src/components/ChatPanel.tsx`
- Create: `src/components/SlipInput.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write SlipInput component test**

Create `src/components/SlipInput.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlipInput } from './SlipInput';

describe('SlipInput', () => {
  it('submits pasted slip text', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SlipInput onSubmitText={onSubmit} onUploadImage={vi.fn()} isReadingImage={false} />);

    await user.type(screen.getByLabelText('Sportsbet slip text'), 'Same Game Multi @ 10.00');
    await user.click(screen.getByRole('button', { name: 'Analyze Slip' }));

    expect(onSubmit).toHaveBeenCalledWith('Same Game Multi @ 10.00');
  });
});
```

- [ ] **Step 2: Run component test to verify failure**

Run:

```bash
npm test -- src/components/SlipInput.test.tsx
```

Expected: FAIL because `SlipInput` is not defined.

- [ ] **Step 3: Create SlipInput**

Create `src/components/SlipInput.tsx`:

```tsx
import { ImageUp, ScanText } from 'lucide-react';
import { useState } from 'react';

interface SlipInputProps {
  onSubmitText(text: string): void;
  onUploadImage(file: File): void;
  isReadingImage: boolean;
}

export function SlipInput({ onSubmitText, onUploadImage, isReadingImage }: SlipInputProps) {
  const [text, setText] = useState('');

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Slip Input</h2>
        <span className="eyebrow">Paste or upload</span>
      </div>
      <label className="field-label" htmlFor="slip-text">
        Sportsbet slip text
      </label>
      <textarea
        id="slip-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="slip-text-help"
      />
      <p id="slip-text-help" className="field-help">
        Paste the Sportsbet slip text here.
      </p>
      <div className="button-row">
        <button type="button" className="primary-button" onClick={() => onSubmitText(text)}>
          <ScanText size={18} />
          Analyze Slip
        </button>
        <label className="secondary-button">
          <ImageUp size={18} />
          {isReadingImage ? 'Reading Image' : 'Upload Screenshot'}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadImage(file);
              }
            }}
          />
        </label>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create display components**

Create `src/components/SlipSummary.tsx`:

```tsx
import type { SlipDiagnosis } from '../domain/types';

interface SlipSummaryProps {
  diagnosis?: SlipDiagnosis;
}

export function SlipSummary({ diagnosis }: SlipSummaryProps) {
  if (!diagnosis) {
    return (
      <section className="panel empty-state">
        <h2>No slip loaded</h2>
        <p>Paste a Sportsbet multi or upload a screenshot to start the analysis.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{diagnosis.slip.title}</h2>
        <span className="eyebrow">{diagnosis.slip.legs.length} legs</span>
      </div>
      <p className="summary-copy">{diagnosis.summary}</p>
      <div className="metrics-grid">
        <div>
          <span>Stake</span>
          <strong>{diagnosis.slip.stake ? `$${diagnosis.slip.stake.toFixed(2)}` : '-'}</strong>
        </div>
        <div>
          <span>Odds</span>
          <strong>{diagnosis.slip.totalOdds?.toFixed(2) ?? '-'}</strong>
        </div>
        <div>
          <span>Potential</span>
          <strong>{diagnosis.slip.potentialPayout ? `$${diagnosis.slip.potentialPayout.toLocaleString()}` : '-'}</strong>
        </div>
      </div>
      <div className="tag-row">
        {diagnosis.riskTags.map((tag) => (
          <span key={tag} className="risk-tag">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
```

Create `src/components/LegTable.tsx`:

```tsx
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
```

Create `src/components/MultiBuilderPanel.tsx`:

```tsx
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
```

Create `src/components/HistoryPanel.tsx`:

```tsx
import { summarizeResults } from '../domain/results';
import type { SavedSlip } from '../domain/types';

interface HistoryPanelProps {
  slips: SavedSlip[];
}

export function HistoryPanel({ slips }: HistoryPanelProps) {
  const summary = summarizeResults(slips);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>History</h2>
        <span className="eyebrow">{slips.length} saved</span>
      </div>
      <div className="metrics-grid">
        <div>
          <span>Staked</span>
          <strong>${summary.totalStaked.toFixed(2)}</strong>
        </div>
        <div>
          <span>P/L</span>
          <strong>${summary.profitLoss.toFixed(2)}</strong>
        </div>
        <div>
          <span>Settled</span>
          <strong>{summary.settledCount}</strong>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/ChatPanel.tsx`:

```tsx
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
```

- [ ] **Step 5: Update App wiring**

Replace `src/App.tsx` with:

```tsx
import { useMemo, useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LegTable } from './components/LegTable';
import { MultiBuilderPanel } from './components/MultiBuilderPanel';
import { SlipInput } from './components/SlipInput';
import { SlipSummary } from './components/SlipSummary';
import { buildMultiSuggestions } from './domain/multiBuilder';
import { diagnoseSlip } from './domain/diagnosis';
import { parseSlipText } from './domain/parser';
import type { SavedSlip, Slip, SlipDiagnosis } from './domain/types';
import { readSlipImage } from './services/ocr';
import { createSlipStorage } from './services/storage';

const storage = createSlipStorage();

export default function App() {
  const [diagnosis, setDiagnosis] = useState<SlipDiagnosis>();
  const [savedSlips, setSavedSlips] = useState<SavedSlip[]>(() => storage.loadSlips());
  const [isReadingImage, setIsReadingImage] = useState(false);

  const suggestions = useMemo(
    () => (diagnosis ? buildMultiSuggestions(diagnosis.ratedLegs) : []),
    [diagnosis],
  );

  function analyzeText(text: string) {
    const slip = parseSlipText(text);
    setDiagnosis(diagnoseSlip(slip));
  }

  async function uploadImage(file: File) {
    setIsReadingImage(true);
    try {
      const text = await readSlipImage(file);
      analyzeText(text);
    } finally {
      setIsReadingImage(false);
    }
  }

  function saveCurrentSlip(status: SavedSlip['status']) {
    if (!diagnosis) {
      return;
    }

    const saved = toSavedSlip(diagnosis.slip, status);
    storage.saveSlip(saved);
    setSavedSlips(storage.loadSlips());
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>NBA Multi Assistant</h1>
          <p>Rate long Sportsbet same-game multis before you place them.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => saveCurrentSlip('suggested')}>
          Save Slip
        </button>
      </header>
      <div className="dashboard-grid">
        <div className="left-column">
          <SlipInput onSubmitText={analyzeText} onUploadImage={uploadImage} isReadingImage={isReadingImage} />
          <SlipSummary diagnosis={diagnosis} />
          <ChatPanel diagnosis={diagnosis} />
          <HistoryPanel slips={savedSlips} />
        </div>
        <div className="right-column">
          <LegTable legs={diagnosis?.ratedLegs ?? []} />
          <MultiBuilderPanel suggestions={suggestions} />
        </div>
      </div>
    </main>
  );
}

function toSavedSlip(slip: Slip, status: SavedSlip['status']): SavedSlip {
  return {
    ...slip,
    savedAt: new Date().toISOString(),
    status,
    legResults: Object.fromEntries(slip.legs.map((leg) => [leg.id, 'pending'])) as SavedSlip['legResults'],
  };
}
```

- [ ] **Step 6: Replace styles**

Replace `src/styles.css` with:

```css
:root {
  color: #16242f;
  background: #eef3f5;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  background: #eef3f5;
}

.topbar {
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #d8e1e6;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 18px 24px;
}

.topbar h1,
.panel h2,
.multi-card h3 {
  letter-spacing: 0;
  margin: 0;
}

.topbar h1 {
  font-size: 26px;
}

.topbar p,
.summary-copy,
.multi-card p,
.chat-response,
td span {
  color: #536471;
}

.dashboard-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  padding: 16px;
}

.left-column,
.right-column {
  display: grid;
  gap: 16px;
  align-content: start;
}

.panel {
  background: #ffffff;
  border: 1px solid #d8e1e6;
  border-radius: 8px;
  padding: 16px;
}

.panel-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panel h2 {
  font-size: 18px;
}

.eyebrow {
  color: #667780;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.field-label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
}

.field-help {
  color: #667780;
  font-size: 13px;
  margin: 8px 0 0;
}

textarea {
  border: 1px solid #c7d3da;
  border-radius: 8px;
  min-height: 180px;
  padding: 12px;
  resize: vertical;
  width: 100%;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.primary-button,
.secondary-button {
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
}

.primary-button {
  background: #0b67a3;
  border: 1px solid #0b67a3;
  color: #ffffff;
}

.secondary-button {
  background: #ffffff;
  border: 1px solid #b8c7d0;
  color: #16242f;
}

.secondary-button input {
  display: none;
}

.metrics-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 12px;
}

.metrics-grid div {
  background: #f5f7f8;
  border-radius: 8px;
  padding: 10px;
}

.metrics-grid span {
  color: #667780;
  display: block;
  font-size: 12px;
}

.metrics-grid strong {
  display: block;
  margin-top: 4px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.risk-tag {
  background: #fff1d6;
  border: 1px solid #f1c66d;
  border-radius: 999px;
  color: #6f4b00;
  font-size: 12px;
  padding: 4px 8px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  min-width: 760px;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #e1e8ec;
  padding: 10px;
  text-align: left;
  vertical-align: top;
}

th {
  color: #536471;
  font-size: 12px;
  text-transform: uppercase;
}

td strong,
td span {
  display: block;
}

.light {
  border-radius: 999px;
  color: #ffffff;
  display: inline-block;
  font-weight: 800;
  padding: 4px 8px;
}

.light.green {
  background: #168a51;
}

.light.yellow {
  background: #b7791f;
}

.light.red {
  background: #bd2f2f;
}

.multi-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.multi-card {
  border: 1px solid #d8e1e6;
  border-radius: 8px;
  padding: 12px;
}

.multi-card h3 {
  font-size: 16px;
}

.multi-card ol {
  margin: 12px 0 0;
  padding-left: 20px;
}

.compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.empty-state {
  min-height: 140px;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 7: Verify dashboard components**

Run:

```bash
npm test -- src/components/SlipInput.test.tsx
npm run build
```

Expected: PASS and build completes without TypeScript errors.

- [ ] **Step 8: Commit dashboard**

```bash
git add src/App.tsx src/styles.css src/components
git commit -m "feat: add NBA multi dashboard"
```

---

### Task 10: Final Verification And Browser Check

**Files:**
- Modify: none unless verification finds a defect.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm test
npm run build
```

Expected: every test passes and the production build completes.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite serves the app at `http://127.0.0.1:5173/` or another displayed local port.

- [ ] **Step 3: Browser smoke test**

Open the local URL and verify:

- The dashboard loads without a blank screen.
- The slip text box accepts pasted Sportsbet text.
- Clicking `Analyze Slip` populates summary, ratings, generated multis, and chat analyst text.
- Upload screenshot button opens a file picker.
- The layout does not overlap at desktop width.
- The layout stacks cleanly at mobile width.

- [ ] **Step 4: Commit any verification fixes**

If Step 3 finds a defect, fix the defect and commit with a specific message such as:

```bash
git add src
git commit -m "fix: correct dashboard smoke test issue"
```

If Step 3 finds no defect, do not create an empty commit.
