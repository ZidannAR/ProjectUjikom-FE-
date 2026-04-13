import { useState, useEffect, useCallback } from 'react';
import { getMyTokens, getWFHSchedule } from '../../api/gamificationService';
import WFHDatePicker from './WFHDatePicker';

const TYPE_ICONS = {
  LATE_FORGIVENESS:   '⏰',
  ABSENT_FORGIVENESS: '📝',
  WFH:               '🏠',
};

function formatDateID(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateIDFull(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function TokenInventory({ onSwitchTab, onToast }) {
  const [tokens, setTokens] = useState([]);
  const [wfhSchedule, setWfhSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wfhPickerToken, setWfhPickerToken] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tokensRes, scheduleRes] = await Promise.all([
        getMyTokens(),
        getWFHSchedule().catch(() => ({ data: [] })),
      ]);
      setTokens(Array.isArray(tokensRes.data) ? tokensRes.data : []);
      setWfhSchedule(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
    } catch (err) {
      console.error('Token fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWFHSuccess = (dateStr) => {
    setWfhPickerToken(null);
    onToast?.({
      type: 'success',
      message: `Token WFH berhasil dijadwalkan untuk ${formatDateIDFull(dateStr)}!`,
    });
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '70%' }} />
                <div className="skeleton" style={{ height: 10, width: '90%' }} />
                <div className="skeleton" style={{ height: 10, width: '50%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Info box */}
      <div className="gf-info-box">
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
          Token akan otomatis digunakan sistem saat kamu absen. Kamu tidak perlu melakukan apapun.
        </p>
      </div>

      {tokens.length === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
          <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>Belum memiliki token</h3>
          <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
            Kamu belum memiliki token apapun. Kunjungi Marketplace untuk menukar poin!
          </p>
          <button
            onClick={() => onSwitchTab?.('marketplace')}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102,126,234,0.35)',
              transition: 'all 0.2s',
            }}
          >
            🛍️ Buka Marketplace
          </button>
        </div>
      ) : (
        tokens.map((token) => {
          const item = token.item || {};
          const icon = TYPE_ICONS[item.item_type] || '🎯';
          const isWFH = item.item_type === 'WFH';
          const hasWfhDate = isWFH && token.wfh_date;

          return (
            <div key={token.id} className="gf-token-card">
              {/* Left accent */}
              <div className="gf-token-accent" />

              <div style={{ padding: '16px 16px 16px 20px' }}>
                {/* Status badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: '#dcfce7', color: '#16a34a',
                    padding: '3px 10px', borderRadius: 8,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    AKTIF ✓
                  </span>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                </div>

                {/* Item name */}
                <h4 style={{ fontWeight: 800, fontSize: 16, color: '#1e293b', margin: '0 0 6px' }}>
                  {item.item_name || 'Token'}
                </h4>

                {/* Description based on type */}
                {item.item_type === 'LATE_FORGIVENESS' && item.forgiveness_minutes && (
                  <p style={{ fontSize: 12, color: '#667eea', margin: '0 0 8px', fontWeight: 600 }}>
                    Token ini akan otomatis digunakan sistem saat kamu terlambat ≤ {item.forgiveness_minutes} menit
                  </p>
                )}
                {item.item_type === 'ABSENT_FORGIVENESS' && (
                  <p style={{ fontSize: 12, color: '#667eea', margin: '0 0 8px', fontWeight: 600 }}>
                    Token ini akan otomatis digunakan sistem saat kamu tidak hadir
                  </p>
                )}
                {isWFH && !hasWfhDate && (
                  <p style={{ fontSize: 12, color: '#667eea', margin: '0 0 8px', fontWeight: 600 }}>
                    Gunakan token ini untuk bekerja dari rumah
                  </p>
                )}

                {/* WFH: Scheduled badge OR Schedule button */}
                {isWFH && (
                  hasWfhDate ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#dcfce7', borderRadius: 10,
                      padding: '8px 14px', margin: '10px 0 4px',
                    }}>
                      <span style={{ fontSize: 14 }}>✅</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', margin: 0 }}>
                          Dijadwalkan: {formatDateIDFull(token.wfh_date)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setWfhPickerToken(token)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, width: '100%', padding: '10px 0',
                        borderRadius: 12, border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        color: 'white', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', marginTop: 10,
                        boxShadow: '0 3px 12px rgba(59,130,246,0.30)',
                        transition: 'all 0.2s',
                      }}
                    >
                      📅 Jadwalkan WFH
                    </button>
                  )
                )}

                {/* Dates */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
                    📅 Dibeli: {formatDateID(token.purchased_at)}
                  </p>
                  {token.expired_at && (
                    <p style={{ fontSize: 11, color: '#f59e0b', margin: 0, fontWeight: 500 }}>
                      ⏳ Berlaku hingga: {formatDateID(token.expired_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* ═══ Jadwal WFH Section ═══ */}
      <div style={{ marginTop: 8 }}>
        <h4 style={{
          fontWeight: 800, fontSize: 15, color: '#1e293b',
          margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          📅 Jadwal WFH Saya
        </h4>

        {wfhSchedule.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, textAlign: 'center', padding: '12px 0' }}>
            Belum ada jadwal WFH
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wfhSchedule.map((schedule, i) => (
              <div key={schedule.id || i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'white', borderRadius: 14,
                padding: '12px 16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  🏠
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 700, fontSize: 13, color: '#1e293b', margin: 0,
                  }}>
                    {formatDateIDFull(schedule.wfh_date)}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                    Menunggu hari H
                  </p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#3b82f6',
                  background: '#dbeafe', padding: '3px 8px', borderRadius: 6,
                }}>
                  WFH
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WFH Date Picker Modal */}
      {wfhPickerToken && (
        <WFHDatePicker
          token={wfhPickerToken}
          onClose={() => setWfhPickerToken(null)}
          onSuccess={handleWFHSuccess}
        />
      )}
    </div>
  );
}
