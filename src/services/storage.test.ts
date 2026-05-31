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

  it.each([
    ['bad json', '{bad json'],
    ['null', 'null'],
    ['object', '{"id":"slip-1"}'],
    ['number', '123'],
  ])('returns an empty list for %s localStorage data', (_name, raw) => {
    window.localStorage.setItem('test-slips', raw);
    const storage = createSlipStorage('test-slips');

    expect(storage.loadSlips()).toEqual([]);
  });

  it('saves newest slips first and replaces duplicate ids', () => {
    const storage = createSlipStorage('test-slips');
    const first: SavedSlip = {
      id: 'slip-1',
      title: 'First slip',
      savedAt: '2026-05-31T00:00:00.000Z',
      status: 'suggested',
      legs: [],
      legResults: {},
    };
    const second: SavedSlip = {
      id: 'slip-2',
      title: 'Second slip',
      savedAt: '2026-05-31T01:00:00.000Z',
      status: 'suggested',
      legs: [],
      legResults: {},
    };
    const replacement: SavedSlip = {
      ...first,
      title: 'Updated first slip',
      savedAt: '2026-05-31T02:00:00.000Z',
    };

    storage.saveSlip(first);
    storage.saveSlip(second);
    storage.saveSlip(replacement);

    expect(storage.loadSlips()).toEqual([replacement, second]);
  });

  it('updates an existing slip and returns true', () => {
    const storage = createSlipStorage('test-slips');
    const slip: SavedSlip = {
      id: 'slip-1',
      title: 'Saved slip',
      savedAt: '2026-05-31T00:00:00.000Z',
      status: 'suggested',
      legs: [],
      legResults: {},
    };
    const updatedSlip: SavedSlip = {
      ...slip,
      status: 'settled',
      profitLoss: 10,
    };

    storage.saveSlip(slip);

    expect(storage.updateSlip(updatedSlip)).toBe(true);
    expect(storage.loadSlips()).toEqual([updatedSlip]);
  });

  it('does not save a missing slip update and returns false', () => {
    const storage = createSlipStorage('test-slips');
    const slip: SavedSlip = {
      id: 'slip-1',
      title: 'Saved slip',
      savedAt: '2026-05-31T00:00:00.000Z',
      status: 'suggested',
      legs: [],
      legResults: {},
    };

    expect(storage.updateSlip(slip)).toBe(false);
    expect(storage.loadSlips()).toEqual([]);
  });
});
