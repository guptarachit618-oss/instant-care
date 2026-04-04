import { useState, useEffect, useCallback } from 'react';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation({ latitude: 40.7128, longitude: -74.006, accuracy: 0 });
      setLoading(false);
      return;
    }

    // Fallback timer in case geolocation hangs
    const fallbackTimer = setTimeout(() => {
      setLocation((prev) => prev ?? { latitude: 40.7128, longitude: -74.006, accuracy: 0 });
      setLoading(false);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        // Fallback to a default location (New York)
        setLocation({ latitude: 40.7128, longitude: -74.006, accuracy: 0 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    getPosition();
  }, [getPosition]);

  return { location, error, loading, refresh: getPosition };
}
