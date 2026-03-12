import { useState, useRef } from 'react';
import { Competition, COMPETITION_TYPE_LABELS, CATEGORY_LABELS, Category } from '../types';
import { storage } from '../utils/storage';
import { calculateResults } from '../utils/results';

export function ViewResults() {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
  const [tiebreakInputs, setTiebreakInputs] = useState<Record<string, string>>({});
  const [tiebreakMessage, setTiebreakMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [, setRefresh] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  const competitions = storage.competitions.getAll().sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.type === 'jarni' ? -1 : 1;
  });

  const getCompetitionLabel = (competition: Competition) =>
    `${COMPETITION_TYPE_LABELS[competition.type]} ${competition.year}`;

  let results = null;
  if (selectedCompetitionId) {
    try {
      results = calculateResults(selectedCompetitionId);
    } catch (error) {
      console.error(error);
    }
  }

  const hasAnyRozstrel = results
    ? Object.values(results.categoryResults).some(catResults =>
        catResults.some(cr => cr.result.rozstrel != null)
      )
    : false;

  const handleExportPdf = async () => {
    if (!printRef.current || !results) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPos = 10;
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let srcY = 0;
        while (remainingHeight > 0) {
          const sliceHeight = Math.min(pageHeight, remainingHeight);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = (sliceHeight / imgWidth) * canvas.width;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
            const sliceData = sliceCanvas.toDataURL('image/png');
            if (srcY > 0) pdf.addPage();
            pdf.addImage(sliceData, 'PNG', 10, 10, imgWidth, sliceHeight);
          }
          srcY += sliceCanvas.height;
          remainingHeight -= sliceHeight;
        }
      }

      pdf.save(`${getCompetitionLabel(results.competition)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Export PDF selhal. Zkuste to znovu.');
    }
  };

  const formatPosition = (position: number, allInCategory: { position: number }[]) => {
    const samePos = allInCategory.filter(cr => cr.position === position);
    if (samePos.length > 1 && position > 3) {
      const lastPos = position + samePos.length - 1;
      return `${position}.-${lastPos}.`;
    }
    return `${position}.`;
  };

  return (
    <div className="card" style={{ margin: '0 1rem 2rem 1rem', borderRadius: '10px' }}>
      <h2>Výsledky soutěží</h2>

      <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label htmlFor="competition-select">Vyberte soutěž</label>
          <select
            id="competition-select"
            value={selectedCompetitionId}
            onChange={(e) => setSelectedCompetitionId(e.target.value)}
          >
            <option value="">-- Vyberte soutěž --</option>
            {competitions.map(competition => (
              <option key={competition.id} value={competition.id}>
                {getCompetitionLabel(competition)}
              </option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '200px' }}>
          <label htmlFor="category-filter">Kategorie</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
          >
            <option value="">-- Všechny --</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        {results && (
          <button className="btn btn-primary" onClick={handleExportPdf}>
            📄 Export PDF
          </button>
        )}
      </div>

      {results && (
        <div ref={printRef} style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#8b6914' }}>
            {getCompetitionLabel(results.competition)}
          </h3>

          {results.absoluteWinners.length > 0 && (
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #e6b422 0%, #c99a2e 100%)',
              color: 'white',
              borderRadius: '10px'
            }}>
              <h4 style={{ marginBottom: '0.5rem' }}>
                🏆 {results.absoluteWinners.length > 1 ? 'Absolutní vítězové (nerozhodnuto)' : 'Absolutní vítěz'}
              </h4>
              {results.absoluteWinners.map((winner, idx) => (
                <p key={idx} style={{ fontSize: '1.2rem', marginBottom: idx < results.absoluteWinners.length - 1 ? '0.5rem' : 0 }}>
                  <strong>{winner.player.name}</strong> - {winner.result.total} bodů
                  {winner.result.rozstrel != null && (
                    <span> (rozstřel: {winner.result.rozstrel})</span>
                  )}
                  <br />
                  <small>({CATEGORY_LABELS[winner.result.categoryAtTime || winner.player.category]})</small>
                </p>
              ))}

              {results.absoluteTiedByTotal.length > 1 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                }}>
                  <p style={{ marginBottom: '0.75rem', fontWeight: 'bold' }}>
                    ⚡ Shoda bodů ({results.absoluteTiedByTotal.length} hráči s {results.absoluteTiedByTotal[0].result.total} body) – zadejte rozstřel:
                  </p>
                  {tiebreakMessage && (
                    <div style={{
                      marginBottom: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '5px',
                      background: tiebreakMessage.type === 'success' ? '#38a169' : '#e53e3e',
                      color: 'white',
                    }}>
                      {tiebreakMessage.text}
                    </div>
                  )}
                  {results.absoluteTiedByTotal.map((tied) => (
                    <div key={tied.result.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ minWidth: '200px' }}>
                        {tied.player.name}
                        <small style={{ opacity: 0.8 }}> ({CATEGORY_LABELS[tied.result.categoryAtTime || tied.player.category]})</small>:
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={tiebreakInputs[tied.result.id] ?? (tied.result.rozstrel != null ? String(tied.result.rozstrel) : '')}
                        onChange={(e) => setTiebreakInputs(prev => ({ ...prev, [tied.result.id]: e.target.value }))}
                        placeholder="Rozstřel (0-50)"
                        style={{
                          width: '140px',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '5px',
                          border: '1px solid rgba(255,255,255,0.4)',
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontSize: '0.95rem',
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const tied = results!.absoluteTiedByTotal;
                      let hasValue = false;
                      for (const t of tied) {
                        const val = tiebreakInputs[t.result.id];
                        if (val != null && val !== '') {
                          const num = parseInt(val);
                          if (isNaN(num) || num < 0 || num > 50) {
                            setTiebreakMessage({ type: 'error', text: `Neplatná hodnota pro ${t.player.name}. Zadejte číslo 0–50.` });
                            return;
                          }
                          hasValue = true;
                        }
                      }
                      if (!hasValue) {
                        setTiebreakMessage({ type: 'error', text: 'Zadejte rozstřel alespoň jednomu hráči.' });
                        return;
                      }
                      for (const t of tied) {
                        const val = tiebreakInputs[t.result.id];
                        if (val != null && val !== '') {
                          const updated = { ...t.result, rozstrel: parseInt(val) };
                          storage.results.update(updated);
                        }
                      }
                      setTiebreakInputs({});
                      setTiebreakMessage({ type: 'success', text: 'Rozstřel uložen – pořadí přepočítáno.' });
                      setRefresh(n => n + 1);
                      setTimeout(() => setTiebreakMessage(null), 3000);
                    }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '5px',
                      border: 'none',
                      background: 'white',
                      color: '#8b6914',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Uložit rozstřel
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'nowrap',
          }}>
            {Object.entries(results.categoryResults)
              .filter(([category]) => !categoryFilter || category === categoryFilter)
              .map(([category, categoryResults]) => (
              <div key={category} style={{
                flex: '1 1 0',
                minWidth: 0,
                background: '#fafafa',
                borderRadius: '8px',
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
              }}>
                <h4 style={{ marginBottom: '0.75rem', color: '#8b6914', fontSize: '1rem', textAlign: 'center' }}>
                  {CATEGORY_LABELS[category as Category]}
                </h4>
                {categoryResults.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: '1rem 0' }}>Žádné výsledky</p>
                ) : (
                  <table className="table" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '0.5rem' }}>#</th>
                        <th style={{ padding: '0.5rem' }}>Jméno</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>K1</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>K2</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>∑</th>
                        {hasAnyRozstrel && <th style={{ padding: '0.5rem', textAlign: 'center' }}>R</th>}
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
                            <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                              {item.position === 1 && '🥇'}
                              {item.position === 2 && '🥈'}
                              {item.position === 3 && '🥉'}
                              {item.position > 3 && formatPosition(item.position, categoryResults)}
                              {badgeClass && <span className={`badge ${badgeClass}`} style={{ marginLeft: '0.25rem', padding: '0.15rem 0.5rem', fontSize: '0.8rem' }}>
                                {item.position}.
                              </span>}
                            </td>
                            <td style={{ padding: '0.5rem' }}><strong>{item.player.name}</strong></td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.result.round1 ?? '-'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.result.round2 ?? '-'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}><strong>{item.result.total}</strong></td>
                            {hasAnyRozstrel && <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.result.rozstrel ?? '-'}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCompetitionId && !results && (
        <p style={{ color: '#999', marginTop: '1rem' }}>Načítání výsledků...</p>
      )}
    </div>
  );
}
