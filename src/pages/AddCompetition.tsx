import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompetitionType, Competition, COMPETITION_TYPE_LABELS } from '../types';
import { storage } from '../utils/storage';

export function AddCompetition() {
  const navigate = useNavigate();
  const [type, setType] = useState<CompetitionType>('jarni');
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (year < 2023) {
      setError('Soutěž musí být od roku 2023');
      return;
    }

    // Check if competition already exists
    const existing = storage.competitions.getAll();
    const exists = existing.some(
      c => c.type === type && c.year === year
    );

    if (exists) {
      setError('Soutěž tohoto typu pro tento rok již existuje');
      return;
    }

    const competition: Competition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      year,
      date,
      locked: false,
      password: null,
    };

    storage.competitions.add(competition);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="card">
      <h2>Vytvořit novou soutěž</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Soutěž byla úspěšně vytvořena!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Typ soutěže *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as CompetitionType)}
            required
          >
            {Object.entries(COMPETITION_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="year">Rok *</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2023"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Datum konání *</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Vytvořit soutěž
        </button>
      </form>
    </div>
  );
}



