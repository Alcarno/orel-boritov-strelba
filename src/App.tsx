import { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { RegisterPlayer } from './pages/RegisterPlayer';
import { AddCompetition } from './pages/AddCompetition';
import { AddResults } from './pages/AddResults';
import { ViewResults } from './pages/ViewResults';
import { PlayerHistory } from './pages/PlayerHistory';
import { Statistics } from './pages/Statistics';
import { Management } from './pages/Management';
import { initStorage, refreshStorage, onStorageRefresh } from './utils/storage';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setRefreshKey] = useState(0);

  const forceRerender = useCallback(() => setRefreshKey(n => n + 1), []);

  useEffect(() => {
    initStorage()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
        setError(err.message || 'Nepodařilo se připojit k databázi');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onStorageRefresh(forceRerender);
    return unsubscribe;
  }, [forceRerender]);

  useEffect(() => {
    const handleFocus = () => {
      refreshStorage();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshStorage();
    });
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Načítání dat...</h2>
          <p style={{ color: '#666' }}>Připojování k databázi</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: '#e53e3e' }}>Chyba připojení</h2>
          <p style={{ color: '#666' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <Link to="/" className="header-content" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="./logo.png" alt="Orel Bořitov" className="logo" />
              <h1>Orel Bořitov - Střelba ze vzduchovek</h1>
            </Link>
            <nav className="main-nav">
              <Link to="/">Domů</Link>
              <Link to="/register-player">Registrovat hráče</Link>
              <Link to="/add-competition">Nová soutěž</Link>
              <Link to="/add-results">Zadat výsledky</Link>
              <Link to="/results">Výsledky</Link>
              <Link to="/player-history">Historie hráče</Link>
              <Link to="/statistics">Statistiky</Link>
              <Link to="/management">Správa</Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/results" element={<ViewResults />} />
            <Route path="*" element={
              <div className="container">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register-player" element={<RegisterPlayer />} />
                  <Route path="/add-competition" element={<AddCompetition />} />
                  <Route path="/add-results" element={<AddResults />} />
                  <Route path="/player-history" element={<PlayerHistory />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/management" element={<Management />} />
                </Routes>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;

