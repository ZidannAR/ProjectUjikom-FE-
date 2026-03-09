export default function Badge({ status }) {
  const config = {
    // Attendance
    ontime:   { bg: '#dcfce7', color: '#16a34a', label: 'On Time' },
    late:     { bg: '#fef9c3', color: '#ca8a04', label: 'Terlambat' },
    alpha:    { bg: '#fee2e2', color: '#dc2626', label: 'Alpha' },
    sick:     { bg: '#dbeafe', color: '#2563eb', label: 'Sakit' },
    leave:    { bg: '#f1f5f9', color: '#475569', label: 'Cuti' },
    izin:     { bg: '#f1f5f9', color: '#475569', label: 'Izin' },
    // Leave requests
    pending:  { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
    approved: { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
    rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  };

  const key = status?.toLowerCase() || '';
  const c = config[key] || { bg: '#f1f5f9', color: '#475569', label: status || '-' };

  return (
    <span
      className="badge"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
