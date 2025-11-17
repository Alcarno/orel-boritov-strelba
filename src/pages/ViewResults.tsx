import { useState } from 'react';
import { Competition, COMPETITION_TYPE_LABELS, CATEGORY_LABELS } from '../types';
import { storage } from '../utils/storage';
import { calculateResults } from '../utils/results';

export function ViewResults() {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const competitions = storage.competitions.getAll().sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.type === 'jarni' ? -1 : 1;
  });

  const getCompetitionLabel = (competition: Competition) => {
    return `${COMPETITION_TYPE_LABELS[competition.type]} ${competition.year}`;
  };

  let results = null;
  if (selectedCompetitionId) {
    try {
      results = calculateResults(selectedCompetitionId);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="card">
      <h2>Výsledky soutěží</h2>
      
      <div className="form-group">
        <label htmlFor="competition-select">Vyberte soutěž</label>
        <select
          id="competition-select"
          value={selectedCompetitionId}
          onChange={(e) => setSelectedCompetitionId(e.target.value)}
          style={{ maxWidth: '400px' }}
        >
          <option value="">-- Vyberte soutěž --</option>
          {competitions.map(competition => (
            <option key={competition.id} value={competition.id}>
              {getCompetitionLabel(competition)}
            </option>
          ))}
        </select>
      </div>

      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>
            {getCompetitionLabel(results.competition)}
          </h3>

          {results.absoluteWinner && (
            <div style={{ 
              marginBottom: '2rem', 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '10px'
            }}>
              <h4 style={{ marginBottom: '0.5rem' }}>🏆 Absolutní vítěz</h4>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>{results.absoluteWinner.player.name}</strong> - {results.absoluteWinner.result.total} bodů
                <br />
                <small>({CATEGORY_LABELS[results.absoluteWinner.player.category]})</small>
              </p>
            </div>
          )}

          {Object.entries(results.categoryResults).map(([category, categoryResults]) => (
            <div key={category} style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: '#555' }}>
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h4>
              {categoryResults.length === 0 ? (
                <p style={{ color: '#999' }}>Žádné výsledky v této kategorii</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Umístění</th>
                      <th>Jméno</th>
                      <th>Kolo 1</th>
                      <th>Kolo 2</th>
                      <th>Celkem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryResults.map((item) => {
                      const badgeClass = 
                        item.position === 1 ? 'badge-gold' :
                        item.position === 2 ? 'badge-silver' :
                        item.position === 3 ? 'badge-bronze' : '';
                      
                      return (
                        <tr key={item.player.id}>
                          <td>
                            {item.position === 1 && '🥇'}
                            {item.position === 2 && '🥈'}
                            {item.position === 3 && '🥉'}
                            {item.position > 3 && item.position + '.'}
                            {badgeClass && <span className={`badge ${badgeClass}`} style={{ marginLeft: '0.5rem' }}>
                              {item.position === 1 ? '1.' : item.position === 2 ? '2.' : '3.'}
                            </span>}
                          </td>
                          <td><strong>{item.player.name}</strong></td>
                          <td>{item.result.round1}</td>
                          <td>{item.result.round2}</td>
                          <td><strong>{item.result.total}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCompetitionId && !results && (
        <p style={{ color: '#999', marginTop: '1rem' }}>Načítání výsledků...</p>
      )}
    </div>
  );
}



