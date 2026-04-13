import { useState } from 'react';
import { activateWFHToken } from '../../api/gamificationService';

function formatDateIDFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function WFHDatePicker({ token, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minDate = getTomorrow();

  const handleActivate = async () => {
    if (!selectedDate) {
      setError('Pilih tanggal terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await activateWFHToken(token.id, selectedDate);
      onSuccess?.(selectedDate);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengaktifkan token WFH. Silakan coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gf-modal-overlay" onClick={onClose}>
      <div className="gf-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: '#1e293b', margin: '0 0 6px' }}>
            Pilih Tanggal WFH
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Pilih tanggal kapan kamu ingin Work From Home
          </p>
        </div>

        {/* Date Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 600,
            color: '#475569', marginBottom: 6,
          }}>
            Tanggal WFH
          </label>
          <input
            type="date"
            value={selectedDate}
            min={minDate}
            onChange={(e) => { setSelectedDate(e.target.value); setError(''); }}
            style={{
              width: '100%', padding: '12px 14px',
              borderRadius: 12, border: '2px solid #e2e8f0',
              fontSize: 15, fontWeight: 600, color: '#1e293b',
              outline: 'none', transition: 'border-color 0.2s',
              background: '#f8fafc', boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          {selectedDate && (
            <p style={{
              fontSize: 12, color: '#667eea', fontWeight: 600,
              margin: '8px 0 0', textAlign: 'center',
            }}>
              📅 {formatDateIDFull(selectedDate)}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2', color: '#dc2626',
            padding: '10px 14px', borderRadius: 10,
            fontSize: 13, fontWeight: 600, marginBottom: 14,
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 12,
              border: '2px solid #e2e8f0', background: 'white',
              fontWeight: 700, fontSize: 14, color: '#64748b',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', opacity: loading ? 0.5 : 1,
            }}
          >
            Batalkan
          </button>
          <button
            onClick={handleActivate}
            disabled={loading || !selectedDate}
            className="gf-btn-purchase"
            style={{
              flex: 1, opacity: loading || !selectedDate ? 0.6 : 1,
              cursor: loading || !selectedDate ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="gf-spinner" />
                Memproses...
              </span>
            ) : (
              '✅ Aktifkan Token'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
