import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import AttendanceScanner from './AttendanceScanner';
import Dashboard from './pages/Dashboard';
import AttendanceHistory from './pages/AttendanceHistory';
import Leave from './pages/Leave';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Change password — requires token but not full auth */}
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><AttendanceScanner /><BottomNav /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /><BottomNav /></ProtectedRoute>} />
        <Route path="/attendance-history" element={<ProtectedRoute><AttendanceHistory /><BottomNav /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><Leave /><BottomNav /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /><BottomNav /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}