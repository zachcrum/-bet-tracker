import type { SavedSlip } from '../domain/types';

export interface SlipStorage {
  loadSlips(): SavedSlip[];
  saveSlip(slip: SavedSlip): void;
  updateSlip(slip: SavedSlip): boolean;
}

export function createSlipStorage(key = 'nba-multi-assistant-slips'): SlipStorage {
  return {
    loadSlips() {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as SavedSlip[]) : [];
      } catch {
        return [];
      }
    },
    saveSlip(slip) {
      const slips = this.loadSlips().filter((savedSlip) => savedSlip.id !== slip.id);
      window.localStorage.setItem(key, JSON.stringify([slip, ...slips]));
    },
    updateSlip(updatedSlip) {
      let didUpdate = false;
      const slips = this.loadSlips().map((slip) => {
        if (slip.id !== updatedSlip.id) {
          return slip;
        }

        didUpdate = true;
        return updatedSlip;
      });

      if (!didUpdate) {
        return false;
      }

      window.localStorage.setItem(key, JSON.stringify(slips));
      return true;
    },
  };
}
