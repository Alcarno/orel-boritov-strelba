import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { RegisterPlayer } from './pages/RegisterPlayer';
import { AddCompetition } from './pages/AddCompetition';
import { AddResults } from './pages/AddResults';
import { ViewResults } from './pages/ViewResults';
import { PlayerHistory } from './pages/PlayerHistory';
import { Statistics } from './pages/Statistics';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              {/* Logo: Přidejte logo do složky public/logo.png a odkomentujte následující řádek */}
              {/* <img src="/logo.png" alt="Orel Bořitov" className="logo" /> */}
              <h1>Orel Bořitov - Střelba ze vzduchovek</h1>
            </div>
            <nav className="main-nav">
              <Link to="/">Domů</Link>
              <Link to="/register-player">Registrovat hráče</Link>
              <Link to="/add-competition">Nová soutěž</Link>
              <Link to="/add-results">Zadat výsledky</Link>
              <Link to="/results">Výsledky</Link>
              <Link to="/player-history">Historie hráče</Link>
              <Link to="/statistics">Statistiky</Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register-player" element={<RegisterPlayer />} />
              <Route path="/add-competition" element={<AddCompetition />} />
              <Route path="/add-results" element={<AddResults />} />
              <Route path="/results" element={<ViewResults />} />
              <Route path="/player-history" element={<PlayerHistory />} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

