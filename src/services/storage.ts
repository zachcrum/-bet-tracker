import type { SavedSlip } from '../domain/types';

export interface SlipStorage {
  loadSlips(): SavedSlip[];
  saveSlip(slip: SavedSlip): void;
  updateSlip(slip: SavedSlip): void;
}

export function createSlipStorage(key = 'nba-multi-assistant-slips'): SlipStorage {
  return {
    loadSlips() {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      return JSON.parse(raw) as SavedSlip[];
    },
    saveSlip(slip) {
      const slips = this.loadSlips();
      window.localStorage.setItem(key, JSON.stringify([slip, ...slips]));
    },
    updateSlip(updatedSlip) {
      const slips = this.loadSlips().map((slip) => (slip.id === updatedSlip.id ? updatedSlip : slip));
      window.localStorage.setItem(key, JSON.stringify(slips));
    },
  };
}
