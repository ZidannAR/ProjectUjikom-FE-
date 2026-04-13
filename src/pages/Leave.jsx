import { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import Badge from '../components/Badge';
import SkeletonCard from '../components/SkeletonCard';

const ATTACHMENT_REQUIRED = {
  'Cuti Sakit': 'Surat Dokter',
  'Cuti Melahirkan': 'Surat Lahir / Buku Nikah',
  'Cuti Duka': 'Surat Kematian',
};

export default function Leave() {
  const { employee } = useAuth();
  const [tab, setTab] = useState('form');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  // Cek apakah jenis cuti wajib bukti (case-insensitive)
  const requiresAttachmentLabel = Object.entries(ATTACHMENT_REQUIRED)
    .find(([key]) => key.toLowerCase() === type.toLowerCase())?.[1] || null;

  // Duration calculator
  const duration = (() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  })();

  const fetchLeaves = useCallback(async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/employees/${employee.id}/leave-requests`);
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Leave fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [employee?.id]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check max size 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast('File terlalu besar! Maks. 2MB ⚠️', 'error');
      e.target.value = '';
      return;
    }

    setAttachment(file);

    // Preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setAttachmentPreview({ type: 'image', url: ev.target.result, name: file.name });
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview({ type: 'pdf', name: file.name });
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee?.id || !type || !startDate || !endDate) return;

    // Validasi tanggal
    if (new Date(endDate) < new Date(startDate)) {
      showToast('Tanggal selesai tidak boleh sebelum tanggal mulai ⚠️', 'error');
      return;
    }

    // Validasi attachment wajib
    if (requiresAttachmentLabel && !attachment) {
      showToast(`Wajib upload ${requiresAttachmentLabel} ⚠️`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', employee.id);
      formData.append('type', type);
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      if (attachment) formData.append('attachment', attachment);

      await api.post('/leave-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Pengajuan cuti berhasil dikirim! ✅', 'success');
      setType(''); setStartDate(''); setEndDate('');
      clearAttachment();
      setTab('history');
      fetchLeaves();
    } catch (err) {
      console.error('Leave submit error:', err.response?.data);
      const msg = err.response?.data?.message ?? 'Gagal mengajukan cuti ❌';
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
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Pengajuan Cuti</h1>
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Kelola cuti & izin {employee?.full_name || ''}</p>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: 20 }}>
        {/* ===== TABS ===== */}
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          <button className={`tab-item ${tab === 'form' ? 'active' : ''}`} onClick={() => setTab('form')}>
            Ajukan Cuti
          </button>
          <button className={`tab-item ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            Riwayat
          </button>
        </div>

        {tab === 'form' ? (
          /* ===== FORM TAB ===== */
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Jenis Cuti</label>
                <select
                  required
                  value={type}
                  onChange={e => { setType(e.target.value); clearAttachment(); }}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">Pilih jenis cuti...</option>
                  <option value="Cuti Tahunan">Cuti Tahunan</option>
                  <option value="Cuti Sakit">Cuti Sakit</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                  <option value="Cuti Duka">Cuti Duka</option>
                  <option value="Cuti Izin">Cuti Izin</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {duration > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  borderRadius: 12, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>📅</span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>
                    Durasi: {duration} hari
                  </p>
                </div>
              )}

              {/* ===== UPLOAD BUKTI (conditional) ===== */}
              {requiresAttachmentLabel && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    background: '#fef3c7',
                    borderRadius: 12, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: 0 }}>
                      Jenis cuti ini wajib melampirkan: <strong>{requiresAttachmentLabel}</strong>
                    </p>
                  </div>

                  {!attachmentPreview ? (
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, padding: '24px 16px',
                      border: '2px dashed #93c5fd', borderRadius: 14,
                      background: '#f0f7ff', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      <span style={{ fontSize: 32 }}>📤</span>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', margin: 0 }}>Klik untuk pilih file</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>JPG, PNG, atau PDF • Maks. 2MB</p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ) : (
                    <div style={{
                      position: 'relative',
                      border: '2px solid #dbeafe', borderRadius: 14,
                      padding: 12, background: '#f8fafc',
                    }}>
                      {/* Close button */}
                      <button
                        type="button"
                        onClick={clearAttachment}
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          width: 28, height: 28, borderRadius: '50%',
                          background: '#fee2e2', border: 'none',
                          color: '#dc2626', fontWeight: 800, fontSize: 14,
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>

                      {attachmentPreview.type === 'image' ? (
                        <img
                          src={attachmentPreview.url}
                          alt="Preview"
                          style={{
                            width: '100%', maxHeight: 200,
                            objectFit: 'contain', borderRadius: 10,
                          }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '8px 0',
                        }}>
                          <span style={{ fontSize: 32 }}>📄</span>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{attachmentPreview.name}</p>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Dokumen PDF</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 4 }}>
                {submitting ? 'Mengirim...' : '📤 Submit Pengajuan'}
              </button>
            </form>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        ) : (
          /* ===== HISTORY TAB ===== */
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonCard /><SkeletonCard />
            </div>
          ) : leaves.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>🏖️</p>
              <p style={{ fontWeight: 600, color: '#64748b' }}>Belum ada pengajuan cuti</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaves.map(leave => (
                <div key={leave.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{leave.type}</h3>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {leave.attachment_url && (
                        <a
                          href={leave.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#dbeafe', color: '#2563eb',
                            padding: '4px 10px', borderRadius: 8,
                            fontSize: 11, fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          📎 Bukti
                        </a>
                      )}
                      <Badge status={leave.status} />
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', gap: 12,
                    background: '#f8fafc', borderRadius: 12, padding: '10px 14px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Mulai</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {new Date(leave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ width: 1, background: '#e2e8f0' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Selesai</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {new Date(leave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ width: 1, background: '#e2e8f0' }} />
                    <div>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Durasi</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{leave.days} hari</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
