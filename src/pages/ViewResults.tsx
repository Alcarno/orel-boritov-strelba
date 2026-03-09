import { useState, useRef } from 'react';
import { Competition, COMPETITION_TYPE_LABELS, CATEGORY_LABELS, Category } from '../types';
import { storage } from '../utils/storage';
import { calculateResults } from '../utils/results';

export function ViewResults() {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');
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
    <div className="card">
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
                🏆 {results.absoluteWinners.length > 1 ? 'Absolutní vítězové (shoda)' : 'Absolutní vítěz'}
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
            </div>
          )}

          {Object.entries(results.categoryResults)
            .filter(([category]) => !categoryFilter || category === categoryFilter)
            .map(([category, categoryResults]) => (
            <div key={category} style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
              <h4 style={{ marginBottom: '1rem', color: '#555' }}>
                {CATEGORY_LABELS[category as Category]}
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
                      {hasAnyRozstrel && <th>Rozstřel</th>}
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
                            {item.position > 3 && formatPosition(item.position, categoryResults)}
                            {badgeClass && <span className={`badge ${badgeClass}`} style={{ marginLeft: '0.5rem' }}>
                              {item.position}.
                            </span>}
                          </td>
                          <td><strong>{item.player.name}</strong></td>
                          <td>{item.result.round1 ?? '-'}</td>
                          <td>{item.result.round2 ?? '-'}</td>
                          <td><strong>{item.result.total}</strong></td>
                          {hasAnyRozstrel && <td>{item.result.rozstrel ?? '-'}</td>}
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
