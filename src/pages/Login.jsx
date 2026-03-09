import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const { login, isAuthenticated, mustChangePassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Jika sudah login, redirect ke dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Jika token ada tapi harus ganti password
  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      // Jika harus ganti password
      if (data.must_change_password) {
        navigate('/change-password');
        return;
      }

      // Normal login — redirect handled by isAuthenticated check above
    } catch (err) {
      console.error('Login error full:', err);
      let msg;
      if (err.response) {
        console.error('Server response:', err.response.status, err.response.data);
        msg = err.response.data?.message
          || err.response.data?.errors?.email?.[0]
          || `Server error: ${err.response.status}`;
      } else if (err.request) {
        console.error('No response received:', err.request);
        msg = 'Tidak dapat terhubung ke server. Periksa koneksi internet dan pastikan server Laravel berjalan.';
      } else {
        msg = err.message || 'Terjadi kesalahan tidak diketahui.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #06b6d4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -80, right: -80 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -60, left: -40 }} />

      <div style={{
        width: '100%',
        maxWidth: 400,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Logo / Icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0 }}>AbsenKu</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>Sistem Kehadiran Karyawan</p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: '32px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4, textAlign: 'center' }}>
            Masuk Akun Karyawan
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>
            Gunakan email dan password Anda
          </p>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94a3b8' }}>📧</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: 14,
                    border: '2px solid #e2e8f0',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#1e293b',
                    outline: 'none',
                    background: '#f8fafc',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94a3b8' }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 44px',
                    borderRadius: 14,
                    border: '2px solid #e2e8f0',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#1e293b',
                    outline: 'none',
                    background: '#f8fafc',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
                    color: '#94a3b8',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 18, height: 18,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}
