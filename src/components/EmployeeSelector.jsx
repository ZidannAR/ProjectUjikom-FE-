import { useEffect } from 'react';
import useEmployeeList from '../hooks/useEmployeeList';

export default function EmployeeSelector({ selectedEmployeeId, onSelect }) {
  const { employees, loading, error } = useEmployeeList();

  // Auto-select karyawan pertama jika belum ada yang dipilih
  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      onSelect(employees[0].id);
    }
  }, [employees, selectedEmployeeId, onSelect]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        padding: '10px 16px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 500,
      }}>
        ⏳ Memuat daftar karyawan...
      </div>
    );
  }

  // Error / kosong state
  if (error || employees.length === 0) {
    return (
      <div style={{
        padding: '10px 16px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        fontSize: 13,
        color: '#fef08a',
        fontWeight: 500,
      }}>
        ⚠️ Tidak ada karyawan ditemukan
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(8px)',
      padding: '8px 14px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.3)',
    }}>
      <span style={{ fontSize: 16 }}>👤</span>
      <select
        value={selectedEmployeeId || ''}
        onChange={e => onSelect(parseInt(e.target.value))}
        style={{
          flex: 1,
          background: 'white',
          border: 'none',
          outline: 'none',
          fontSize: 13,
          fontWeight: 600,
          color: '#1e3a8a',
          cursor: 'pointer',
          borderRadius: 8,
          padding: '6px 10px',
          fontFamily: 'inherit',
        }}
      >
        <option value="" disabled>Pilih Karyawan</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.full_name || emp.name} ({emp.shift?.name || 'No Shift'})
          </option>
        ))}
      </select>
    </div>
  );
}
