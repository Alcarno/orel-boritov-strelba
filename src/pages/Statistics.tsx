import { calculateStatistics } from '../utils/statistics';
import { CATEGORY_LABELS, COMPETITION_TYPE_LABELS } from '../types';

export function Statistics() {
  const stats = calculateStatistics();

  return (
    <div className="card">
      <h2>Statistiky a zajímavosti</h2>

      <div className="stats-grid" style={{ marginTop: '2rem' }}>
        <div className="stat-card">
          <h3>{stats.totalPlayers}</h3>
          <p>Celkem hráčů</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalCompetitions}</h3>
          <p>Celkem soutěží</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalResults}</h3>
          <p>Celkem výsledků</p>
        </div>
      </div>

      {stats.overallMaxResult && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
          borderRadius: '10px',
          border: '3px solid #ffd700'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>🏆 Absolutní rekord</h3>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            <strong>{stats.overallMaxResult.player.name}</strong>
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {stats.overallMaxResult.maxScore} bodů
          </p>
          <p>
            {COMPETITION_TYPE_LABELS[stats.overallMaxResult.competition.type]} {stats.overallMaxResult.competition.year}
            <br />
            <small>({CATEGORY_LABELS[stats.overallMaxResult.player.category]})</small>
          </p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Maximální výsledky podle kategorií</h3>
        
        {stats.categoryMaxResults.length === 0 ? (
          <p style={{ color: '#999' }}>Zatím nejsou k dispozici žádné statistiky.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {stats.categoryMaxResults.map(categoryStat => (
              <div 
                key={categoryStat.category}
                style={{
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0'
                }}
              >
                <h4 style={{ marginBottom: '0.5rem', color: '#555' }}>
                  {CATEGORY_LABELS[categoryStat.category]}
                </h4>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>{categoryStat.player.name}</strong> - {categoryStat.maxScore} bodů
                </p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {COMPETITION_TYPE_LABELS[categoryStat.competition.type]} {categoryStat.competition.year}
                  <br />
                  Kolo 1: {categoryStat.result.round1} | Kolo 2: {categoryStat.result.round2}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



