import React, { useEffect, useState, useCallback, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from "axios";
import { useGeolocation } from "./hooks/useGeolocation";

const AttendanceScanner = () => {
  const { lat, lng, getLocation, error: geoError } = useGeolocation();
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("Siap Scan");
  const scannerRef = useRef(null); // Gunakan ref agar scanner tidak duplikat

  // 1. Ambil Device ID & Lokasi satu kali saat mount
  useEffect(() => {
    FingerprintJS.load()
      .then(fp => fp.get())
      .then(result => setDeviceId(result.visitorId));
    
    getLocation();
  }, []); // Empty array agar running sekali saja

  // 2. Fungsi Kirim Absensi
  const handleAttendance = useCallback(async (qrToken) => {
    if (!lat || !lng) {
        alert("GPS belum aktif! Pastikan izin lokasi diberikan.");
        return;
    }

    setStatus("Sedang memproses...");

    try {
      // Pastikan URL API sesuai dengan route Laravel Anda
      const response = await axios.post("http://127.0.0.1:8000/api/attendance/scan", {
        employee_id: 1, // ID Tester
        qr_token: qrToken, // Token dinamis 5 detik [cite: 2026-01-30]
        device_id: deviceId, // Binding perangkat [cite: 2026-01-30]
        lat: lat,
        lng: lng
      });

      alert(response.data.message);
      setStatus("Selesai!");
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan");
      setStatus("Gagal! Scan ulang.");
      // Jika gagal, buat scanner baru setelah beberapa detik bisa ditambahkan di sini
    }
  }, [lat, lng, deviceId]);

  // 3. Setup UI Scanner
  useEffect(() => {
    if (!deviceId || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    });

    scanner.render((decodedText) => {
      // Stop scanner segera agar tidak banjir request dalam jendela 5 detik [cite: 2026-01-30]
      scanner.clear().then(() => {
          handleAttendance(decodedText);
      }).catch(err => console.error(err));
    });

    scannerRef.current = scanner;

    return () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(e => console.error(e));
            scannerRef.current = null;
        }
    };
  }, [deviceId, handleAttendance]);

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "20px", 
      fontFamily: "sans-serif",
      maxWidth: "500px",
      margin: "auto" 
    }}>
      <h2 style={{ color: "#333" }}>Absensi QR Dinamis</h2>
      
      {/* Tampilan Box Scanner */}
      <div id="reader" style={{ 
        width: "100%", 
        borderRadius: "15px", 
        overflow: "hidden", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
      }}></div>
      
      {/* Panel Informasi Status */}
      <div style={{ 
        marginTop: "20px", 
        padding: "20px", 
        background: status === "Gagal!" ? "#fff5f5" : "#f0f7ff", 
        borderRadius: "12px",
        border: "1px solid #d0e3ff"
      }}>
        <p style={{ margin: "5px 0" }}>Status: <strong style={{ color: "#007bff" }}>{status}</strong></p>
        <hr style={{ border: "0.5px solid #eee" }} />
        <div style={{ textAlign: "left", fontSize: "0.85em", color: "#666" }}>
            <p><strong>Device ID:</strong> {deviceId || "Loading..."}</p>
            <p><strong>Koordinat:</strong> {lat ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "Mencari GPS..."}</p>
            {geoError && <p style={{ color: "red" }}>⚠️ {geoError}</p>}
        </div>
      </div>

      <p style={{ fontSize: "0.75em", color: "#999", marginTop: "15px" }}>
        QR Code berganti setiap 5 detik. Pastikan koneksi stabil. [cite: 2026-01-30]
      </p>
    </div>
  );
};

export default AttendanceScanner;