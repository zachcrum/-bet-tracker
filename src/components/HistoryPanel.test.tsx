import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPanel } from './HistoryPanel';
import type { SavedSlip } from '../domain/types';

describe('HistoryPanel', () => {
  const slips: SavedSlip[] = [
    {
      id: 'slip-1',
      title: 'Same Game Multi @ 10.00',
      stake: 0,
      totalOdds: 10,
      legs: [
        {
          id: 'leg-1',
          marketFamily: 'points',
          label: 'Score 20+ Points',
          sourceText: 'Score 20+ Points',
        },
      ],
      savedAt: '2026-05-31T04:00:00.000Z',
      status: 'suggested',
      legResults: { 'leg-1': 'pending' },
    },
  ];

  it('renders saved slips with compact details', () => {
    render(<HistoryPanel slips={slips} />);

    expect(screen.getByText('Same Game Multi @ 10.00')).toBeInTheDocument();
    expect(screen.getByText('suggested')).toBeInTheDocument();
    expect(screen.getByText('Stake $0.00')).toBeInTheDocument();
    expect(screen.getByText('Odds 10.00')).toBeInTheDocument();
    expect(screen.getByText('1 leg')).toBeInTheDocument();
  });

  it('submits a profit/loss settlement for a saved slip', async () => {
    const user = userEvent.setup();
    const onSettleSlip = vi.fn();
    render(<HistoryPanel slips={slips} onSettleSlip={onSettleSlip} />);

    await user.type(screen.getByLabelText('Profit/loss for Same Game Multi @ 10.00'), '-15.5');
    await user.click(screen.getByRole('button', { name: 'Settle Same Game Multi @ 10.00' }));

    expect(onSettleSlip).toHaveBeenCalledWith(slips[0], -15.5);
  });

  it('does not settle a slip with a blank profit/loss value', async () => {
    const user = userEvent.setup();
    const onSettleSlip = vi.fn();
    render(<HistoryPanel slips={slips} onSettleSlip={onSettleSlip} />);

    await user.click(screen.getByRole('button', { name: 'Settle Same Game Multi @ 10.00' }));

    expect(onSettleSlip).not.toHaveBeenCalled();
  });
});
