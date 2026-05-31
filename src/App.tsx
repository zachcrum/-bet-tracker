import { useMemo, useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LegTable } from './components/LegTable';
import { MultiBuilderPanel } from './components/MultiBuilderPanel';
import { SlipInput } from './components/SlipInput';
import { SlipSummary } from './components/SlipSummary';
import { diagnoseSlip } from './domain/diagnosis';
import { buildMultiSuggestions } from './domain/multiBuilder';
import { parseSlipText } from './domain/parser';
import type { SavedSlip, Slip, SlipDiagnosis } from './domain/types';
import { readSlipImage } from './services/ocr';
import { createSlipStorage } from './services/storage';

const storage = createSlipStorage();
type AppMessage = { type: 'success' | 'error'; text: string };

export default function App() {
  const [diagnosis, setDiagnosis] = useState<SlipDiagnosis>();
  const [savedSlips, setSavedSlips] = useState<SavedSlip[]>(() => storage.loadSlips());
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [message, setMessage] = useState<AppMessage>();

  const suggestions = useMemo(
    () => (diagnosis ? buildMultiSuggestions(diagnosis.ratedLegs) : []),
    [diagnosis],
  );

  function analyzeText(text: string) {
    const slip = parseSlipText(text);
    setDiagnosis(diagnoseSlip(slip));
    setMessage(undefined);
  }

  async function uploadImage(file: File) {
    if (isReadingImage) {
      return;
    }

    setIsReadingImage(true);
    setMessage(undefined);
    try {
      const text = await readSlipImage(file);
      analyzeText(text);
    } catch {
      setMessage({
        type: 'error',
        text: 'Could not read screenshot. Try another image or paste the slip text.',
      });
    } finally {
      setIsReadingImage(false);
    }
  }

  function saveCurrentSlip(status: SavedSlip['status']) {
    if (!diagnosis || diagnosis.slip.legs.length === 0) {
      setMessage({ type: 'error', text: 'Analyze a slip with at least one leg before saving.' });
      return;
    }

    const saved = toSavedSlip(diagnosis.slip, status);
    try {
      storage.saveSlip(saved);
      setSavedSlips(storage.loadSlips());
      setMessage({ type: 'success', text: 'Slip saved.' });
    } catch {
      setMessage({ type: 'error', text: 'Could not save slip. Check browser storage and try again.' });
    }
  }

  const canSave = Boolean(diagnosis && diagnosis.slip.legs.length > 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>NBA Multi Assistant</h1>
          <p>Rate long Sportsbet same-game multis before you place them.</p>
        </div>
        <button type="button" className="primary-button" disabled={!canSave} onClick={() => saveCurrentSlip('suggested')}>
          Save Slip
        </button>
      </header>
      {message ? (
        <div className={`app-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </div>
      ) : null}
      <div className="dashboard-grid">
        <div className="left-column">
          <SlipInput onSubmitText={analyzeText} onUploadImage={uploadImage} isReadingImage={isReadingImage} />
          <SlipSummary diagnosis={diagnosis} />
          <ChatPanel diagnosis={diagnosis} />
          <HistoryPanel slips={savedSlips} />
        </div>
        <div className="right-column">
          <LegTable legs={diagnosis?.ratedLegs ?? []} />
          <MultiBuilderPanel suggestions={suggestions} />
        </div>
      </div>
    </main>
  );
}

function toSavedSlip(slip: Slip, status: SavedSlip['status']): SavedSlip {
  return {
    ...slip,
    savedAt: new Date().toISOString(),
    status,
    legResults: Object.fromEntries(slip.legs.map((leg) => [leg.id, 'pending'])) as SavedSlip['legResults'],
  };
}
