import { useState, useEffect } from 'react';

export default function useEmployee() {
  const [employeeId, setEmployeeId] = useState(() => {
    return localStorage.getItem('absen_employee_id') || '';
  });

  useEffect(() => {
    if (employeeId) {
      localStorage.setItem('absen_employee_id', employeeId);
    }
  }, [employeeId]);

  return { employeeId, setEmployeeId };
}
