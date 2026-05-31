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

const ALLOWED_ACTIONS = new Set<BrowserAction>([
  'open-sportsbet',
  'navigate-market',
  'read-odds',
  'expand-market-group',
  // Pre-confirmation slip preparation only. Final bet confirmation remains blocked.
  'add-leg-to-slip',
]);

const BLOCKED_ACTIONS = new Set<BrowserAction>([
  'deposit-money',
  'add-wallet-funds',
  'confirm-bet',
  'change-account-settings',
]);

export function assertBrowserActionAllowed(action: BrowserAction): void {
  if (ALLOWED_ACTIONS.has(action)) {
    return;
  }

  if (BLOCKED_ACTIONS.has(action)) {
    throw new Error(`Blocked browser action: ${action}`);
  }

  throw new Error(`Unknown browser action: ${action}`);
}
