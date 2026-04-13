import { useState, useEffect, useRef } from 'react';
import { useGamification } from '../../context/GamificationContext';

const LEVEL_CONFIG = {
  'Pemula':         { emoji: '🌱', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  'Berkembang':     { emoji: '📈', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  'Disiplin':       { emoji: '🏆', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  'Disiplin Elite': { emoji: '⭐', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
};

export default function BalanceCard() {
  const { integrityPoints, level, rank, totalEmployees, loading } = useGamification();
  const [displayPoints, setDisplayPoints] = useState(0);
  const animRef = useRef(null);

  // Count-up animation
  useEffect(() => {
    if (loading) return;
    const target = integrityPoints;
    const duration = 1000;
    const startTime = performance.now();
    const startVal = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayPoints(Math.round(startVal + (target - startVal) * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [integrityPoints, loading]);

  const levelCfg = LEVEL_CONFIG[level] || LEVEL_CONFIG['Pemula'];

  if (loading) {
    return (
      <div className="gf-wallet-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
          <div className="skeleton" style={{ width: 120, height: 40, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 180, height: 16, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="gf-wallet-card">
      {/* Decorative circles */}
      <div className="gf-wallet-circle gf-wallet-circle-1" />
      <div className="gf-wallet-circle gf-wallet-circle-2" />
      <div className="gf-wallet-circle gf-wallet-circle-3" />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Label */}
        <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
          Poin Integritas
        </p>

        {/* Points number */}
        <div className="gf-points-display">
          <span className="gf-points-number">{displayPoints.toLocaleString('id-ID')}</span>
          <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7, marginLeft: 6 }}>poin</span>
        </div>

        {/* Level badge */}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: levelCfg.bg, color: 'white',
            padding: '5px 16px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
            border: `1px solid ${levelCfg.color}40`,
          }}>
            {levelCfg.emoji} {level}
          </span>
        </div>

        {/* Rank */}
        <p style={{ marginTop: 14, fontSize: 13, opacity: 0.75, fontWeight: 500 }}>
          Peringkat #{rank} dari {totalEmployees} karyawan
        </p>
      </div>
    </div>
  );
}
