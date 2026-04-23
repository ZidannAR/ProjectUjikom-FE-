import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getTicketDetail, replyTicket, rateTicket } from '../../api/helpdeskService';
import SkeletonCard from '../../components/SkeletonCard';

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

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const chatEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reply
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  // Rating
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTicketDetail(ticketId);
      const data = res.data?.ticket || res.data;
      setTicket(data);
      setResponses(data.responses || res.data?.responses || []);
    } catch (err) {
      console.error('Ticket detail error', err);
      setError('Gagal memuat detail tiket.');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    setReplying(true);
    try {
      await replyTicket(ticketId, replyMessage.trim());
      setReplyMessage('');
      showToast('Balasan terkirim! ✅');
      await fetchDetail();
    } catch (err) {
      console.error('Reply error', err);
      showToast(err.response?.data?.message || 'Gagal mengirim balasan.', 'error');
    } finally {
      setReplying(false);
    }
  };

  const handleRate = async () => {
    if (ratingScore < 1) {
      showToast('Pilih skor rating terlebih dahulu ⚠️', 'error');
      return;
    }
    setRatingSubmitting(true);
    try {
      await rateTicket(ticketId, ratingScore, ratingFeedback.trim());
      showToast('Rating berhasil dikirim! ✅');
      await fetchDetail();
    } catch (err) {
      console.error('Rate error', err);
      showToast(err.response?.data?.message || 'Gagal mengirim rating.', 'error');
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 12, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: '70%', height: 20, marginBottom: 8, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 8 }} />
          </div>
        </div>
        <div className="page-content" style={{ marginTop: 20 }}>
          <SkeletonCard /><div style={{ height: 12 }} /><SkeletonCard /><div style={{ height: 12 }} /><SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <button onClick={() => navigate('/helpdesk')} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 10,
              cursor: 'pointer', marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>← Kembali</button>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Detail Tiket</h1>
          </div>
        </div>
        <div className="page-content" style={{ marginTop: 20 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>⚠️</p>
            <p style={{ fontWeight: 600, color: '#dc2626', fontSize: 14 }}>{error || 'Tiket tidak ditemukan.'}</p>
            <button className="btn-primary" onClick={fetchDetail} style={{ marginTop: 16, maxWidth: 200, margin: '16px auto 0' }}>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sb = statusBadge(ticket.status);
  const pb = priorityBadge(ticket.priority);
  const isClosed = ticket.status?.toLowerCase() === 'closed';
  const hasRating = ticket.rating_score != null;

  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.variant === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="page-header" style={{ minHeight: 160 }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <button onClick={() => navigate('/helpdesk')} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 10,
            cursor: 'pointer', marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>← Kembali</button>

          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.4 }}>
            {ticket.subject}
          </h1>

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>{sb.label}</span>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>{pb.label}</span>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: 20 }}>
        {/* ===== INFO BAR ===== */}
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Kategori</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{ticket.category || '-'}</p>
            </div>
            <div style={{ width: 1, background: '#e2e8f0' }} />
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Dibuat</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{formatDate(ticket.created_at)}</p>
            </div>
            <div style={{ width: 1, background: '#e2e8f0' }} />
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>ID Tiket</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>#{String(ticket.id).padStart(3, '0')}</p>
            </div>
          </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        {ticket.description && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Deskripsi</p>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{ticket.description}</p>
          </div>
        )}

        {/* ===== CHAT THREAD ===== */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
            💬 Percakapan ({responses.length})
          </p>

          {responses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 28 }}>
              <p style={{ fontSize: 32, marginBottom: 4 }}>💭</p>
              <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Belum ada percakapan</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {responses.map((msg, idx) => {
                const isAdmin = msg.is_admin || msg.responder_type === 'admin';
                const senderName = isAdmin ? 'Admin' : (msg.user?.name || msg.sender_name || employee?.full_name || 'Anda');
                const initials = isAdmin ? 'AD' : getInitials(senderName);

                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: isAdmin ? 'row-reverse' : 'row',
                      gap: 8,
                      alignItems: 'flex-end',
                      animation: 'fadeIn 0.3s ease-out',
                      animationDelay: `${idx * 0.05}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: isAdmin
                        ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
                        : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                      color: isAdmin ? 'white' : '#475569',
                    }}>
                      {initials}
                    </div>

                    {/* Bubble */}
                    <div style={{
                      flex: 1,
                      maxWidth: '80%',
                      background: isAdmin ? '#eff6ff' : '#f8fafc',
                      borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      border: `1px solid ${isAdmin ? '#bfdbfe' : '#e2e8f0'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isAdmin ? '#2563eb' : '#475569' }}>
                          {senderName}
                        </span>
                        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>
                          {formatDateTime(msg.created_at)}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
                        {msg.message}
                      </p>
                      {msg.is_auto_reply && (
                        <span style={{
                          display: 'inline-block', marginTop: 6,
                          background: '#dbeafe', color: '#2563eb',
                          fontSize: 10, fontWeight: 600, padding: '2px 8px',
                          borderRadius: 6,
                        }}>
                          🤖 Auto Reply
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* ===== REPLY FORM ===== */}
        {!isClosed && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <textarea
              rows={3}
              placeholder="Tulis balasan..."
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '2px solid #e2e8f0', fontSize: 14, fontWeight: 500,
                color: '#1e293b', outline: 'none', background: '#f8fafc',
                fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical',
                minHeight: 80, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              className="btn-primary"
              onClick={handleReply}
              disabled={replying || !replyMessage.trim()}
              style={{ marginTop: 10, opacity: (replying || !replyMessage.trim()) ? 0.6 : 1 }}
            >
              {replying ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                  }} />
                  Mengirim...
                </>
              ) : '📤 Kirim Balasan'}
            </button>
          </div>
        )}

        {/* ===== RATING SECTION ===== */}
        {isClosed && (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            {hasRating ? (
              /* Already rated */
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                  Penilaian Anda
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ fontSize: 28, color: star <= ticket.rating_score ? '#f59e0b' : '#e2e8f0' }}>
                      ★
                    </span>
                  ))}
                </div>
                {ticket.rating_feedback && (
                  <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', marginBottom: 8 }}>
                    "{ticket.rating_feedback}"
                  </p>
                )}
                <p style={{
                  fontSize: 13, fontWeight: 600, color: '#16a34a',
                  background: '#dcfce7', display: 'inline-block',
                  padding: '6px 14px', borderRadius: 10,
                }}>
                  Terima kasih atas penilaian Anda ✅
                </p>
              </div>
            ) : (
              /* Rate form */
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4, textAlign: 'center' }}>
                  Bagaimana penanganan tiket ini?
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 14 }}>
                  Berikan penilaian untuk membantu kami meningkatkan layanan
                </p>

                {/* Stars */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRatingScore(star)}
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 36, padding: 2,
                        color: star <= (ratingHover || ratingScore) ? '#f59e0b' : '#e2e8f0',
                        transition: 'transform 0.15s ease, color 0.15s ease',
                        transform: star <= (ratingHover || ratingScore) ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {ratingScore > 0 && (
                  <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 12 }}>
                    {['', 'Sangat Buruk', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'][ratingScore]}
                  </p>
                )}

                {/* Feedback */}
                <textarea
                  rows={2}
                  placeholder="Feedback tambahan (opsional)..."
                  value={ratingFeedback}
                  onChange={e => setRatingFeedback(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '2px solid #e2e8f0', fontSize: 13, fontWeight: 500,
                    color: '#1e293b', outline: 'none', background: '#f8fafc',
                    fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none',
                    transition: 'border-color 0.2s', marginBottom: 12,
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />

                <button
                  className="btn-primary"
                  onClick={handleRate}
                  disabled={ratingSubmitting || ratingScore < 1}
                  style={{ opacity: (ratingSubmitting || ratingScore < 1) ? 0.6 : 1 }}
                >
                  {ratingSubmitting ? 'Mengirim...' : '⭐ Kirim Rating'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
