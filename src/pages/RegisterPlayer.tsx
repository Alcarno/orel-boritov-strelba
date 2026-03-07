import { useState, useMemo } from 'react';
import { Category, Player, CATEGORY_LABELS, ALLOWED_TRANSFERS } from '../types';
import { storage } from '../utils/storage';

export function RegisterPlayer() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('chlapci-do-15');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferOffer, setTransferOffer] = useState<{ existingPlayer: Player; targetCategory: Category } | null>(null);

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

  return (
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
  );
}
