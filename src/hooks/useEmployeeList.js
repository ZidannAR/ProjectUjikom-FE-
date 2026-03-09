import { useState, useEffect } from 'react';
import api from '../api/axios';

let cachedEmployees = null;
let cachePromise = null;

export default function useEmployeeList() {
  const [employees, setEmployees] = useState(cachedEmployees || []);
  const [loading, setLoading] = useState(!cachedEmployees);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Jika sudah ada cache, langsung pakai
    if (cachedEmployees) {
      setEmployees(cachedEmployees);
      setLoading(false);
      return;
    }

    // Jika sudah ada request berjalan, tunggu hasilnya
    if (!cachePromise) {
      cachePromise = api.get('/employees')
        .then(res => {
          // Handle res.data.data ATAU res.data
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          cachedEmployees = data;
          return data;
        })
        .catch(err => {
          cachePromise = null; // Reset agar bisa retry
          throw err;
        });
    }

    setLoading(true);
    cachePromise
      .then(data => {
        setEmployees(data);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch employees', err);
        setError('Gagal memuat daftar karyawan');
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { employees, loading, error };
}
