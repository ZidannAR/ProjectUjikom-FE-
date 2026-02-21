import React, { useEffect, useState, useCallback, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import axios from "axios";
import { useGeolocation } from "./hooks/useGeolocation";

const AttendanceScanner = () => {
  // geoError tidak lagi menyebabkan error linting karena kita gunakan di UI
  const { lat, lng, getLocation, error: geoError } = useGeolocation();
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("Siap Scan");

  // State untuk memilih ID Karyawan secara manual untuk testing
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(2);

  const scannerRef = useRef(null);

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => setDeviceId(result.visitorId));

    getLocation();
  }, [getLocation]);

const handleAttendance = useCallback(
  async (qrToken) => {
    if (!lat || !lng) {
      alert("GPS belum aktif! Pastikan izin lokasi diberikan.");
      return;
    }

    setStatus("Sedang memproses...");

    try {
      const dataAbsen = {
        employee_id: selectedEmployeeId,
        qr_token: qrToken,
        device_id: deviceId,
        lat: lat,
        lng: lng,
      };

      const response = await axios.post(
        "https://nonforeign-pseudoaggressively-carly.ngrok-free.dev/api/attendance/scan",
        dataAbsen
      );

      // --- PERUBAHAN DI SINI ---
      // Jika server mengirim data debug, tampilkan di status
      if (response.data.debug_token_seharusnya) {
        setStatus("DEBUG DATA:\n" + JSON.stringify(response.data, null, 2));
      } else {
        alert(response.data.message);
        setStatus("Selesai: " + response.data.message);
      }
      // -------------------------

    } catch (err) {
  const serverResponse = err.response?.data;

  if (serverResponse?.message === "QR Expired, silakan scan ulang.") {
    setStatus("QR Expired — scan ulang...");
    
    // restart scanner
    scannerRef.current?.render();
    return;
  }

  if (serverResponse) {
    setStatus("ERROR:\n" + JSON.stringify(serverResponse, null, 2));
  } else {
    setStatus("Error koneksi ke server.");
  }
}
  },
  [lat, lng, deviceId, selectedEmployeeId]
);

  useEffect(() => {
    if (!deviceId || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    scanner.render((decodedText) => {
      scanner
        .clear()
        .then(() => {
          handleAttendance(decodedText);
        })
        .catch((err) => console.error(err));
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [deviceId, handleAttendance]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <h2>Absensi QR Dinamis</h2>

      {/* Dropdown untuk Testing Identitas */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Pilih Karyawan:
        </label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))}
          style={{ width: "100%", padding: "8px", borderRadius: "5px" }}
        >
          <option value="2">Budi (Pagi)</option>
          <option value="3">Siti (Siang)</option>
          <option value="4">Maulana (Malam)</option>
        </select>
      </div>

      <div id="reader"></div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "12px",
          border: "1px solid #d0e3ff",
        }}
      >
        <p>
          Status: <strong>{status}</strong>
        </p>
        <div style={{ textAlign: "left", fontSize: "0.8em", color: "#666" }}>
          <p>
            <strong>Device ID:</strong> {deviceId || "Loading..."}
          </p>
          <p>
            <strong>Lokasi:</strong>{" "}
            {lat ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Mencari GPS..."}
          </p>
          {geoError && <p style={{ color: "red" }}>⚠️ {geoError}</p>}
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
