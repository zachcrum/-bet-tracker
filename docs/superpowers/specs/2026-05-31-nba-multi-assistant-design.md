# NBA Multi Assistant Design

## Goal

Build a local NBA betting assistant that scans current pre-game Sportsbet odds through the user's Chrome session, rates every available line, builds same-game multi candidates, and tracks results over time.

The assistant is designed for aggressive same-game multi betting, especially 10-20 leg slips with small stakes and high payout targets. It should still present risk honestly, separate payout appeal from confidence, and never claim certainty.

## Non-Goals

- Do not deposit funds.
- Do not confirm or place a bet without the user.
- Do not guarantee outcomes or imply a bet is safe because the payout is attractive.
- Do not require a paid odds API for the first version.
- Do not host user data in the cloud for the first version.

## Primary Users And Workflow

The primary user wants to scan NBA pre-game Sportsbet markets, find strong same-game multi legs, compare conservative through lotto-style slips, and track whether those recommendations perform over time.

Daily workflow:

1. Open the local dashboard.
2. Start an NBA pre-game Sportsbet scan.
3. Review rated markets and recommended same-game multis.
4. Ask the chat analyst to explain, replace, or rate legs.
5. Optionally let Chrome add selected legs to the Sportsbet slip.
6. Manually review and confirm any bet in Sportsbet.
7. After the game, record results and profit/loss for calibration.

## Core Features

### Sportsbet Scanner

The scanner uses Chrome automation with the user's logged-in Sportsbet session. It navigates NBA pre-game pages and captures available game markets, player props, alternate lines, and same-game multi markets.

Allowed browser actions:

- Open Sportsbet.
- Navigate NBA and game pages.
- Expand market groups.
- Read odds and market text.
- Add selected legs to a bet slip when explicitly requested.

Blocked browser actions:

- Deposit money.
- Add money to wallet.
- Confirm or place a bet.
- Change account settings.

If Sportsbet changes layout, blocks automation, or returns incomplete data, the scanner should fail gracefully and offer manual navigation, screenshot upload, or pasted market text as fallback input.

### Market Normalizer

The normalizer converts captured page data into structured line records.

Each line should include:

- Sport and league.
- Game.
- Start time.
- Team and opponent.
- Player, when applicable.
- Market family, such as points, rebounds, assists, threes, steals, blocks, moneyline, spread, total, quarter, or half.
- Threshold, such as 10+ points or 4+ rebounds.
- Odds.
- Sportsbet source page.
- Captured timestamp.
- Raw text snapshot for auditability.

The normalizer should support low-threshold same-game multi legs like 10+ points, 4+ rebounds, 2+ assists, 2+ made threes, 1+ steals, and 2+ blocks, because these appear frequently in the user's current betting style.

### Analysis Engine

The analysis engine rates each line using odds, public context, and historical performance.

Inputs should include:

- Sportsbet odds and line movement from repeated scans.
- Player role, minutes, usage, and recent form.
- Injury status and lineup adjustments.
- Matchup, pace, defensive tendencies, and game environment.
- Rest, schedule, travel, and back-to-back context.
- Team news and expected rotations.
- User bet history and past calibration data.

Each line receives:

- Traffic light: green, yellow, or red.
- 1-10 score.
- Estimated hit probability.
- Implied probability from odds.
- Estimated edge.
- Confidence level.
- Plain-English reasoning.
- Risk tags, such as injury-dependent, minutes-risk, blowout-risk, role-change, poor value, correlated, or stale-data.

The assistant should mark confidence lower when injury, lineup, or source data is stale, missing, or uncertain.

### Multi Builder

The multi builder creates multiple candidate slips side by side:

- Conservative.
- Balanced.
- Aggressive.
- Lotto.

The default user profile should lean aggressive, targeting 10-20 legs, small stakes, and high payout ranges around 1000-1500:1 when available. The assistant should also create lower-risk alternatives so the user can compare the tradeoff.

The builder should consider:

- Individual line ratings.
- Target payout range.
- Leg count.
- Same-player concentration.
- Same-team concentration.
- Correlation between legs.
- Game script assumptions.
- Injury dependency.
- Whether a single event can sink multiple legs.
- Whether the payout compensates for the added risk.

The builder should explain why each slip exists, which legs are strongest, which legs are weakest, and what scenario the slip needs to hit.

### Multi Diagnosis

The assistant should accept existing slips through screenshots, OCR, pasted text, or manual entry.

For an uploaded slip, the assistant should:

- Extract all legs.
- Identify market type, player, threshold, game, stake, odds, and potential payout where possible.
- Rate each leg with the same line-rating system.
- Flag fragile legs.
- Flag duplicated exposure and correlation.
- Identify whether the multi is coherent around a game script.
- Suggest replacements or removals.

This supports analysis of existing Sportsbet same-game multis such as long 15-17 leg slips with repeated player props, low thresholds, and high payout targets.

### Chat Analyst

The dashboard should include a chat analyst backed by the current scan, ratings, and saved history.

Example prompts:

- "Build me an aggressive Thunder vs Spurs SGM."
- "Rate this multi."
- "Which legs are weakest?"
- "Replace the riskiest three legs."
- "Why is this line yellow?"
- "Show me safer versions of this slip."
- "Which props depend most on Wembanyama minutes?"

The chat analyst should answer from structured data and explain uncertainty instead of inventing unavailable context.

### Result Tracking And Calibration

The assistant should save suggested and placed slips.

Each saved slip should include:

- Date and game.
- Stake.
- Total odds and potential payout.
- All legs.
- Rating, probability, edge, and confidence at placement time.
- Whether the leg won, lost, voided, or pushed.
- Final slip result.
- Profit/loss.
- Notes about key misses, such as injury, minutes, blowout, foul trouble, or variance.

Over time, the system should report:

- Performance by market type.
- Performance by player/team.
- Performance by rating bucket.
- Performance by confidence bucket.
- Performance by slip type.
- Calibration, comparing estimated probabilities with actual outcomes.

## Architecture

### Local Dashboard

A local web app is the main interface. It shows scanned markets, line ratings, generated multis, slip diagnosis, chat, and history. The first version should be local-only and private on the user's machine.

### Browser Automation Layer

This layer controls Chrome for Sportsbet scanning and optional slip preparation. It should keep browser actions explicit and auditable.

### Data Layer

A local database stores:

- Scan snapshots.
- Normalized markets.
- Enriched context.
- Ratings.
- Generated slips.
- Placed slips.
- Results.
- Calibration metrics.

### Enrichment Layer

This layer gathers public NBA context from available sources. It should support a hybrid source model: public defaults first, then user-configured preferred sources later.

### Rating And Builder Services

These services evaluate lines and construct multis from normalized markets and enriched context. They should be testable without needing live Chrome access.

## Data Flow

1. The user starts an NBA scan.
2. Chrome opens Sportsbet and collects current pre-game NBA market data.
3. Raw scan snapshots are saved.
4. Captured data is normalized into structured market records.
5. Public context and historical data enrich the markets.
6. The analysis engine rates each line.
7. The multi builder creates conservative, balanced, aggressive, and lotto slips.
8. The user inspects, edits, or asks chat questions.
9. The user may request Chrome to add approved legs to the Sportsbet slip.
10. The assistant stops before final bet confirmation.
11. Results are recorded after the games.
12. Calibration reports update from the final outcomes.

## Reliability And Error Handling

- Store raw scan snapshots so parsed data can be audited.
- Show when a rating used stale or incomplete source data.
- Mark markets as unavailable when Sportsbet pages cannot be parsed confidently.
- Preserve partial scan results if one market group fails.
- Prefer manual review before any browser action that modifies a bet slip.
- Keep a clear action log for Chrome automation.
- Fall back to screenshot upload, manual navigation, or pasted text when scanning fails.

## Testing Strategy

Tests should cover:

- Parsing Sportsbet-style market text into normalized records.
- Calculating implied probability from odds.
- Producing line ratings from mocked injury, stat, and odds inputs.
- Building multis that respect leg count, target payout, and risk constraints.
- Detecting duplicated exposure and correlated legs.
- Verifying that deposit, wallet, and bet-confirmation actions are blocked.
- Running browser automation smoke tests against saved fixtures when live Sportsbet testing is unavailable.

## First Implementation Slice

The first useful version should deliver:

1. A local dashboard shell.
2. Manual slip entry and screenshot/OCR-oriented slip diagnosis.
3. Normalized market and leg data models.
4. Initial rule-based ratings with transparent reasoning.
5. Multi builder modes: conservative, balanced, aggressive, and lotto.
6. Local result tracking.
7. Chrome Sportsbet scanning as the next major slice after the analysis loop works on manually entered or captured data.

This order gets the analysis and tracking loop working before depending on fragile live-site automation.

