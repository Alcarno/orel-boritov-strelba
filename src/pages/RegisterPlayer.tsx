import { useState, useMemo } from 'react';
import { Category, Player, Result, Competition, CATEGORY_LABELS, COMPETITION_TYPE_LABELS, ALLOWED_TRANSFERS } from '../types';
import { storage } from '../utils/storage';

export function RegisterPlayer() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('chlapci-do-15');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferOffer, setTransferOffer] = useState<{ existingPlayer: Player; targetCategory: Category } | null>(null);

  const [enrollCompetitionId, setEnrollCompetitionId] = useState('');
  const [enrollCategoryFilter, setEnrollCategoryFilter] = useState<Category | ''>('');
  const [enrollPlayerId, setEnrollPlayerId] = useState('');
  const [enrollMessage, setEnrollMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [, setRefresh] = useState(0);

  const competitions = storage.competitions.getAll().sort((a, b) => {
    const valA = a.year * 2 + (a.type === 'podzimni' ? 1 : 0);
    const valB = b.year * 2 + (b.type === 'podzimni' ? 1 : 0);
    return valB - valA;
  });

  const getCompetitionLabel = (c: Competition) =>
    `${COMPETITION_TYPE_LABELS[c.type]} ${c.year}`;

  const allPlayers = storage.players.getAll().sort((a, b) => a.name.localeCompare(b.name, 'cs'));

  const enrolledResults = enrollCompetitionId
    ? storage.results.getByCompetitionId(enrollCompetitionId)
    : [];
  const enrolledPlayerIds = new Set(enrolledResults.map(r => r.playerId));

  const availablePlayers = useMemo(() => {
    let players = allPlayers.filter(p => !enrolledPlayerIds.has(p.id));
    if (enrollCategoryFilter) {
      players = players.filter(p => p.category === enrollCategoryFilter);
    }
    return players;
  }, [allPlayers, enrolledPlayerIds, enrollCategoryFilter]);

  const enrolledList = useMemo(() => {
    return enrolledResults
      .map(r => {
        const player = storage.players.getById(r.playerId);
        return player ? { player, result: r } : null;
      })
      .filter((item): item is { player: Player; result: Result } => item !== null)
      .sort((a, b) => a.player.name.localeCompare(b.player.name, 'cs'));
  }, [enrolledResults]);

  const matchingPlayers = useMemo(() => {
    if (name.trim().length < 2) return [];
    const needle = name.trim().toLowerCase();
    return storage.players.getAll().filter(p =>
      p.name.toLowerCase().includes(needle)
    );
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTransferOffer(null);

    if (!name.trim()) {
      setError('Jméno je povinné');
      return;
    }

    const existingPlayers = storage.players.getAll();
    const duplicate = existingPlayers.find(
      p => p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
      if (duplicate.category === category) {
        setError(`Hráč "${duplicate.name}" již existuje v kategorii ${CATEGORY_LABELS[category]}`);
        return;
      }

      const targetCategory = ALLOWED_TRANSFERS[duplicate.category];
      if (targetCategory === category) {
        setTransferOffer({ existingPlayer: duplicate, targetCategory: category });
        return;
      }

      setError(`Hráč "${duplicate.name}" existuje v kategorii ${CATEGORY_LABELS[duplicate.category]}. Převod do kategorie ${CATEGORY_LABELS[category]} není povolen.`);
      return;
    }

    const player: Player = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    storage.players.add(player);
    setSuccess('Hráč byl úspěšně zaregistrován!');
    setName('');
    setRefresh(n => n + 1);
  };

  const handleTransfer = () => {
    if (!transferOffer) return;
    const { existingPlayer, targetCategory } = transferOffer;

    storage.players.update({ ...existingPlayer, category: targetCategory });
    setTransferOffer(null);
    setSuccess(`Hráč "${existingPlayer.name}" byl převeden do kategorie ${CATEGORY_LABELS[targetCategory]}`);
    setName('');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setError('');
    setSuccess('');
    setTransferOffer(null);
  };

  const handleEnroll = () => {
    if (!enrollCompetitionId) {
      setEnrollMessage({ type: 'error', text: 'Vyberte soutěž' });
      return;
    }
    if (!enrollPlayerId) {
      setEnrollMessage({ type: 'error', text: 'Vyberte hráče' });
      return;
    }

    const player = storage.players.getById(enrollPlayerId);
    if (!player) return;

    const existing = storage.results.getByCompetitionId(enrollCompetitionId)
      .find(r => r.playerId === enrollPlayerId);
    if (existing) {
      setEnrollMessage({ type: 'error', text: `Hráč "${player.name}" je již přihlášen v této soutěži` });
      return;
    }

    const result: Result = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      playerId: enrollPlayerId,
      competitionId: enrollCompetitionId,
      round1: null,
      round2: null,
      rozstrel: null,
      total: 0,
      categoryAtTime: player.category,
      createdAt: new Date().toISOString(),
    };

    storage.results.add(result);
    setEnrollMessage({ type: 'success', text: `Hráč "${player.name}" přihlášen do soutěže` });
    setEnrollPlayerId('');
    setRefresh(n => n + 1);
  };

  const handleUnenroll = (playerId: string, resultId: string) => {
    const player = storage.players.getById(playerId);
    const result = enrolledResults.find(r => r.id === resultId);
    if (!player || !result) return;

    const hasScores = result.round1 !== null || result.round2 !== null || result.rozstrel !== null;
    if (hasScores) {
      setEnrollMessage({ type: 'error', text: `Hráč "${player.name}" má zadané body – nelze odhlásit. Použijte Správu pro smazání výsledku.` });
      return;
    }

    if (!confirm(`Odhlásit hráče "${player.name}" ze soutěže?`)) return;
    storage.results.delete(resultId);
    setEnrollMessage({ type: 'success', text: `Hráč "${player.name}" odhlášen ze soutěže` });
    setRefresh(n => n + 1);
  };

  return (
    <div>
      <div className="card">
        <h2>Registrovat nového hráče</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {transferOffer && (
          <div className="alert" style={{ background: '#fff4e1', border: '1px solid #e6b422', color: '#333', marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Hráč "{transferOffer.existingPlayer.name}" již existuje</strong> v kategorii {CATEGORY_LABELS[transferOffer.existingPlayer.category]}.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Chcete ho převést do kategorie <strong>{CATEGORY_LABELS[transferOffer.targetCategory]}</strong>?
            </p>
            <button className="btn btn-primary" onClick={handleTransfer} style={{ marginRight: '0.5rem' }}>
              Převést hráče
            </button>
            <button className="btn btn-secondary" onClick={() => setTransferOffer(null)}>
              Zrušit
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Jméno hráče *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Zadejte jméno hráče"
              autoComplete="off"
              required
            />
            {matchingPlayers.length > 0 && name.trim().length >= 2 && (
              <div style={{
                marginTop: '0.25rem',
                padding: '0.5rem 0.75rem',
                background: '#fff4e1',
                border: '1px solid #e6b422',
                borderRadius: '5px',
                fontSize: '0.9rem'
              }}>
                <strong>Podobní hráči:</strong>
                {matchingPlayers.map(p => (
                  <div key={p.id} style={{ marginTop: '0.25rem' }}>
                    ⚠️ {p.name} ({CATEGORY_LABELS[p.category]})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Kategorie *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              required
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Registrovat hráče
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Přihlášení hráče do soutěže</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Přihlaste existujícího hráče do vybrané soutěže. Hráč se objeví ve výsledkové listině s prázdnými koly.
        </p>

        {enrollMessage && (
          <div className={`alert alert-${enrollMessage.type}`}>{enrollMessage.text}</div>
        )}

        <div className="form-group">
          <label htmlFor="enroll-competition">Soutěž *</label>
          <select
            id="enroll-competition"
            value={enrollCompetitionId}
            onChange={(e) => { setEnrollCompetitionId(e.target.value); setEnrollPlayerId(''); setEnrollMessage(null); }}
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
          <label htmlFor="enroll-category-filter">Filtr kategorie (volitelné)</label>
          <select
            id="enroll-category-filter"
            value={enrollCategoryFilter}
            onChange={(e) => { setEnrollCategoryFilter(e.target.value as Category | ''); setEnrollPlayerId(''); }}
          >
            <option value="">-- Všechny kategorie --</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="enroll-player">Hráč *</label>
          <select
            id="enroll-player"
            value={enrollPlayerId}
            onChange={(e) => setEnrollPlayerId(e.target.value)}
          >
            <option value="">-- Vyberte hráče --</option>
            {availablePlayers.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({CATEGORY_LABELS[p.category]})
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleEnroll} style={{ marginBottom: '1.5rem' }}>
          Přihlásit do soutěže
        </button>

        {enrollCompetitionId && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#8b6914' }}>
              Přihlášení hráči ({enrolledList.length})
            </h3>
            {enrolledList.length === 0 ? (
              <p style={{ color: '#999' }}>Zatím není přihlášen žádný hráč.</p>
            ) : (
              <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Jméno</th>
                    <th>Kategorie</th>
                    <th style={{ textAlign: 'center' }}>K1</th>
                    <th style={{ textAlign: 'center' }}>K2</th>
                    <th style={{ textAlign: 'center' }}>Celkem</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledList.map(({ player, result }) => {
                    const hasScores = result.round1 !== null || result.round2 !== null;
                    return (
                      <tr key={result.id}>
                        <td><strong>{player.name}</strong></td>
                        <td>{CATEGORY_LABELS[result.categoryAtTime || player.category]}</td>
                        <td style={{ textAlign: 'center' }}>{result.round1 ?? '–'}</td>
                        <td style={{ textAlign: 'center' }}>{result.round2 ?? '–'}</td>
                        <td style={{ textAlign: 'center' }}>{hasScores ? <strong>{result.total}</strong> : '–'}</td>
                        <td style={{ textAlign: 'center' }}>
                          {!hasScores && (
                            <button
                              onClick={() => handleUnenroll(player.id, result.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#e53e3e',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                textDecoration: 'underline',
                              }}
                            >
                              Odhlásit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
