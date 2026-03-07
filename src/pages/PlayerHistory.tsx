import { useState } from 'react';
import { COMPETITION_TYPE_LABELS, CATEGORY_LABELS } from '../types';
import { storage } from '../utils/storage';
import { getPlayerHistory } from '../utils/results';

export function PlayerHistory() {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const players = storage.players.getAll().sort((a, b) => a.name.localeCompare(b.name, 'cs'));

  const history = selectedPlayerId ? getPlayerHistory(selectedPlayerId) : [];
  const selectedPlayer = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;

  const scoredHistory = history.filter(item => item.result.total > 0);

  return (
    <div className="card">
      <h2>Historie hráče</h2>

      <div className="form-group">
        <label htmlFor="player-select">Vyberte hráče</label>
        <select
          id="player-select"
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          style={{ maxWidth: '400px' }}
        >
          <option value="">-- Vyberte hráče --</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPlayer && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#8b6914' }}>
            Historie: {selectedPlayer.name}
          </h3>

          {history.length === 0 ? (
            <p style={{ color: '#999' }}>Tento hráč zatím nemá žádné výsledky.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Soutěž</th>
                  <th>Rok</th>
                  <th>Kategorie</th>
                  <th>Kolo 1</th>
                  <th>Kolo 2</th>
                  <th>Celkem</th>
                  <th>Umístění</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.result.id}>
                    <td>{COMPETITION_TYPE_LABELS[item.competition.type]}</td>
                    <td>{item.competition.year}</td>
                    <td>{CATEGORY_LABELS[item.result.categoryAtTime] || CATEGORY_LABELS[selectedPlayer!.category]}</td>
                    <td>{item.result.round1 ?? '-'}</td>
                    <td>{item.result.round2 ?? '-'}</td>
                    <td><strong>{item.result.total}</strong></td>
                    <td>
                      {item.position > 0 ? (
                        <>
                          {item.position === 1 && '🥇 '}
                          {item.position === 2 && '🥈 '}
                          {item.position === 3 && '🥉 '}
                          {item.position}.
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {scoredHistory.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>Průměrný výsledek:</strong> {
                Math.round(scoredHistory.reduce((sum, item) => sum + item.result.total, 0) / scoredHistory.length)
              } bodů</p>
              <p><strong>Nejlepší výsledek:</strong> {
                Math.max(...scoredHistory.map(item => item.result.total))
              } bodů</p>
              <p><strong>Nejlepší umístění:</strong> {
                (() => {
                  const positions = scoredHistory.filter(i => i.position > 0).map(i => i.position);
                  if (positions.length === 0) return '-';
                  const best = Math.min(...positions);
                  return `${best}. místo`;
                })()
              }</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
