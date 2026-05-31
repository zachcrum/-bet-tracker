import { render, screen } from '@testing-library/react';
import { HistoryPanel } from './HistoryPanel';
import type { SavedSlip } from '../domain/types';

describe('HistoryPanel', () => {
  it('renders saved slips with compact details', () => {
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

    render(<HistoryPanel slips={slips} />);

    expect(screen.getByText('Same Game Multi @ 10.00')).toBeInTheDocument();
    expect(screen.getByText('suggested')).toBeInTheDocument();
    expect(screen.getByText('Stake $0.00')).toBeInTheDocument();
    expect(screen.getByText('Odds 10.00')).toBeInTheDocument();
    expect(screen.getByText('1 leg')).toBeInTheDocument();
  });
});
