import { useState } from "react"; // Hapus useEffect karena tidak dipakai di file ini

export const useGeolocation = () => {
  const [location, setLocation] = useState({ lat: null, lng: null, error: null });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: "Geolocation tidak didukung browser" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null });
      },
      () => { 
        // Hapus variabel 'err' di sini karena kita hanya butuh set status error saja
        setLocation((prev) => ({ ...prev, error: "Izin lokasi ditolak" }));
      }
    );
  };

  return { ...location, getLocation };
};