import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getMyTickets } from '../../api/helpdeskService';
import SkeletonCard from '../../components/SkeletonCard';

const STATUS_TABS = [
  { key: '', label: 'Semua' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'closed', label: 'Closed' },
];

const statusBadge = (status) => {
  const map = {
    open: { bg: '#fee2e2', color: '#dc2626', label: 'Open' },
    in_progress: { bg: '#fef9c3', color: '#ca8a04', label: 'In Progress' },
    closed: { bg: '#dcfce7', color: '#16a34a', label: 'Closed' },
  };
  const s = status?.toLowerCase() || '';
  return map[s] || { bg: '#f1f5f9', color: '#475569', label: status || '-' };
};

const priorityBadge = (priority) => {
  const map = {
    high: { bg: '#fee2e2', color: '#dc2626', label: 'Tinggi' },
    tinggi: { bg: '#fee2e2', color: '#dc2626', label: 'Tinggi' },
    mid: { bg: '#fff7ed', color: '#ea580c', label: 'Sedang' },
    medium: { bg: '#fff7ed', color: '#ea580c', label: 'Sedang' },
    sedang: { bg: '#fff7ed', color: '#ea580c', label: 'Sedang' },
    low: { bg: '#f1f5f9', color: '#64748b', label: 'Rendah' },
    rendah: { bg: '#f1f5f9', color: '#64748b', label: 'Rendah' },
  };
  const p = priority?.toLowerCase() || '';
  return map[p] || { bg: '#f1f5f9', color: '#64748b', label: priority || '-' };
};

const categoryBadge = (cat) => ({
  bg: '#dbeafe', color: '#2563eb', label: cat || '-',
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export default function HelpdeskPage() {
  const { employee } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyTickets(page, activeTab);
      const data = res.data;
      // Support both paginated and simple array responses
      if (Array.isArray(data)) {
        setTickets(data);
        setLastPage(1);
      } else {
        setTickets(data.data || []);
        setLastPage(data.last_page || 1);
      }
    } catch (err) {
      console.error('Helpdesk fetch error', err);
      setError('Gagal memuat tiket. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Reset page when tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const renderBadge = (cfg, extraStyle = {}) => (
    <span className="badge" style={{ backgroundColor: cfg.bg, color: cfg.color, ...extraStyle }}>
      {cfg.label}
    </span>
  );

  return (
    <div className="animate-in">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>🎫 Helpdesk</h1>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Laporkan kendala Anda</p>
          </div>
          <button
            onClick={() => navigate('/helpdesk/create')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              padding: '10px 16px',
              borderRadius: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            + Buat Tiket
          </button>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: 20 }}>
        {/* ===== TABS ===== */}
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              className={`tab-item ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => handleTabChange(t.key)}
              style={{ fontSize: 12 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== CONTENT ===== */}
        {error ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>⚠️</p>
            <p style={{ fontWeight: 600, color: '#dc2626', fontSize: 14 }}>{error}</p>
            <button className="btn-primary" onClick={fetchTickets} style={{ marginTop: 16, maxWidth: 200, margin: '16px auto 0' }}>
              Coba Lagi
            </button>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 56, marginBottom: 12 }}>📭</p>
            <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, marginBottom: 4 }}>Belum ada tiket</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Buat tiket pertama Anda!</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/helpdesk/create')}
              style={{ marginTop: 20, maxWidth: 240, margin: '20px auto 0' }}
            >
              + Buat Tiket Baru
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map(ticket => {
              const sb = statusBadge(ticket.status);
              const pb = priorityBadge(ticket.priority);
              const cb = categoryBadge(ticket.category);
              const isClosed = ticket.status?.toLowerCase() === 'closed';
              const hasRating = ticket.rating_score != null;

              return (
                <div
                  key={ticket.id}
                  className="card"
                  style={{ padding: 16, cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                  onClick={() => navigate(`/helpdesk/${ticket.id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,130,246,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(59,130,246,0.10)'; }}
                >
                  {/* Row 1: Subject + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.subject}
                    </h3>
                    {renderBadge(sb)}
                  </div>

                  {/* Row 2: Category + Priority + Replies */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {renderBadge(cb, { fontSize: 11, padding: '3px 8px' })}
                    {renderBadge(pb, { fontSize: 11, padding: '3px 8px' })}
                    {ticket.responses_count != null && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#64748b',
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}>
                        💬 {ticket.responses_count} balasan
                      </span>
                    )}
                  </div>

                  {/* Row 3: Date + Rating CTA */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                      {formatDate(ticket.created_at)}
                    </span>
                    {isClosed && !hasRating && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/helpdesk/${ticket.id}`); }}
                        style={{
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          border: 'none',
                          borderRadius: 10,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#92400e',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        ⭐ Beri Rating
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ===== PAGINATION ===== */}
            {lastPage > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, border: 'none',
                    background: page <= 1 ? '#e2e8f0' : '#3b82f6',
                    color: page <= 1 ? '#94a3b8' : 'white',
                    fontWeight: 600, fontSize: 13, cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ←
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                  {page} / {lastPage}
                </span>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, border: 'none',
                    background: page >= lastPage ? '#e2e8f0' : '#3b82f6',
                    color: page >= lastPage ? '#94a3b8' : 'white',
                    fontWeight: 600, fontSize: 13, cursor: page >= lastPage ? 'not-allowed' : 'pointer',
                  }}
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
