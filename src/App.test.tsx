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

  it('analyzes pasted text, saves valid slips, and shows confirmation plus history entry', async () => {
    const user = userEvent.setup();
    render(<App />);

    const saveButton = screen.getByRole('button', { name: 'Save Slip' });
    expect(saveButton).toBeDisabled();

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
