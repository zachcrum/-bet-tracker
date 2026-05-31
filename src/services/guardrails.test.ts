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
