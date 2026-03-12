import { calculateStatistics } from '../utils/statistics';
import { CATEGORY_LABELS, COMPETITION_TYPE_LABELS, Category } from '../types';

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

      {stats.playersPerCompetition.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#8b6914' }}>Počet hráčů podle soutěží</h3>
          <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Soutěž</th>
                <th>Rok</th>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                  <th key={cat} style={{ textAlign: 'center' }}>{CATEGORY_LABELS[cat]}</th>
                ))}
                <th style={{ textAlign: 'center' }}>Celkem</th>
              </tr>
            </thead>
            <tbody>
              {stats.playersPerCompetition.map(item => (
                <tr key={item.competition.id}>
                  <td>{COMPETITION_TYPE_LABELS[item.competition.type]}</td>
                  <td>{item.competition.year}</td>
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                    <td key={cat} style={{ textAlign: 'center' }}>{item.perCategory[cat] || 0}</td>
                  ))}
                  <td style={{ textAlign: 'center' }}><strong>{item.playerCount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#8b6914' }}>Maximální výsledky podle kategorií</h3>

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
                  Kolo 1: {categoryStat.result.round1 ?? '-'} | Kolo 2: {categoryStat.result.round2 ?? '-'}
                </p>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}
