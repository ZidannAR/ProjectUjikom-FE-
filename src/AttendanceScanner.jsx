import React, { useEffect, useState, useCallback, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import api from "./api/axios";
import { useGeolocation } from "./hooks/useGeolocation";
import useAuth from "./hooks/useAuth";

const AttendanceScanner = () => {
  const { lat, lng, getLocation, error: geoError } = useGeolocation();
  const { employee } = useAuth();
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("ready"); // ready | processing | success | error
  const [statusMessage, setStatusMessage] = useState("Siap untuk scan");
  const [currentTime, setCurrentTime] = useState(new Date());

  const scannerRef = useRef(null);

  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => setDeviceId(result.visitorId));
    getLocation();
  }, [getLocation]);

  const resetScanner = useCallback(() => {
    setStatus("ready");
    setStatusMessage("Siap untuk scan");

    // Cleanup old scanner first
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }

    // Re-create scanner
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: "environment",
        },
      });
      scanner.render((decodedText) => {
        scanner.clear().then(() => handleAttendance(decodedText)).catch(console.error);
      });
      scannerRef.current = scanner;
    }, 300);
  }, []);

  const handleAttendance = useCallback(
    async (qrToken) => {
      if (!lat || !lng) {
        setStatus("error");
        setStatusMessage("GPS belum aktif! Pastikan izin lokasi diberikan.");
        return;
      }

      if (!employee?.id) {
        setStatus("error");
        setStatusMessage("Data karyawan tidak ditemukan.");
        return;
      }

      setStatus("processing");
      setStatusMessage("Sedang memproses absensi...");

      try {
        const response = await api.post(
          "/attendance/scan",
          {
            employee_id: employee.id,
            qr_token: qrToken,
            device_id: deviceId,
            lat,
            lng,
          }
        );

        if (response.data.debug_token_seharusnya) {
          setStatus("error");
          setStatusMessage("DEBUG: " + JSON.stringify(response.data, null, 2));
        } else {
          setStatus("success");
          setStatusMessage(response.data.message || "Absensi berhasil!");
        }
      } catch (err) {
        const serverResponse = err.response?.data;

        if (serverResponse?.message === "QR Expired, silakan scan ulang.") {
          setStatus("error");
          setStatusMessage("QR Code sudah expired. Silakan scan ulang.");
          return;
        }

        setStatus("error");
        setStatusMessage(
          serverResponse?.message || "Gagal terhubung ke server."
        );
      }
    },
    [lat, lng, deviceId, employee?.id]
  );

  useEffect(() => {
    if (!deviceId || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: "environment",
      },
    });

    scanner.render((decodedText) => {
      scanner
        .clear()
        .then(() => handleAttendance(decodedText))
        .catch(console.error);
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [deviceId, handleAttendance]);

  const statusConfig = {
    ready: { icon: "🎯", bg: "rgba(255,255,255,0.12)", color: "white" },
    processing: { icon: "⏳", bg: "rgba(255,255,255,0.12)", color: "white" },
    success: { icon: "✅", bg: "rgba(34,197,94,0.15)", color: "#bbf7d0" },
    error: { icon: "❌", bg: "rgba(239,68,68,0.15)", color: "#fecaca" },
  };

  const cfg = statusConfig[status];

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #1e3a8a, #3b82f6, #06b6d4)",
        padding: "0 0 100px 0",
        color: "white",
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          padding: "32px 24px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 40,
            marginBottom: 8,
          }}
        >
          📋
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: "0 0 4px 0",
          }}
        >
          Absensi QR
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>
          {employee?.full_name || "Loading..."}
        </p>

        {/* Realtime clock */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            borderRadius: 16,
            padding: "10px 24px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 2,
              margin: 0,
            }}
          >
            {formattedTime}
          </p>
          <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
            {formattedDate}
          </p>
        </div>
      </div>

      {/* ===== SCANNER CARD ===== */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: "24px 20px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#64748b",
              marginBottom: 16,
            }}
          >
            Arahkan kamera ke QR Code
          </p>

          <div
            id="reader"
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "3px solid #dbeafe",
            }}
          />
        </div>
      </div>

      {/* ===== STATUS CARD ===== */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <div
          style={{
            background: cfg.bg,
            backdropFilter: "blur(8px)",
            borderRadius: 20,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span
            style={{
              fontSize: 28,
              animation:
                status === "processing"
                  ? "spin 1s linear infinite"
                  : "none",
            }}
          >
            {cfg.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: cfg.color,
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {statusMessage}
            </p>
          </div>
        </div>
      </div>

      {/* ===== SCAN ULANG BUTTON ===== */}
      {(status === "error" || status === "success") && (
        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <button
            onClick={resetScanner}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            🔄 Scan Ulang
          </button>
        </div>
      )}

      {/* ===== BOTTOM INFO ===== */}
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          opacity: 0.4,
          padding: "0 20px",
        }}
      >
        QR berlaku 5 detik • Auto-refresh
      </p>

      {/* GPS error (subtle) */}
      {geoError && (
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#fecaca",
            opacity: 0.8,
            padding: "8px 20px 0",
          }}
        >
          ⚠️ GPS: {geoError}
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        #reader video { border-radius: 12px !important; }
        #reader { border: none !important; }
        #reader__dashboard_section_csr button { 
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important; 
          color: white !important; 
          border: none !important; 
          border-radius: 12px !important; 
          padding: 10px 20px !important; 
          font-weight: 600 !important;
          cursor: pointer !important;
        }
        #reader__dashboard_section_csr select {
          border-radius: 8px !important;
          padding: 6px 10px !important;
          border: 2px solid #dbeafe !important;
        }
      `}</style>
    </div>
  );
};

export default AttendanceScanner;
