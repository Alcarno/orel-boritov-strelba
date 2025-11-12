import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, Competition, Result } from '../types';
import { storage } from '../utils/storage';
import { COMPETITION_TYPE_LABELS } from '../types';

export function AddResults() {
  const navigate = useNavigate();
  const [competitionId, setCompetitionId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [round1, setRound1] = useState('');
  const [round2, setRound2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const competitions = storage.competitions.getAll().sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.type === 'jarni' ? -1 : 1;
  });

  const players = storage.players.getAll();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const round1Num = parseInt(round1);
    const round2Num = parseInt(round2);

    if (!competitionId) {
      setError('Vyberte soutěž');
      return;
    }

    if (!playerId) {
      setError('Vyberte hráče');
      return;
    }

    if (isNaN(round1Num) || round1Num < 0 || round1Num > 50) {
      setError('Kolo 1 musí být číslo mezi 0 a 50');
      return;
    }

    if (isNaN(round2Num) || round2Num < 0 || round2Num > 50) {
      setError('Kolo 2 musí být číslo mezi 0 a 50');
      return;
    }

    // Check if result already exists for this player and competition
    const existingResults = storage.results.getByCompetitionId(competitionId);
    const exists = existingResults.some(r => r.playerId === playerId);

    if (exists) {
      setError('Výsledek pro tohoto hráče v této soutěži již existuje');
      return;
    }

    const result: Result = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      playerId,
      competitionId,
      round1: round1Num,
      round2: round2Num,
      total: round1Num + round2Num,
      createdAt: new Date().toISOString(),
    };

    storage.results.add(result);
    setSuccess(true);
    setRound1('');
    setRound2('');
    setPlayerId('');

    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  const getCompetitionLabel = (competition: Competition) => {
    return `${COMPETITION_TYPE_LABELS[competition.type]} ${competition.year}`;
  };

  return (
    <div className="card">
      <h2>Zadat výsledky</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Výsledek byl úspěšně zaznamenán!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="competition">Soutěž *</label>
          <select
            id="competition"
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            required
          >
            <option value="">-- Vyberte soutěž --</option>
            {competitions.map(competition => (
              <option key={competition.id} value={competition.id}>
                {getCompetitionLabel(competition)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="player">Hráč *</label>
          <select
            id="player"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            required
          >
            <option value="">-- Vyberte hráče --</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.category})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="round1">Kolo 1 (0-50 bodů) *</label>
          <input
            type="number"
            id="round1"
            value={round1}
            onChange={(e) => setRound1(e.target.value)}
            min="0"
            max="50"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="round2">Kolo 2 (0-50 bodů) *</label>
          <input
            type="number"
            id="round2"
            value={round2}
            onChange={(e) => setRound2(e.target.value)}
            min="0"
            max="50"
            required
          />
        </div>

        {round1 && round2 && !isNaN(parseInt(round1)) && !isNaN(parseInt(round2)) && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
            <strong>Celkový počet bodů: {parseInt(round1) + parseInt(round2)}</strong>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Zadat výsledek
        </button>
      </form>
    </div>
  );
}



