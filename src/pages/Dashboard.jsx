import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import Badge from '../components/Badge';
import SkeletonCard from '../components/SkeletonCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [today, setToday] = useState(null);
  const [leaveStats, setLeaveStats] = useState({ pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    if (!employee?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [todayRes, leaveRes] = await Promise.all([
          api.get(`/employees/${employee.id}/attendance/today`),
          api.get(`/employees/${employee.id}/leave-requests`),
        ]);

        setToday(todayRes.data);

        const leaves = Array.isArray(leaveRes.data) ? leaveRes.data : [];
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        setLeaveStats({
          pending: leaves.filter(l => l.status?.toLowerCase() === 'pending').length,
          approved: leaves.filter(l => {
            if (l.status?.toLowerCase() !== 'approved') return false;
            const d = new Date(l.start_date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          }).length,
        });
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [employee?.id]);

  return (
    <div className="animate-in">
      {/* ===== HEADER ===== */}
      <div className="page-header" style={{ paddingBottom: 40 }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>{todayDate}</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            Selamat Datang, {employee?.full_name || ''} 👋
          </h1>
          {employee?.department?.name && (
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{employee.department.name}</p>
          )}
        </div>
      </div>

      <div className="page-content" style={{ marginTop: -24 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SkeletonCard height={120} />
            <SkeletonCard height={80} />
            <SkeletonCard height={80} />
          </div>
        ) : (
          <>
            {/* ===== HERO CARD ===== */}
            <div className="card-hero" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div>
                  <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Status Hari Ini</p>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                    {today?.present ? 'Sudah Absen ✅' : 'Belum Absen ❌'}
                  </h2>
                  {today?.present && (
                    <Badge status={today.status_in} />
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, opacity: 0.9, position: 'relative', zIndex: 2 }}>
                  <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Shift</p>
                  <p style={{ fontWeight: 700 }}>{today?.shift_name || employee?.shift?.name || '-'}</p>
                </div>
              </div>

              {/* Time display */}
              <div style={{
                display: 'flex', gap: 12, marginTop: 20,
                position: 'relative', zIndex: 2,
              }}>
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.12)',
                  borderRadius: 14, padding: '12px 16px', backdropFilter: 'blur(4px)',
                }}>
                  <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Clock In</p>
                  <p style={{ fontSize: 22, fontWeight: 800 }}>
                    {today?.clock_in ? today.clock_in.substring(0, 5) : '--:--'}
                  </p>
                </div>
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.12)',
                  borderRadius: 14, padding: '12px 16px', backdropFilter: 'blur(4px)',
                }}>
                  <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Clock Out</p>
                  <p style={{ fontSize: 22, fontWeight: 800 }}>
                    {today?.clock_out ? today.clock_out.substring(0, 5) : '--:--'}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== INFO GRID ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#d97706' }}>{leaveStats.pending}</p>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Cuti Pending</p>
              </div>
              <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{leaveStats.approved}</p>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Approved Bulan Ini</p>
              </div>
            </div>

            {/* ===== CTA BUTTONS ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-primary" onClick={() => navigate('/')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <rect width="5" height="5" x="9.5" y="9.5" rx="1" />
                </svg>
                Scan QR Absensi
              </button>
              <button className="btn-outline" onClick={() => navigate('/leave')}>
                📝 Ajukan Cuti
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
