import { createContext, useState, useCallback, useContext } from 'react';
import { getGamificationSummary } from '../api/gamificationService';

const GamificationContext = createContext(null);

export function GamificationProvider({ children }) {
  const [integrityPoints, setIntegrityPoints] = useState(0);
  const [level, setLevel] = useState('Pemula');
  const [rank, setRank] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getGamificationSummary();
      const data = res.data;
      setIntegrityPoints(data.integrity_points ?? 0);
      setLevel(data.level ?? 'Pemula');
      setRank(data.rank ?? 0);
      setTotalEmployees(data.total_employees ?? 0);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) return; // handled by axios interceptor
      setError('Gagal memuat data gamifikasi.');
      console.error('Gamification summary error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GamificationContext.Provider value={{
      integrityPoints, level, rank, totalEmployees,
      loading, error, refreshSummary,
      setIntegrityPoints,
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

export default GamificationContext;
