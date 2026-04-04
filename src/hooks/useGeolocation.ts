import { useState, useEffect, useCallback, useRef } from 'react';

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

const DEFAULT_LOCATION: GeoLocation = { latitude: 40.7128, longitude: -74.006, accuracy: 0 };

export function useGeolocation(): UseGeolocationReturn & { setManualLocation: (lat: number, lon: number) => void } {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number>();

  const getPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    // Always resolve within 4 seconds
    timerRef.current = window.setTimeout(() => {
      setLocation((prev) => prev ?? DEFAULT_LOCATION);
      setLoading(false);
    }, 4000);

    if (!navigator.geolocation) {
      clearTimeout(timerRef.current);
      setError('Geolocation is not supported');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timerRef.current);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        clearTimeout(timerRef.current);
        setError(err.message);
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    clearTimeout(timerRef.current);
    setLocation({ latitude: lat, longitude: lon, accuracy: 0 });
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    getPosition();
    return () => clearTimeout(timerRef.current);
  }, [getPosition]);

  return { location, error, loading, refresh: getPosition, setManualLocation };
}
