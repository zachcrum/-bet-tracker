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
