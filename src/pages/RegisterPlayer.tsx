import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Player, CATEGORY_LABELS } from '../types';
import { storage } from '../utils/storage';

export function RegisterPlayer() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('chlapci-do-15');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('Jméno je povinné');
      return;
    }

    const player: Player = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    storage.players.add(player);
    setSuccess(true);
    setName('');
    setCategory('chlapci-do-15');

    setTimeout(() => {
      setSuccess(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="card">
      <h2>Registrovat nového hráče</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Hráč byl úspěšně registrován!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Jméno hráče *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Zadejte jméno hráče"
            required
          />
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
              <option key={key} value={key}>
                {label}
              </option>
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



