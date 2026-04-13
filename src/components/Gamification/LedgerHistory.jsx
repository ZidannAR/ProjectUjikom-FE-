import { useState, useEffect, useCallback } from 'react';
import { getLedgerHistory } from '../../api/gamificationService';

const TYPE_CONFIG = {
  EARN:    { icon: '✅', color: '#10b981', bg: '#dcfce7', label: '+' },
  SPEND:   { icon: '🎁', color: '#3b82f6', bg: '#dbeafe', label: '-' },
  PENALTY: { icon: '⚠️', color: '#ef4444', bg: '#fee2e2', label: '-' },
};

function formatDate(isoString) {
  const d = new Date(isoString);
  const day = d.toLocaleDateString('id-ID', { weekday: 'long' });
  const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${date} • ${time}`;
}

function SkeletonRow() {
  return (
    <div className="gf-ledger-item" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ height: 12, width: '80%' }} />
          <div className="skeleton" style={{ height: 10, width: '55%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div className="skeleton" style={{ height: 14, width: 60 }} />
          <div className="skeleton" style={{ height: 10, width: 80 }} />
        </div>
      </div>
    </div>
  );
}

export default function LedgerHistory() {
  const [ledgers, setLedgers] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLedger = useCallback(async (p = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await getLedgerHistory(p);
      const data = res.data;
      const items = data.data || [];
      setLedgers(prev => append ? [...prev, ...items] : items);
      setPage(data.current_page || p);
      setLastPage(data.last_page || 1);
    } catch (err) {
      console.error('Ledger fetch error', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger(1);
  }, [fetchLedger]);

  const handleLoadMore = () => {
    if (page < lastPage) {
      fetchLedger(page + 1, true);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (ledgers.length === 0) {
    return (
      <div className="card" style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>Belum ada riwayat poin</h3>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          Riwayat mutasi poin integritas kamu akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {ledgers.map((item) => {
        const cfg = TYPE_CONFIG[item.transaction_type] || TYPE_CONFIG.EARN;
        const isPositive = item.transaction_type === 'EARN';
        const pointColor = isPositive ? '#10b981' : '#ef4444';
        const pointSign = isPositive ? '+' : '-';

        return (
          <div key={item.id} className="gf-ledger-item">
            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: cfg.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              {cfg.icon}
            </div>

            {/* Description & date */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 600, fontSize: 13, color: '#1e293b',
                margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {item.description}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500 }}>
                {formatDate(item.created_at)}
              </p>
            </div>

            {/* Points & balance */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{
                fontWeight: 800, fontSize: 15, color: pointColor,
                margin: 0,
              }}>
                {pointSign}{Math.abs(item.amount)} poin
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                Saldo: {item.current_balance} poin
              </p>
            </div>
          </div>
        );
      })}

      {/* Load More */}
      {page < lastPage && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          style={{
            padding: '12px 0', borderRadius: 14, border: '2px solid #667eea',
            background: 'transparent', color: '#667eea', fontWeight: 700,
            fontSize: 14, cursor: loadingMore ? 'not-allowed' : 'pointer',
            marginTop: 4, opacity: loadingMore ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
        </button>
      )}
    </div>
  );
}
