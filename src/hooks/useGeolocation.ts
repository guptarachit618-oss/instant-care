import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type LocationMode = 'gps' | 'manual';

interface UseGeolocationReturn {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  mode: LocationMode;
  setMode: (mode: LocationMode) => void;
  setManualLocation: (lat: number, lon: number) => void;
  refresh: () => void;
}

const DEFAULT_LOCATION: GeoLocation = { latitude: 40.7128, longitude: -74.006, accuracy: 0 };

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<LocationMode>('gps');
  const timerRef = useRef<number>();

  const getPosition = useCallback(() => {
    if (mode === 'manual') return; // Don't auto-fetch in manual mode
    
    setLoading(true);
    setError(null);

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
  }, [mode]);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    setMode('manual');
    setError(null);
    setLoading(false);
    setLocation({ latitude: lat, longitude: lon, accuracy: 0 });
  }, []);

  const handleSetMode = useCallback((newMode: LocationMode) => {
    setMode(newMode);
    if (newMode === 'gps') {
      setLocation(null);
    }
  }, []);

  useEffect(() => {
    if (mode === 'gps') {
      getPosition();
    }
    return () => clearTimeout(timerRef.current);
  }, [getPosition, mode]);

  return { location, error, loading, mode, setMode: handleSetMode, setManualLocation, refresh: getPosition };
}
