import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GamificationProvider, useGamification } from '../context/GamificationContext';
import BalanceCard from '../components/Gamification/BalanceCard';
import LedgerHistory from '../components/Gamification/LedgerHistory';
import Marketplace from '../components/Gamification/Marketplace';
import TokenInventory from '../components/Gamification/TokenInventory';

const TABS = [
  { key: 'riwayat',     label: '📜 Riwayat' },
  { key: 'marketplace', label: '🛍️ Marketplace' },
  { key: 'inventori',   label: '🎫 Inventori' },
];

function WalletContent() {
  const navigate = useNavigate();
  const { refreshSummary } = useGamification();
  const [activeTab, setActiveTab] = useState('riwayat');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleToast = useCallback(({ type, message }) => {
    setToast({ type, message });
  }, []);

  const handleSwitchTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div className="gf-page-header">
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Back button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', border: 'none',
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
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Kelola Poin Integritas Kamu</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            Dompet Integritas 💎
          </h1>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: -24, paddingBottom: 120 }}>
        {/* Balance Card */}
        <BalanceCard />

        {/* Tab Navigation */}
        <div className="gf-tab-bar" style={{ marginTop: 20, marginBottom: 16 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`gf-tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="gf-tab-content">
          {activeTab === 'riwayat' && <LedgerHistory />}
          {activeTab === 'marketplace' && <Marketplace onToast={handleToast} />}
          {activeTab === 'inventori' && <TokenInventory onSwitchTab={handleSwitchTab} onToast={handleToast} />}
        </div>
      </div>
    </div>
  );
}

export default function IntegrityWallet() {
  return (
    <GamificationProvider>
      <WalletContent />
    </GamificationProvider>
  );
}
