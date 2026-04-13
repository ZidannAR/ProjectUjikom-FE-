import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

/* ─── Star Component (read-only) ─── */
function StarDisplay({ score, max = 5, size = 20 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < Math.round(score) ? '#f6c23e' : '#e0e0e0'} stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

/* ─── Radar Chart (pure SVG/Canvas) ─── */
function RadarChart({ categories, scores, size = 220 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !categories.length) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const n  = categories.length;
    const toXY = (idx, val, maxVal = 5) => {
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      const dist  = (val / maxVal) * r;
      return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
    };

    ctx.clearRect(0, 0, size, size);

    // Grid circles
    for (let level = 1; level <= 5; level++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const [x, y] = toXY(i, level);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < n; i++) {
      const [x, y] = toXY(i, 5);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#ddd';
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    scores.forEach((s, i) => {
      const [x, y] = toXY(i, s);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle   = 'rgba(59, 130, 246, 0.18)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth   = 2;
    ctx.fill();
    ctx.stroke();

    // Labels
    ctx.fillStyle  = '#555';
    ctx.font       = 'bold 10px sans-serif';
    ctx.textAlign  = 'center';
    for (let i = 0; i < n; i++) {
      const [x, y] = toXY(i, 5.8);
      ctx.fillText(categories[i], x, y + 4);
    }
  }, [categories, scores, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}

export default function Assessment() {
  const { employee } = useAuth();
  const navigate     = useNavigate();
  const [tab, setTab]             = useState('latest');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!employee?.id) return;
    setLoading(true);
    api.get(`/employees/${employee.id}/assessments`)
      .then(r => setAssessments(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Gagal memuat data penilaian.'))
      .finally(() => setLoading(false));
  }, [employee?.id]);

  const latest = assessments[0] ?? null;
  const radarCategories = latest?.categories?.map(c => c.category_name) ?? [];
  const radarScores     = latest?.categories?.map(c => c.score) ?? [];

  const avgLabel = (avg) => {
    if (avg >= 4.5) return { text: 'Sangat Baik', color: '#16a34a' };
    if (avg >= 3.5) return { text: 'Baik',        color: '#3b82f6' };
    if (avg >= 2.5) return { text: 'Cukup',       color: '#d97706' };
    return                  { text: 'Perlu Ditingkatkan', color: '#dc2626' };
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 40 }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Tombol Back */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.18)', border: 'none',
              borderRadius: 12, padding: '6px 14px', color: 'white',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              marginBottom: 14, backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
          </button>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Performa Kinerja Anda</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Penilaian Kinerja ⭐</h1>
          {employee?.department?.name && (
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{employee.department.name}</p>
          )}
        </div>
      </div>

      <div className="page-content" style={{ marginTop: -24, paddingBottom: 120 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <p style={{ marginTop: 8 }}>Memuat data penilaian...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: '#dc2626' }}>
            <p>{error}</p>
          </div>
        ) : assessments.length === 0 ? (
          /* ── Empty State ── */
          <div className="card" style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>Belum ada penilaian</h3>
            <p style={{ fontSize: 14 }}>Hasil penilaian kinerja Anda akan muncul di sini setelah admin melakukan evaluasi.</p>
          </div>
        ) : (
          <>
            {/* Tab Nav */}
            <div style={{ display: 'flex', gap: 8, marginTop: 25, marginBottom: 16 }}>
              {['latest','history'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    background: tab === t ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : '#f1f5f9',
                    color: tab === t ? '#fff' : '#64748b',
                    transition: 'all .2s',
                  }}>
                  {t === 'latest' ? '🏆 Terbaru' : '📜 Semua Riwayat'}
                </button>
              ))}
            </div>

            {tab === 'latest' && latest && (
              <>
                {/* Summary Card */}
                <div className="card-hero" style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                      {latest.period_type} – {latest.period_label}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>
                          {Number(latest.average_score).toFixed(2)}
                        </h2>
                        <p style={{ fontSize: 12, opacity: 0.8, margin: '2px 0' }}>rata-rata dari 5</p>
                        <StarDisplay score={latest.average_score} size={22} />
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.9 }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.2)', borderRadius: 20,
                          padding: '4px 14px', fontWeight: 700, fontSize: 13,
                        }}>
                          {avgLabel(latest.average_score).text}
                        </span>
                        <p style={{ marginTop: 8, fontSize: 11 }}>
                          {new Date(latest.assessment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar Chart */}
                {radarCategories.length > 0 && (
                  <div className="card" style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: '#475569', marginBottom: 12 }}>Grafik Radar Performa</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <RadarChart categories={radarCategories} scores={radarScores} size={220} />
                    </div>
                  </div>
                )}

                {/* Score per Kategori */}
                <div className="card" style={{ marginTop: 16, marginBottom: 16 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontWeight: 700, color: '#475569', margin: 0 }}>Nilai per Kategori</p>
                  </div>
                  {latest.categories?.map((cat, i) => (
                    <div key={i} style={{
                      padding: '12px 16px',
                      borderBottom: i < latest.categories.length - 1 ? '1px solid #f8fafc' : 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{cat.category_name}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarDisplay score={cat.score} size={16} />
                        <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: 14 }}>{cat.score}/5</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Catatan */}
                {latest.general_notes && (
                  <div className="card" style={{ padding: 16, marginTop: 16, marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>💬 Catatan dari Admin</p>
                    <p style={{
                      fontSize: 14, color: '#64748b', lineHeight: 1.6,
                      background: '#f8fafc', borderRadius: 8, padding: 12,
                      borderLeft: '3px solid #3b82f6', margin: 0,
                    }}>
                      {latest.general_notes}
                    </p>
                  </div>
                )}
              </>
            )}

            {tab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assessments.map((a, i) => {
                  const lbl = avgLabel(a.average_score);
                  return (
                    <div key={i} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{a.period_type} – {a.period_label}</p>
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 6px' }}>
                            {new Date(a.assessment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <StarDisplay score={a.average_score} size={16} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontWeight: 900, fontSize: 22, color: lbl.color,
                          }}>{Number(a.average_score).toFixed(2)}</div>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: lbl.color,
                            background: lbl.color + '1a', borderRadius: 12, padding: '2px 8px',
                          }}>{lbl.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
