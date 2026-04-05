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
  const watchIdRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number>();

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    clearTimeout(fallbackTimerRef.current);
  }, []);

  const startGps = useCallback(() => {
    setLoading(true);
    setError(null);

    // Fallback to default after 10s if no position received
    fallbackTimerRef.current = window.setTimeout(() => {
      setLocation((prev) => {
        if (prev) return prev; // already got a fix
        setError('GPS timed out — using default location');
        return DEFAULT_LOCATION;
      });
      setLoading(false);
    }, 10000);

    if (!navigator.geolocation) {
      clearTimeout(fallbackTimerRef.current);
      setError('Geolocation is not supported by this browser');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    // First try a quick low-accuracy fix, then upgrade with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
        clearTimeout(fallbackTimerRef.current);
      },
      () => {
        // Low-accuracy failed, that's ok — watchPosition will keep trying
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );

    // Watch for continuous updates (high accuracy)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        clearTimeout(fallbackTimerRef.current);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        // Only set error + fallback if we never got a position
        setLocation((prev) => {
          if (prev && prev !== DEFAULT_LOCATION) return prev;
          setError(err.message || 'Unable to detect location');
          return DEFAULT_LOCATION;
        });
        setLoading(false);
        clearTimeout(fallbackTimerRef.current);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    clearWatch();
    setMode('manual');
    setError(null);
    setLoading(false);
    setLocation({ latitude: lat, longitude: lon, accuracy: 0 });
  }, [clearWatch]);

  const handleSetMode = useCallback((newMode: LocationMode) => {
    setMode(newMode);
    if (newMode === 'gps') {
      setLocation(null);
    } else {
      clearWatch();
    }
  }, [clearWatch]);

  useEffect(() => {
    if (mode === 'gps') {
      startGps();
    }
    return () => clearWatch();
  }, [mode, startGps, clearWatch]);

  return { location, error, loading, mode, setMode: handleSetMode, setManualLocation, refresh: startGps };
}
