import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

export default function ChangePassword() {
  const { token, mustChangePassword, completePasswordChange } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If not logged in, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // If already changed password, redirect to dashboard
  if (!mustChangePassword) return <Navigate to="/dashboard" replace />;

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return { text: '', color: '#e2e8f0', percent: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { text: 'Lemah', color: '#ef4444', percent: 25 };
    if (score === 2) return { text: 'Sedang', color: '#f59e0b', percent: 50 };
    if (score === 3) return { text: 'Kuat', color: '#22c55e', percent: 75 };
    return { text: 'Sangat Kuat', color: '#10b981', percent: 100 };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    if (newPassword === 'ganti123') {
      setError('Password baru tidak boleh sama dengan password default.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Password baru tidak boleh sama dengan password lama.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setSuccess(true);

      // Fetch user data and update context
      await completePasswordChange();

      // Redirect after short delay
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.current_password?.[0]
        || err.response?.data?.errors?.new_password?.[0]
        || 'Gagal mengubah password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
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
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #06b6d4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -80, left: -80 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -60, right: -40 }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: 32,
          }}>🔐</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>Ganti Password</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Demi keamanan, ganti password default Anda</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 24,
          padding: '28px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>
          {/* Warning */}
          <div style={{
            background: '#fef3c7', border: '1px solid #fcd34d',
            borderRadius: 14, padding: '12px 16px',
            marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <p style={{ fontSize: 12, color: '#92400e', fontWeight: 600, margin: 0 }}>
              Anda menggunakan password default. Wajib ganti sebelum melanjutkan.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{
              background: '#dcfce7', border: '1px solid #86efac',
              borderRadius: 14, padding: '12px 16px',
              marginBottom: 20, textAlign: 'center',
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{ fontSize: 13, color: '#166534', fontWeight: 700, margin: '4px 0 0' }}>
                Password berhasil diubah! Mengalihkan...
              </p>
            </div>
          )}

          {error && (
            <div style={{
              background: '#fee2e2', color: '#dc2626',
              padding: '12px 16px', borderRadius: 12,
              fontSize: 13, fontWeight: 600, marginBottom: 16, textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Current Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Password Saat Ini</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94a3b8' }}>🔒</span>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Password lama"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, color: '#94a3b8' }}>
                  {showCurrent ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Password Baru</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94a3b8' }}>🔑</span>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, color: '#94a3b8' }}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength Indicator */}
              {newPassword && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Kekuatan Password</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.text}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      width: `${strength.percent}%`, height: '100%',
                      background: strength.color, borderRadius: 4,
                      transition: 'width 0.3s, background 0.3s',
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Konfirmasi Password Baru</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#94a3b8' }}>🔑</span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : '#e2e8f0',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = confirmPassword && confirmPassword !== newPassword ? '#ef4444' : '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0, color: '#94a3b8' }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: 4 }}>Password tidak cocok</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary"
              style={{
                marginTop: 4,
                opacity: (loading || success) ? 0.7 : 1,
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 18, height: 18,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Menyimpan...
                </span>
              ) : '🔐 Ganti Password'}
            </button>
          </form>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}
