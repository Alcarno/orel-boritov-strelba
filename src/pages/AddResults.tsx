import { useState, useMemo, useEffect } from 'react';
import { Category, Competition, Result, CATEGORY_LABELS, COMPETITION_TYPE_LABELS } from '../types';
import { storage } from '../utils/storage';
import { calculateResults } from '../utils/results';
import { SearchableSelect } from '../components/SearchableSelect';

const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD || '';

export function AddResults() {
  const [competitionId, setCompetitionId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
  const [playerId, setPlayerId] = useState('');
  const [round1, setRound1] = useState('');
  const [round2, setRound2] = useState('');
  const [rozstrel, setRozstrel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const competitions = storage.competitions.getAll().sort((a, b) => {
    const valA = a.year * 2 + (a.type === 'podzimni' ? 1 : 0);
    const valB = b.year * 2 + (b.type === 'podzimni' ? 1 : 0);
    return valB - valA;
  });

  const selectedCompetition = competitionId
    ? storage.competitions.getById(competitionId)
    : null;

  const enrolledPlayers = useMemo(() => {
    if (!competitionId) return [];
    const results = storage.results.getByCompetitionId(competitionId);
    const playerIds = new Set(results.map(r => r.playerId));
    return storage.players.getAll()
      .filter(p => playerIds.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [competitionId]);

  const filteredPlayers = useMemo(() => {
    if (!categoryFilter) return enrolledPlayers;
    return enrolledPlayers.filter(p => p.category === categoryFilter);
  }, [enrolledPlayers, categoryFilter]);

  useEffect(() => {
    if (!competitionId || !playerId) return;
    const existing = storage.results.getByCompetitionId(competitionId)
      .find(r => r.playerId === playerId);
    if (existing) {
      setRound1(existing.round1 !== null ? existing.round1.toString() : '');
      setRound2(existing.round2 !== null ? existing.round2.toString() : '');
      setRozstrel(existing.rozstrel !== null ? existing.rozstrel.toString() : '');
    } else {
      setRound1('');
      setRound2('');
      setRozstrel('');
    }
  }, [competitionId, playerId]);

  const needsTiebreaker = useMemo(() => {
    if (!competitionId || !playerId) return false;
    try {
      const results = calculateResults(competitionId);
      const player = storage.players.getById(playerId);
      if (!player) return false;

      const category = player.category;
      let catResults = results.categoryResults[category];
      if (!catResults) return false;

      const projectedTotal = (round1 !== '' ? parseInt(round1) : 0) + (round2 !== '' ? parseInt(round2) : 0);
      const hasFormInput = round1 !== '' || round2 !== '';

      const existingEntry = catResults.find(cr => cr.player.id === playerId);
      let entries = catResults.map(cr => ({
        playerId: cr.player.id,
        total: cr.player.id === playerId && hasFormInput ? projectedTotal : cr.result.total,
      }));

      if (!existingEntry && hasFormInput) {
        entries.push({ playerId, total: projectedTotal });
      }

      if (entries.length < 2) return false;

      entries.sort((a, b) => b.total - a.total);
      const pos1 = entries[0];
      const pos2 = entries[1];
      const pos3 = entries.length > 2 ? entries[2] : null;
      const pos4 = entries.length > 3 ? entries[3] : null;

      const isInvolved = (e: typeof pos1) => e.playerId === playerId;

      if (pos1 && pos2 && pos1.total === pos2.total) {
        if (isInvolved(pos1) || isInvolved(pos2)) return true;
      }
      if (pos2 && pos3 && pos2.total === pos3.total) {
        if (isInvolved(pos2) || isInvolved(pos3)) return true;
      }
      if (pos3 && pos4 && pos3.total === pos4.total) {
        if (isInvolved(pos3) || isInvolved(pos4)) return true;
      }

      return false;
    } catch {
      // ignore
    }
    return false;
  }, [competitionId, playerId, round1, round2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!competitionId) { setError('Vyberte soutěž'); return; }
    if (!playerId) { setError('Vyberte hráče'); return; }

    if (selectedCompetition?.locked) {
      if (!showPasswordPrompt) {
        setShowPasswordPrompt(true);
        setError('Soutěž je uzamčena. Zadejte heslo pro úpravu výsledků.');
        return;
      }
      const isValid = password === selectedCompetition.password || (MASTER_PASSWORD && password === MASTER_PASSWORD);
      if (!isValid) {
        setError('Nesprávné heslo');
        return;
      }
    }

    let round1Num: number | null = null;
    let round2Num: number | null = null;

    if (round1 !== '') {
      round1Num = parseInt(round1);
      if (isNaN(round1Num) || round1Num < 0 || round1Num > 50) {
        setError('Kolo 1 musí být číslo mezi 0 a 50');
        return;
      }
    }
    if (round2 !== '') {
      round2Num = parseInt(round2);
      if (isNaN(round2Num) || round2Num < 0 || round2Num > 50) {
        setError('Kolo 2 musí být číslo mezi 0 a 50');
        return;
      }
    }

    let rozstrelNum: number | null = null;
    if (rozstrel !== '') {
      rozstrelNum = parseInt(rozstrel);
      if (isNaN(rozstrelNum) || rozstrelNum < 0 || rozstrelNum > 50) {
        setError('Rozstřel musí být číslo mezi 0 a 50');
        return;
      }
    }

    if (round1Num === null && round2Num === null && rozstrelNum === null) {
      setError('Zadejte alespoň jednu hodnotu');
      return;
    }

    const total = (round1Num ?? 0) + (round2Num ?? 0);

    const player = storage.players.getById(playerId);
    if (!player) { setError('Hráč nenalezen'); return; }

    const existingResults = storage.results.getByCompetitionId(competitionId);
    const existingResult = existingResults.find(r => r.playerId === playerId);

    if (existingResult) {
      const updated: Result = {
        ...existingResult,
        round1: round1Num ?? existingResult.round1,
        round2: round2Num ?? existingResult.round2,
        rozstrel: rozstrelNum ?? existingResult.rozstrel,
        total: round1Num !== null || round2Num !== null
          ? total
          : existingResult.total,
      };
      if (round1Num !== null) updated.round1 = round1Num;
      if (round2Num !== null) updated.round2 = round2Num;
      if (round1Num !== null || round2Num !== null) {
        updated.total = (updated.round1 ?? 0) + (updated.round2 ?? 0);
      }
      if (rozstrelNum !== null) updated.rozstrel = rozstrelNum;
      storage.results.update(updated);
    } else {
      const result: Result = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        playerId,
        competitionId,
        round1: round1Num,
        round2: round2Num,
        rozstrel: rozstrelNum,
        total,
        categoryAtTime: player.category,
        createdAt: new Date().toISOString(),
      };
      storage.results.add(result);
    }

    setSuccess(true);
    setRound1('');
    setRound2('');
    setRozstrel('');
    setPlayerId('');
    setPassword('');
    setShowPasswordPrompt(false);

    setTimeout(() => setSuccess(false), 2000);
  };

  const getCompetitionLabel = (c: Competition) =>
    `${COMPETITION_TYPE_LABELS[c.type]} ${c.year}`;

  return (
    <div className="card">
      <h2>Zadat výsledky</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Výsledek byl úspěšně zaznamenán!</div>}

      {selectedCompetition?.locked && (
        <div className="alert" style={{ background: '#fff4e1', border: '1px solid #d4a017', color: '#333' }}>
          🔒 Tato soutěž je uzamčena. Pro úpravu výsledků je nutné zadat heslo.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="competition">Soutěž *</label>
          <select
            id="competition"
            value={competitionId}
            onChange={(e) => { setCompetitionId(e.target.value); setShowPasswordPrompt(false); setPassword(''); }}
            required
          >
            <option value="">-- Vyberte soutěž --</option>
            {competitions.map(c => (
              <option key={c.id} value={c.id}>
                {getCompetitionLabel(c)} {c.locked ? '🔒' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category-filter">Filtr kategorie (volitelné)</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value as Category | ''); setPlayerId(''); }}
          >
            <option value="">-- Všechny kategorie --</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="player">Hráč *</label>
          <SearchableSelect
            id="player"
            value={playerId}
            onChange={(val) => setPlayerId(val)}
            placeholder="Začněte psát jméno hráče..."
            required
            options={filteredPlayers.map(player => ({
              value: player.id,
              label: `${player.name} (${CATEGORY_LABELS[player.category]})`,
            }))}
          />
          {competitionId && enrolledPlayers.length === 0 && (
            <small style={{ color: '#e53e3e', display: 'block', marginTop: '0.25rem' }}>
              V této soutěži nejsou přihlášení žádní hráči. Nejprve přihlaste hráče v sekci Registrace.
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="round1">Kolo 1 (0-50 bodů)</label>
          <input
            type="number"
            id="round1"
            value={round1}
            onChange={(e) => setRound1(e.target.value)}
            min="0"
            max="50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="round2">Kolo 2 (0-50 bodů)</label>
          <input
            type="number"
            id="round2"
            value={round2}
            onChange={(e) => setRound2(e.target.value)}
            min="0"
            max="50"
          />
        </div>

        {needsTiebreaker && (
          <div className="form-group">
            <label htmlFor="rozstrel">Rozstřel (0-50 bodů)</label>
            <input
              type="number"
              id="rozstrel"
              value={rozstrel}
              onChange={(e) => setRozstrel(e.target.value)}
              min="0"
              max="50"
            />
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              Shoda na 1.–4. místě – zadejte rozstřel pro rozlišení pořadí
            </small>
          </div>
        )}

        {round1 && round2 && !isNaN(parseInt(round1)) && !isNaN(parseInt(round2)) && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
            <strong>Celkový počet bodů: {parseInt(round1) + parseInt(round2)}</strong>
            {rozstrel && !isNaN(parseInt(rozstrel)) && (
              <span style={{ marginLeft: '1rem', color: '#666' }}>
                (rozstřel: {parseInt(rozstrel)})
              </span>
            )}
          </div>
        )}

        {showPasswordPrompt && (
          <div className="form-group">
            <label htmlFor="password">Heslo pro odemčení soutěže *</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Zadejte heslo"
              required
            />
            <small style={{ color: '#888', display: 'block', marginTop: '0.25rem' }}>
              Zapomněli jste heslo? Použijte hlavní (master) heslo.
            </small>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Zadat výsledek
        </button>
      </form>
    </div>
  );
}
