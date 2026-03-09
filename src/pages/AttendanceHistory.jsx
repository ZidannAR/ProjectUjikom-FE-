import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import Badge from '../components/Badge';
import SkeletonCard from '../components/SkeletonCard';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

export default function AttendanceHistory() {
  const { employee } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee?.id) { setLoading(false); return; }
    setLoading(true);
    api.get(`/employees/${employee.id}/attendance`, { params: { month, year } })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setData(list);
      })
      .catch(err => console.error('Attendance fetch error', err))
      .finally(() => setLoading(false));
  }, [employee?.id, month, year]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return { day: DAYS[d.getDay()], date: d.getDate(), monthName: MONTHS[d.getMonth()] };
  };

  return (
    <div className="animate-in">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Riwayat Absensi</h1>
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Rekap kehadiran {employee?.full_name || ''}</p>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: -20 }}>
        {/* ===== FILTER PILLS ===== */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 14,
              border: '2px solid #dbeafe', background: 'white',
              fontWeight: 600, fontSize: 13, color: '#3b82f6',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{
              padding: '10px 14px', borderRadius: 14,
              border: '2px solid #dbeafe', background: 'white',
              fontWeight: 600, fontSize: 13, color: '#3b82f6',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* ===== LIST ===== */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : data.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📋</p>
            <p style={{ fontWeight: 600, color: '#64748b' }}>Tidak ada data absensi</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              Belum ada riwayat kehadiran untuk bulan {MONTHS[month - 1]} {year}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map(record => {
              const { day, date, monthName } = formatDate(record.work_date);
              return (
                <div key={record.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 16, color: '#3b82f6',
                      }}>
                        {date}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{day}</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>{date} {monthName}</p>
                      </div>
                    </div>
                    <Badge status={record.status_in} />
                  </div>

                  <div style={{
                    display: 'flex', gap: 12,
                    background: '#f8fafc', borderRadius: 12, padding: '10px 14px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Masuk</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
                        {record.clock_in ? record.clock_in.substring(0, 5) : '--:--'}
                      </p>
                    </div>
                    <div style={{ width: 1, background: '#e2e8f0' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Pulang</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#dc2626' }}>
                        {record.clock_out ? record.clock_out.substring(0, 5) : '--:--'}
                      </p>
                    </div>
                    <div style={{ width: 1, background: '#e2e8f0' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Shift</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                        {record.shift_name || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
