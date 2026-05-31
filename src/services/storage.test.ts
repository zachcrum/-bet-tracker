import type { SavedSlip } from '../domain/types';
import { createSlipStorage } from './storage';

const validSlip: SavedSlip = {
  id: 'slip-1',
  title: 'Saved slip',
  savedAt: '2026-05-31T00:00:00.000Z',
  status: 'suggested',
  legs: [],
  legResults: {},
};

describe('createSlipStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves and loads slips', () => {
    const storage = createSlipStorage('test-slips');

    storage.saveSlip(validSlip);
    expect(storage.loadSlips()).toEqual([validSlip]);
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

  it.each([
    ['null entry', [null]],
    ['empty object entry', [{}]],
  ])('returns an empty list for arrays with %s', (_name, storedValue) => {
    window.localStorage.setItem('test-slips', JSON.stringify(storedValue));
    const storage = createSlipStorage('test-slips');

    expect(storage.loadSlips()).toEqual([]);
  });

  it('filters invalid array records while keeping valid slips', () => {
    const validPlacedSlip: SavedSlip = {
      ...validSlip,
      id: 'slip-2',
      title: 'Placed slip',
      status: 'placed',
    };

    window.localStorage.setItem(
      'test-slips',
      JSON.stringify([
        null,
        {},
        { ...validSlip, id: 123 },
        { ...validSlip, title: null },
        { ...validSlip, savedAt: 123 },
        { ...validSlip, status: 'closed' },
        { ...validSlip, legs: {} },
        { ...validSlip, legResults: null },
        validPlacedSlip,
      ]),
    );

    const storage = createSlipStorage('test-slips');

    expect(storage.loadSlips()).toEqual([validPlacedSlip]);
  });

  it('does not crash when saving after malformed array entries', () => {
    window.localStorage.setItem('test-slips', JSON.stringify([null, {}, validSlip]));
    const storage = createSlipStorage('test-slips');
    const newestSlip: SavedSlip = {
      ...validSlip,
      id: 'slip-2',
      title: 'Newest slip',
    };

    expect(() => storage.saveSlip(newestSlip)).not.toThrow();
    expect(storage.loadSlips()).toEqual([newestSlip, validSlip]);
  });

  it('does not crash when updating after malformed array entries', () => {
    window.localStorage.setItem('test-slips', JSON.stringify([null, {}, validSlip]));
    const storage = createSlipStorage('test-slips');
    const updatedSlip: SavedSlip = {
      ...validSlip,
      status: 'settled',
      profitLoss: 10,
    };
    let updateResult: boolean | undefined;

    expect(() => {
      updateResult = storage.updateSlip(updatedSlip);
    }).not.toThrow();
    expect(updateResult).toBe(true);
    expect(storage.loadSlips()).toEqual([updatedSlip]);
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
    const updatedSlip: SavedSlip = {
      ...validSlip,
      status: 'settled',
      profitLoss: 10,
    };

    storage.saveSlip(validSlip);

    expect(storage.updateSlip(updatedSlip)).toBe(true);
    expect(storage.loadSlips()).toEqual([updatedSlip]);
  });

  it('does not save a missing slip update and returns false', () => {
    const storage = createSlipStorage('test-slips');

    expect(storage.updateSlip(validSlip)).toBe(false);
    expect(storage.loadSlips()).toEqual([]);
  });
});
