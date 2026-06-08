import { useMemo, useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LegTable } from './components/LegTable';
import { MultiBuilderPanel } from './components/MultiBuilderPanel';
import { SlipInput } from './components/SlipInput';
import { SlipSummary } from './components/SlipSummary';
import { game3, game3Bets, type FeaturedBet } from './data/game3Bets';
import { diagnoseSlip } from './domain/diagnosis';
import { buildMultiSuggestions } from './domain/multiBuilder';
import { parseSlipText } from './domain/parser';
import type { SavedSlip, Slip, SlipDiagnosis } from './domain/types';
import { readSlipImage } from './services/ocr';
import { createSlipStorage } from './services/storage';

const storage = createSlipStorage();
type AppMessage = { type: 'success' | 'error'; text: string };

export default function App() {
  const [selectedFeaturedBetId, setSelectedFeaturedBetId] = useState(game3Bets[0].id);
  const [diagnosis, setDiagnosis] = useState<SlipDiagnosis>(() => diagnoseFeaturedBet(game3Bets[0]));
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
    setSelectedFeaturedBetId('');
    setMessage(undefined);
  }

  function analyzeFeaturedBet(bet: FeaturedBet) {
    setSelectedFeaturedBetId(bet.id);
    setDiagnosis(diagnoseFeaturedBet(bet));
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

  function settleSavedSlip(slip: SavedSlip, profitLoss: number) {
    const settledSlip: SavedSlip = {
      ...slip,
      status: 'settled',
      profitLoss,
    };

    try {
      const didUpdate = storage.updateSlip(settledSlip);
      if (!didUpdate) {
        setMessage({ type: 'error', text: 'Could not find that saved slip. Refresh and try again.' });
        return;
      }

      setSavedSlips(storage.loadSlips());
      setMessage({ type: 'success', text: 'Slip settled.' });
    } catch {
      setMessage({ type: 'error', text: 'Could not update slip. Check browser storage and try again.' });
    }
  }

  const canSave = Boolean(diagnosis && diagnosis.slip.legs.length > 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>NBA Multi Assistant</h1>
          <p>
            {game3.label} - {game3.game} - {game3.tipoff}
          </p>
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
          <section className="panel featured-bets" aria-labelledby="featured-bets-heading">
            <div className="panel-heading">
              <h2 id="featured-bets-heading">Current Bets</h2>
              <span className="eyebrow">Sportsbet Game 3</span>
            </div>
            <div className="featured-bet-list">
              {game3Bets.map((bet) => {
                const isSelected = bet.id === selectedFeaturedBetId;
                return (
                  <button
                    key={bet.id}
                    type="button"
                    className={`featured-bet-button ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => analyzeFeaturedBet(bet)}
                  >
                    <strong>{bet.name}</strong>
                    <span>
                      {bet.legCount} legs - ${bet.stake.toFixed(2)} stake - placed {bet.placedAt}
                    </span>
                    {bet.note ? <span>{bet.note}</span> : null}
                  </button>
                );
              })}
            </div>
          </section>
          <SlipInput onSubmitText={analyzeText} onUploadImage={uploadImage} isReadingImage={isReadingImage} />
          <SlipSummary diagnosis={diagnosis} />
          <ChatPanel diagnosis={diagnosis} />
          <HistoryPanel slips={savedSlips} onSettleSlip={settleSavedSlip} />
        </div>
        <div className="right-column">
          <LegTable legs={diagnosis?.ratedLegs ?? []} />
          <MultiBuilderPanel suggestions={suggestions} />
        </div>
      </div>
    </main>
  );
}

function diagnoseFeaturedBet(bet: FeaturedBet): SlipDiagnosis {
  const slip = {
    ...parseSlipText(bet.text),
    placedAt: bet.placedAt,
  };

  return diagnoseSlip(slip);
}

function toSavedSlip(slip: Slip, status: SavedSlip['status']): SavedSlip {
  return {
    ...slip,
    savedAt: new Date().toISOString(),
    status,
    legResults: Object.fromEntries(slip.legs.map((leg) => [leg.id, 'pending'])) as SavedSlip['legResults'],
  };
}
