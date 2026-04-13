import { useState, useEffect } from 'react';
import { getMarketplaceItems, purchaseItem } from '../../api/gamificationService';
import { useGamification } from '../../context/GamificationContext';

const TYPE_ICONS = {
  LATE_FORGIVENESS:   '⏰',
  ABSENT_FORGIVENESS: '📝',
  WFH:               '🏠',
};

export default function Marketplace({ onToast }) {
  const { integrityPoints, refreshSummary } = useGamification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null); // itemId currently purchasing
  const [confirmItem, setConfirmItem] = useState(null); // item to confirm

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getMarketplaceItems();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Marketplace fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handlePurchase = async (item) => {
    setConfirmItem(null);
    setPurchasing(item.id);
    try {
      const res = await purchaseItem(item.id);
      onToast?.({ type: 'success', message: res.data.message || `Berhasil menukar ${item.item_name}!` });
      await refreshSummary();
      await fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menukar item. Silakan coba lagi.';
      onToast?.({ type: 'error', message: msg });
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="gf-marketplace-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="skeleton" style={{ width: 50, height: 50, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '80%', height: 14 }} />
              <div className="skeleton" style={{ width: '60%', height: 12 }} />
              <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 12 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
        <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>Marketplace Kosong</h3>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          Belum ada item yang tersedia saat ini. Cek lagi nanti ya!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="gf-marketplace-grid">
        {items.map((item) => {
          const canAfford = integrityPoints >= item.point_cost;
          const isProcessing = purchasing === item.id;
          const isPurchasingAny = purchasing !== null;
          const icon = TYPE_ICONS[item.item_type] || '🎯';

          return (
            <div key={item.id} className="gf-marketplace-card">
              {/* Icon */}
              <div style={{
                fontSize: 36, textAlign: 'center', marginBottom: 8,
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                {icon}
              </div>

              {/* Name */}
              <h4 style={{
                fontWeight: 700, fontSize: 14, color: '#1e293b',
                textAlign: 'center', margin: '0 0 6px',
              }}>
                {item.item_name}
              </h4>

              {/* Description */}
              <p style={{
                fontSize: 12, color: '#64748b', textAlign: 'center',
                lineHeight: 1.4, margin: '0 0 8px', minHeight: 34,
              }}>
                {item.description}
              </p>

              {/* Forgiveness info */}
              {item.item_type === 'LATE_FORGIVENESS' && item.forgiveness_minutes && (
                <p style={{
                  fontSize: 11, color: '#667eea', fontWeight: 600,
                  textAlign: 'center', margin: '0 0 8px',
                  background: '#667eea10', borderRadius: 8, padding: '4px 8px',
                }}>
                  Bebas telat hingga {item.forgiveness_minutes} menit
                </p>
              )}

              {/* Price */}
              <p style={{
                textAlign: 'center', fontWeight: 800, fontSize: 15,
                color: '#667eea', margin: '0 0 12px',
              }}>
                💎 {item.point_cost} Poin
              </p>

              {/* Purchase button */}
              <button
                onClick={() => canAfford && !isPurchasingAny && setConfirmItem(item)}
                disabled={!canAfford || isPurchasingAny}
                className={canAfford ? 'gf-btn-purchase' : 'gf-btn-purchase-disabled'}
              >
                {isProcessing ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className="gf-spinner" />
                    Memproses...
                  </span>
                ) : canAfford ? (
                  '🔄 Tukar'
                ) : (
                  'Poin Kurang'
                )}
              </button>

              {/* Monthly limit info */}
              {item.stock_limit && (
                <p style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>
                  Dibeli {item.monthly_purchased}/{item.stock_limit} bulan ini
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmItem && (
        <div className="gf-modal-overlay" onClick={() => setConfirmItem(null)}>
          <div className="gf-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {TYPE_ICONS[confirmItem.item_type] || '🎯'}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: '#1e293b', margin: '0 0 8px' }}>
                Konfirmasi Penukaran
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Yakin ingin menukar <strong>{confirmItem.item_name}</strong> seharga{' '}
                <strong style={{ color: '#667eea' }}>💎 {confirmItem.point_cost} Poin</strong>?
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmItem(null)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  border: '2px solid #e2e8f0', background: 'white',
                  fontWeight: 700, fontSize: 14, color: '#64748b',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handlePurchase(confirmItem)}
                className="gf-btn-purchase"
                style={{ flex: 1 }}
              >
                Ya, Tukar!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
