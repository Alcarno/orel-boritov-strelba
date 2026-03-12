import { useState } from 'react';
import { Competition, CATEGORY_LABELS, COMPETITION_TYPE_LABELS, ALLOWED_TRANSFERS } from '../types';
import { storage } from '../utils/storage';

const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD || '';

function isValidPassword(input: string, competitionPassword: string | null): boolean {
  if (MASTER_PASSWORD && input === MASTER_PASSWORD) return true;
  return input === competitionPassword;
}

export function Management() {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [deletePlayerId, setDeletePlayerId] = useState('');
  const [deleteResultPlayerId, setDeleteResultPlayerId] = useState('');
  const [deleteResultCompetitionId, setDeleteResultCompetitionId] = useState('');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [deleteCompetitionId, setDeleteCompetitionId] = useState('');
  const [lockPassword, setLockPassword] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [, setRefresh] = useState(0);

  const forceRefresh = () => setRefresh(n => n + 1);
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const players = storage.players.getAll().sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  const competitions = storage.competitions.getAll().sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.type === 'jarni' ? -1 : 1;
  });

  const selectedPlayer = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;
  const selectedCompetition = selectedCompetitionId ? storage.competitions.getById(selectedCompetitionId) : null;
  const canTransfer = selectedPlayer ? ALLOWED_TRANSFERS[selectedPlayer.category] : undefined;

  const getCompetitionLabel = (c: Competition) =>
    `${COMPETITION_TYPE_LABELS[c.type]} ${c.year}`;

  const handleCategoryTransfer = () => {
    if (!selectedPlayer || !canTransfer) return;
    storage.players.update({ ...selectedPlayer, category: canTransfer });
    showMessage('success', `Hráč "${selectedPlayer.name}" převeden do ${CATEGORY_LABELS[canTransfer]}`);
    setSelectedPlayerId('');
    forceRefresh();
  };

  const handleDeletePlayer = () => {
    if (!deletePlayerId) return;
    const player = storage.players.getById(deletePlayerId);
    if (!player) return;

    const playerResults = storage.results.getByPlayerId(deletePlayerId);
    const lockedComps = playerResults
      .map(r => storage.competitions.getById(r.competitionId))
      .filter((c): c is Competition => c != null && c.locked);

    if (lockedComps.length > 0) {
      const names = lockedComps.map(c => getCompetitionLabel(c)).join(', ');
      showMessage('error', `Nelze smazat hráče – má výsledky v uzamčených soutěžích: ${names}. Nejprve soutěže odemkněte.`);
      return;
    }

    if (!confirm(`Opravdu chcete smazat hráče "${player.name}" a všechny jeho výsledky?`)) return;
    storage.results.deleteByPlayerId(deletePlayerId);
    storage.players.delete(deletePlayerId);
    setDeletePlayerId('');
    showMessage('success', `Hráč "${player.name}" a jeho výsledky byly smazány`);
    forceRefresh();
  };

  const handleDeleteResult = () => {
    if (!deleteResultPlayerId || !deleteResultCompetitionId) return;
    const player = storage.players.getById(deleteResultPlayerId);
    const comp = storage.competitions.getById(deleteResultCompetitionId);
    if (!player || !comp) return;

    if (comp.locked) {
      showMessage('error', `Soutěž "${getCompetitionLabel(comp)}" je uzamčena. Nelze mazat výsledky – nejprve ji odemkněte.`);
      return;
    }

    const result = storage.results.getByCompetitionId(deleteResultCompetitionId)
      .find(r => r.playerId === deleteResultPlayerId);
    if (!result) {
      showMessage('error', 'Výsledek pro tohoto hráče v této soutěži neexistuje');
      return;
    }
    if (!confirm(`Smazat výsledek hráče "${player.name}" v soutěži "${getCompetitionLabel(comp)}"?`)) return;
    storage.results.delete(result.id);
    setDeleteResultPlayerId('');
    setDeleteResultCompetitionId('');
    showMessage('success', `Výsledek hráče "${player.name}" byl smazán`);
    forceRefresh();
  };

  const handleDeleteCompetition = () => {
    if (!deleteCompetitionId) return;
    const comp = storage.competitions.getById(deleteCompetitionId);
    if (!comp) return;
    if (comp.locked) {
      showMessage('error', `Soutěž "${getCompetitionLabel(comp)}" je uzamčena. Nejprve ji odemkněte.`);
      return;
    }
    if (!confirm(`Opravdu chcete smazat soutěž "${getCompetitionLabel(comp)}" a všechny její výsledky?`)) return;
    storage.results.deleteByCompetitionId(deleteCompetitionId);
    storage.competitions.delete(deleteCompetitionId);
    setDeleteCompetitionId('');
    showMessage('success', `Soutěž "${getCompetitionLabel(comp)}" a její výsledky byly smazány`);
    forceRefresh();
  };

  const handleLock = () => {
    if (!selectedCompetition) return;
    if (!lockPassword.trim()) { showMessage('error', 'Heslo nesmí být prázdné'); return; }
    storage.competitions.update({ ...selectedCompetition, locked: true, password: lockPassword });
    setLockPassword('');
    showMessage('success', `Soutěž "${getCompetitionLabel(selectedCompetition)}" byla uzamčena`);
    forceRefresh();
  };

  const handleUnlock = () => {
    if (!selectedCompetition) return;
    if (!isValidPassword(unlockPassword, selectedCompetition.password)) {
      showMessage('error', 'Nesprávné heslo');
      return;
    }
    storage.competitions.update({ ...selectedCompetition, locked: false, password: null });
    setUnlockPassword('');
    showMessage('success', `Soutěž "${getCompetitionLabel(selectedCompetition)}" byla odemčena`);
    forceRefresh();
  };

  return (
    <div>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* === PODSEKCE 1: Správa hráčů a výsledků === */}
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem' }}>Správa hráčů a výsledků</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Mazání hráčů, výsledků a přechod hráčů mezi kategoriemi.</p>

        {/* Smazat hráče */}
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#8b6914', marginBottom: '1rem' }}>Smazat hráče</h3>
          <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Smaže hráče a všechny jeho výsledky ze všech soutěží.
          </p>
          <div className="form-group">
            <label htmlFor="delete-player">Vyberte hráče</label>
            <select id="delete-player" value={deletePlayerId} onChange={(e) => setDeletePlayerId(e.target.value)} style={{ maxWidth: '400px' }}>
              <option value="">-- Vyberte hráče --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({CATEGORY_LABELS[p.category]})</option>
              ))}
            </select>
          </div>
          {deletePlayerId && (
            <button className="btn" style={{ background: '#e53e3e', color: 'white' }} onClick={handleDeletePlayer}>
              Smazat hráče
            </button>
          )}
        </div>

        {/* Smazat výsledek hráče */}
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#8b6914', marginBottom: '1rem' }}>Smazat výsledek hráče</h3>
          <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Smaže výsledek konkrétního hráče v konkrétní soutěži.
          </p>
          <div className="form-group">
            <label htmlFor="del-res-player">Hráč</label>
            <select id="del-res-player" value={deleteResultPlayerId} onChange={(e) => setDeleteResultPlayerId(e.target.value)} style={{ maxWidth: '400px' }}>
              <option value="">-- Vyberte hráče --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({CATEGORY_LABELS[p.category]})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="del-res-comp">Soutěž</label>
            <select id="del-res-comp" value={deleteResultCompetitionId} onChange={(e) => setDeleteResultCompetitionId(e.target.value)} style={{ maxWidth: '400px' }}>
              <option value="">-- Vyberte soutěž --</option>
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{getCompetitionLabel(c)}</option>
              ))}
            </select>
          </div>
          {deleteResultPlayerId && deleteResultCompetitionId && (
            <button className="btn" style={{ background: '#e53e3e', color: 'white' }} onClick={handleDeleteResult}>
              Smazat výsledek
            </button>
          )}
        </div>

        {/* Přechod mezi kategoriemi */}
        <div>
          <h3 style={{ color: '#8b6914', marginBottom: '1rem' }}>Přechod mezi kategoriemi</h3>
          <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Povolené převody: Chlapci do 14,99 let → Muži od 15 let, Dívky do 14,99 let → Ženy od 15 let
          </p>
          <div className="form-group">
            <label htmlFor="transfer-player">Vyberte hráče</label>
            <select id="transfer-player" value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} style={{ maxWidth: '400px' }}>
              <option value="">-- Vyberte hráče --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({CATEGORY_LABELS[p.category]})</option>
              ))}
            </select>
          </div>
          {selectedPlayer && (
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>Hráč:</strong> {selectedPlayer.name}</p>
              <p><strong>Aktuální kategorie:</strong> {CATEGORY_LABELS[selectedPlayer.category]}</p>
              {canTransfer ? (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem' }}>Převést do: <strong>{CATEGORY_LABELS[canTransfer]}</strong></p>
                  <button className="btn btn-primary" onClick={handleCategoryTransfer}>Změnit kategorii</button>
                </div>
              ) : (
                <p style={{ marginTop: '0.5rem', color: '#999' }}>Pro tuto kategorii není k dispozici žádný převod.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === PODSEKCE 2: Správa soutěží === */}
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem' }}>Správa soutěží</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Mazání soutěží a uzamčení/odemčení soutěží.</p>

        {/* Smazat soutěž */}
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#8b6914', marginBottom: '1rem' }}>Smazat soutěž</h3>
          <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Smaže celou soutěž včetně všech výsledků. Uzamčenou soutěž nelze smazat – nejprve ji odemkněte.
          </p>
          <div className="form-group">
            <label htmlFor="delete-comp">Vyberte soutěž</label>
            <select id="delete-comp" value={deleteCompetitionId} onChange={(e) => setDeleteCompetitionId(e.target.value)} style={{ maxWidth: '400px' }}>
              <option value="">-- Vyberte soutěž --</option>
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{getCompetitionLabel(c)} {c.locked ? '🔒' : ''}</option>
              ))}
            </select>
          </div>
          {deleteCompetitionId && (
            <button className="btn" style={{ background: '#e53e3e', color: 'white' }} onClick={handleDeleteCompetition}>
              Smazat soutěž
            </button>
          )}
        </div>

        {/* Uzamčení soutěží */}
        <div>
          <h3 style={{ color: '#8b6914', marginBottom: '1rem' }}>Uzamčení soutěží</h3>
          <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Uzamčená soutěž je chráněna heslem – nelze měnit výsledky, mazat výsledky ani smazat soutěž. 
            Po odemčení heslem lze opět provádět změny až do dalšího uzamčení.
          </p>
          <div className="form-group">
            <label htmlFor="lock-comp">Vyberte soutěž</label>
            <select id="lock-comp" value={selectedCompetitionId} onChange={(e) => { setSelectedCompetitionId(e.target.value); setLockPassword(''); setUnlockPassword(''); }} style={{ maxWidth: '400px' }}>
              <option value="">-- Vyberte soutěž --</option>
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{getCompetitionLabel(c)} {c.locked ? '🔒' : '🔓'}</option>
              ))}
            </select>
          </div>
          {selectedCompetition && (
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Stav:</strong>{' '}
                {selectedCompetition.locked
                  ? <span style={{ color: '#c53030' }}>🔒 Uzamčeno</span>
                  : <span style={{ color: '#38a169' }}>🔓 Odemčeno</span>}
              </p>
              {!selectedCompetition.locked ? (
                <div>
                  <div className="form-group">
                    <label htmlFor="lock-pw">Nastavte heslo pro uzamčení</label>
                    <input type="password" id="lock-pw" value={lockPassword} onChange={(e) => setLockPassword(e.target.value)} placeholder="Zadejte heslo" style={{ maxWidth: '300px' }} />
                  </div>
                  <button className="btn btn-primary" onClick={handleLock}>🔒 Uzamknout soutěž</button>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label htmlFor="unlock-pw">Zadejte heslo pro odemčení</label>
                    <input type="password" id="unlock-pw" value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="Zadejte heslo" style={{ maxWidth: '300px' }} />
                    <small style={{ color: '#888', display: 'block', marginTop: '0.25rem' }}>
                      Zapomněli jste heslo? Použijte hlavní (master) heslo.
                    </small>
                  </div>
                  <button className="btn btn-secondary" onClick={handleUnlock}>🔓 Odemknout soutěž</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
