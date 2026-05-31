import { assertBrowserActionAllowed, type BrowserAction } from './guardrails';

describe('assertBrowserActionAllowed', () => {
  it('allows scanning actions', () => {
    expect(() => assertBrowserActionAllowed('read-odds')).not.toThrow();
  });

  it('allows pre-confirmation slip preparation while final confirmation stays blocked', () => {
    expect(() => assertBrowserActionAllowed('add-leg-to-slip')).not.toThrow();
    expect(() => assertBrowserActionAllowed('confirm-bet')).toThrow('Blocked browser action');
  });

  it.each<BrowserAction>([
    'deposit-money',
    'add-wallet-funds',
    'confirm-bet',
    'change-account-settings',
  ])('blocks %s', (action) => {
    expect(() => assertBrowserActionAllowed(action)).toThrow(`Blocked browser action: ${action}`);
  });

  it('blocks unknown runtime actions', () => {
    const unknownAction = 'withdraw-money' as BrowserAction;

    expect(() => assertBrowserActionAllowed(unknownAction)).toThrow(
      'Unknown browser action: withdraw-money',
    );
  });
});
