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
