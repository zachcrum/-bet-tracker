import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { readSlipImage } from './services/ocr';

vi.mock('./services/ocr', () => ({
  readSlipImage: vi.fn(),
}));

const slipText = `Same Game Multi @ 10.00
Boston Celtics @ New York Knicks
Jayson Tatum
To Score 20+ Points
Jaylen Brown
To Record 5+ Rebounds
Stake $0.00
Potential Winnings $0.00`;

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(readSlipImage).mockReset();
  });

  it('loads the Game 3 first bet by default and switches to the second bet', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Game 3 - San Antonio Spurs @ New York Knicks - Tuesday, 9 Jun 10:40 AEST')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bet 1 - 18 leg bonus-back multi/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Same Game Multi @ 1351.00' })).toBeInTheDocument();
    expect(screen.getByText('Any legs fail, get a $15.00 Bonus Bet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Slip' })).toBeEnabled();
    expect(screen.getAllByText('Jalen Brunson').length).toBeGreaterThan(0);
    expect(screen.getByText('To Score 25+ Points')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Bet 2 - 16 leg points and boards multi/i }));

    expect(screen.getByRole('button', { name: /Bet 1 - 18 leg bonus-back multi/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Bet 2 - 16 leg points and boards multi/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText('Karl-Anthony Towns').length).toBeGreaterThan(0);
    expect(screen.getByText('To Score 20+ Points')).toBeInTheDocument();
  });

  it('analyzes pasted text, saves valid slips, and shows confirmation plus history entry', async () => {
    const user = userEvent.setup();
    render(<App />);

    const saveButton = screen.getByRole('button', { name: 'Save Slip' });

    await user.type(screen.getByLabelText('Sportsbet slip text'), slipText);
    await user.click(screen.getByRole('button', { name: 'Analyze Slip' }));

    expect(screen.getByRole('heading', { name: 'Same Game Multi @ 10.00' })).toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(screen.getByRole('status')).toHaveTextContent('Slip saved.');
    const history = screen.getByRole('region', { name: 'History' });
    expect(within(history).getByText('Same Game Multi @ 10.00')).toBeInTheDocument();
    expect(within(history).getByText('Stake $0.00')).toBeInTheDocument();
  });

  it('settles a saved slip and updates result metrics in storage-backed history', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Sportsbet slip text'), slipText);
    await user.click(screen.getByRole('button', { name: 'Analyze Slip' }));
    await user.click(screen.getByRole('button', { name: 'Save Slip' }));

    const history = screen.getByRole('region', { name: 'History' });
    await user.type(within(history).getByLabelText('Profit/loss for Same Game Multi @ 10.00'), '25');
    await user.click(within(history).getByRole('button', { name: 'Settle Same Game Multi @ 10.00' }));

    expect(screen.getByRole('status')).toHaveTextContent('Slip settled.');
    expect(within(history).getByText('settled')).toBeInTheDocument();
    expect(within(history).getByText('P/L').nextSibling).toHaveTextContent('$25.00');
    expect(within(history).getByText('Settled').nextSibling).toHaveTextContent('1');

    const savedSlips = JSON.parse(window.localStorage.getItem('nba-multi-assistant-slips') ?? '[]');
    expect(savedSlips[0]).toMatchObject({
      status: 'settled',
      profitLoss: 25,
    });
  });

  it('shows OCR errors and clears them after a successful analyze', async () => {
    const user = userEvent.setup();
    vi.mocked(readSlipImage).mockRejectedValueOnce(new Error('OCR unavailable'));
    render(<App />);

    const file = new File(['image'], 'slip.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Upload Screenshot'), file);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not read screenshot. Try another image or paste the slip text.');

    await user.type(screen.getByLabelText('Sportsbet slip text'), slipText);
    await user.click(screen.getByRole('button', { name: 'Analyze Slip' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Same Game Multi @ 10.00' })).toBeInTheDocument();
  });

  it('shows an error when saving fails', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Sportsbet slip text'), slipText);
    await user.click(screen.getByRole('button', { name: 'Analyze Slip' }));

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    await user.click(screen.getByRole('button', { name: 'Save Slip' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Could not save slip. Check browser storage and try again.');

    setItem.mockRestore();
  });
});
