import { Link } from 'react-router-dom';
import { storage } from '../utils/storage';

export function Home() {
  const players = storage.players.getAll();
  const competitions = storage.competitions.getAll();
  const results = storage.results.getAll();

  return (
    <div className="card">
      <h2>Vítejte v systému pro sledování střelby ze vzduchovek</h2>
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>
        Systém pro správu soutěží střelby ze vzduchovek organizace Orel Bořitov
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{players.length}</h3>
          <p>Registrovaných hráčů</p>
        </div>
        <div className="stat-card">
          <h3>{competitions.length}</h3>
          <p>Proběhlých soutěží</p>
        </div>
        <div className="stat-card">
          <h3>{results.length}</h3>
          <p>Zaznamenaných výsledků</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Rychlé akce</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/register-player" className="btn btn-primary">
            Registrovat nového hráče
          </Link>
          <Link to="/add-competition" className="btn btn-primary">
            Vytvořit novou soutěž
          </Link>
          <Link to="/add-results" className="btn btn-primary">
            Zadat výsledky
          </Link>
          <Link to="/results" className="btn btn-secondary">
            Zobrazit výsledky
          </Link>
          <Link to="/statistics" className="btn btn-secondary">
            Statistiky
          </Link>
        </div>
      </div>
    </div>
  );
}



