import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, checkDuplicate } from '../../api/helpdeskService';

const CATEGORIES = [
  { value: '', label: 'Pilih kategori...' },
  { value: 'Teknis', label: 'Teknis' },
  { value: 'HR', label: 'HR' },
  { value: 'Fasilitas', label: 'Fasilitas' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const PRIORITIES = [
  { value: '', label: 'Pilih prioritas...' },
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const statusBadgeStyle = (status) => {
  const map = {
    open: { bg: '#fee2e2', color: '#dc2626' },
    in_progress: { bg: '#fef9c3', color: '#ca8a04' },
    closed: { bg: '#dcfce7', color: '#16a34a' },
  };
  return map[status?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569' };
};

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState(null); // null = belum cek, [] = tidak ada
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!subject.trim() || subject.trim().length < 10) e.subject = 'Subject minimal 10 karakter';
    if (!category) e.category = 'Kategori wajib dipilih';
    if (!priority) e.priority = 'Prioritas wajib dipilih';
    if (!description.trim() || description.trim().length < 20) e.description = 'Deskripsi minimal 20 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckAndSubmit = async () => {
    if (!validate()) return;

    setChecking(true);
    setDuplicates(null);
    try {
      const res = await checkDuplicate(subject, description);
      const similar = res.data?.similar_tickets || [];
      if (similar.length > 0) {
        setDuplicates(similar);
        setChecking(false);
        return;
      }
      // No duplicates — submit langsung
      await submitTicket(false);
    } catch (err) {
      console.error('Check duplicate error', err);
      // Jika endpoint error, langsung submit aja
      await submitTicket(false);
    } finally {
      setChecking(false);
    }
  };

  const submitTicket = async (forceCreate) => {
    setSubmitting(true);
    try {
      const payload = {
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
      };
      if (forceCreate) payload.force_create = true;

      const res = await createTicket(payload);
      const ticketId = res.data?.ticket?.id || res.data?.id;
      showToast('Tiket berhasil dibuat! ✅');
      setTimeout(() => {
        if (ticketId) {
          navigate(`/helpdesk/${ticketId}`);
        } else {
          navigate('/helpdesk');
        }
      }, 800);
    } catch (err) {
      console.error('Create ticket error', err);
      const msg = err.response?.data?.message || 'Gagal membuat tiket. Silakan coba lagi.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '2px solid #e2e8f0',
    fontSize: 14,
    fontWeight: 500,
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fafc',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 6,
    display: 'block',
  };

  const errorStyle = {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    fontWeight: 500,
  };

  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.variant === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => navigate('/helpdesk')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              marginBottom: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ← Kembali
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📝 Buat Tiket Baru</h1>
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Sampaikan kendala yang Anda alami</p>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Subject */}
            <div>
              <label style={labelStyle}>Subject *</label>
              <input
                type="text"
                placeholder="Contoh: Tidak bisa scan QR absensi"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.subject ? '#dc2626' : '#e2e8f0' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = errors.subject ? '#dc2626' : '#e2e8f0'}
              />
              {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
            </div>

            {/* Category & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Kategori *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, borderColor: errors.category ? '#dc2626' : '#e2e8f0' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = errors.category ? '#dc2626' : '#e2e8f0'}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.category && <p style={errorStyle}>{errors.category}</p>}
              </div>
              <div>
                <label style={labelStyle}>Prioritas *</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  style={{ ...inputStyle, borderColor: errors.priority ? '#dc2626' : '#e2e8f0' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = errors.priority ? '#dc2626' : '#e2e8f0'}
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {errors.priority && <p style={errorStyle}>{errors.priority}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Deskripsi *</label>
              <textarea
                rows={5}
                placeholder="Jelaskan kendala yang Anda alami secara detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: 120,
                  borderColor: errors.description ? '#dc2626' : '#e2e8f0',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = errors.description ? '#dc2626' : '#e2e8f0'}
              />
              {errors.description && <p style={errorStyle}>{errors.description}</p>}
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>
                {description.trim().length} / min 20 karakter
              </p>
            </div>

            {/* ===== DUPLICATE SECTION ===== */}
            {duplicates && duplicates.length > 0 && (
              <div style={{
                background: '#fffbeb',
                border: '2px solid #fde68a',
                borderRadius: 16,
                padding: 16,
                animation: 'fadeIn 0.3s ease-out',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', margin: 0 }}>
                    Aduan Serupa Ditemukan
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {duplicates.map(dup => {
                    const sb = statusBadgeStyle(dup.status);
                    return (
                      <div key={dup.id} style={{
                        background: 'white',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{ flex: 1, marginRight: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0, marginBottom: 4 }}>
                            {dup.subject}
                          </p>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span className="badge" style={{ backgroundColor: sb.bg, color: sb.color, fontSize: 10, padding: '2px 8px' }}>
                              {dup.status}
                            </span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(dup.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/helpdesk/${dup.id}`)}
                          style={{
                            background: '#dbeafe',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#2563eb',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Lihat Tiket
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => submitTicket(true)}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    border: '2px solid #f59e0b',
                    background: 'white',
                    color: '#92400e',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Mengirim...' : 'Tetap Buat Tiket Baru'}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="btn-primary"
              onClick={handleCheckAndSubmit}
              disabled={checking || submitting}
              style={{ marginTop: 4, opacity: (checking || submitting) ? 0.7 : 1 }}
            >
              {checking ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                  }} />
                  Memeriksa duplikasi...
                </>
              ) : submitting ? 'Mengirim...' : '🔍 Cek Duplikasi & Kirim'}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
