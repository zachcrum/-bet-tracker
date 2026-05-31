import type { SavedSlip } from '../domain/types';

const validStatuses = new Set<SavedSlip['status']>(['suggested', 'placed', 'settled']);

export interface SlipStorage {
  loadSlips(): SavedSlip[];
  saveSlip(slip: SavedSlip): void;
  updateSlip(slip: SavedSlip): boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSavedSlip(value: unknown): value is SavedSlip {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.savedAt === 'string' &&
    typeof value.status === 'string' &&
    validStatuses.has(value.status as SavedSlip['status']) &&
    Array.isArray(value.legs) &&
    isRecord(value.legResults)
  );
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
        return Array.isArray(parsed) ? parsed.filter(isSavedSlip) : [];
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
