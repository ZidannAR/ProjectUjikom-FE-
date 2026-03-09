import { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

export default function Profile() {
  const { employee, user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!employee?.id) return;
    try {
      const res = await api.get(`/employees/${employee.id}`);
      setProfile(res.data);
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [employee?.id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const initials = employee?.full_name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const detail = profile?.detail;

  const InfoRow = ({ icon, label, value }) => (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <span style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in">
      {/* ===== HEADER ===== */}
      <div className="page-header" style={{ paddingBottom: 50, textAlign: 'center' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Photo */}
          {detail?.photo_url ? (
            <img
              src={detail.photo_url}
              alt="Foto"
              style={{
                width: 96, height: 96, borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: 'white',
              margin: '0 auto',
              border: '4px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}>
              {initials}
            </div>
          )}

          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '14px 0 2px', color: 'white' }}>
            {profile?.full_name || employee?.full_name || 'Loading...'}
          </h1>
          <p style={{ fontSize: 13, opacity: 0.75, color: 'white' }}>
            {profile?.employee_code || employee?.employee_code}
          </p>
          {profile && (
            <span style={{
              display: 'inline-block', marginTop: 8,
              padding: '4px 14px', borderRadius: 20,
              background: profile.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              color: profile.is_active ? '#bbf7d0' : '#fecaca',
              fontSize: 12, fontWeight: 700,
              border: `1px solid ${profile.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {profile.is_active ? '● Aktif' : '● Nonaktif'}
            </span>
          )}
        </div>
      </div>

      <div className="page-content" style={{ marginTop: -24 }}>
        {loading ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8' }}>Memuat data profil...</p>
          </div>
        ) : (
          <>
            {/* ===== INFORMASI PEKERJAAN ===== */}
            <div className="card" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                Informasi Pekerjaan
              </h3>
              <InfoRow icon="🏢" label="Department" value={profile?.department} />
              <InfoRow icon="⏰" label="Shift"
                value={profile?.shift
                  ? `${profile.shift.name} (${profile.shift.start_time} - ${profile.shift.end_time})`
                  : null}
              />
              <InfoRow icon="📅" label="Tanggal Mulai Kerja"
                value={detail?.join_date
                  ? new Date(detail.join_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : null}
              />
            </div>

            {/* ===== DATA PRIBADI ===== */}
            <div className="card" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                Data Pribadi
              </h3>
              {detail ? (
                <>
                  <InfoRow icon="📍" label="Tempat, Tanggal Lahir"
                    value={detail.birth_place && detail.birth_date
                      ? `${detail.birth_place}, ${new Date(detail.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : detail.birth_place || (detail.birth_date ? new Date(detail.birth_date).toLocaleDateString('id-ID') : null)}
                  />
                  <InfoRow icon={detail.gender === 'Laki-laki' ? '👨' : '👩'} label="Jenis Kelamin" value={detail.gender} />
                  <InfoRow icon="📱" label="No. Telepon" value={detail.phone} />
                  <InfoRow icon="🏠" label="Alamat" value={detail.address} />
                  <InfoRow icon="🎓" label="Pendidikan Terakhir" value={detail.last_education} />
                </>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '28px 16px',
                  background: '#f8fafc', borderRadius: 12,
                }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📋</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b', margin: 0 }}>
                    Data lengkap belum diisi
                  </p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Hubungi admin untuk melengkapi data profil Anda
                  </p>
                </div>
              )}
            </div>

            {/* ===== AKUN ===== */}
            <div className="card" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Akun</h3>
              <div style={{
                background: '#f8fafc', borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              }}>
                <span style={{ fontSize: 20 }}>📧</span>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Email</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{user?.email || '-'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                style={{
                  width: '100%', padding: '14px 20px',
                  borderRadius: 14, border: '2px solid #fecaca',
                  background: '#fff1f2', color: '#dc2626',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                🚪 Logout
              </button>
            </div>
          </>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
