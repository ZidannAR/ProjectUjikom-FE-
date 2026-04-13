import { useState, useEffect } from 'react';
import { getMyTokens } from '../../api/gamificationService';

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

export default function TokenInventory({ onSwitchTab }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyTokens();
        setTokens(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Token fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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

          return (
            <div key={token.id} className="gf-token-card">
              {/* Left dashed border accent */}
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
                {item.item_type === 'WFH' && (
                  <p style={{ fontSize: 12, color: '#667eea', margin: '0 0 8px', fontWeight: 600 }}>
                    Gunakan token ini untuk bekerja dari rumah
                  </p>
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
    </div>
  );
}
