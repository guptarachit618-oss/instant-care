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
  const [mode, setModeState] = useState<LocationMode>('gps');
  const watchIdRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number>();
  const gotFixRef = useRef(false);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    clearTimeout(fallbackTimerRef.current);
  }, []);

  const startGps = useCallback(() => {
    gotFixRef.current = false;
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported — use Manual mode to set your location');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    // Check permission first via Permissions API
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setError('Location permission denied — use Manual mode or tap the map to set location');
          setLocation(DEFAULT_LOCATION);
          setLoading(false);
        }
      }).catch(() => {});
    }

    // Fallback after 8s
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!gotFixRef.current) {
        setError('GPS timed out — use Manual mode or tap the map');
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      }
    }, 8000);

    // Try low-accuracy first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!gotFixRef.current) {
          gotFixRef.current = true;
          clearTimeout(fallbackTimerRef.current);
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setError(null);
          setLoading(false);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );

    // Then watch high-accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        gotFixRef.current = true;
        clearTimeout(fallbackTimerRef.current);
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        if (!gotFixRef.current) {
          setError(err.code === 1
            ? 'Location permission denied — use Manual mode or tap the map'
            : 'GPS unavailable — use Manual mode or tap the map');
          setLocation(DEFAULT_LOCATION);
          setLoading(false);
          clearTimeout(fallbackTimerRef.current);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    clearWatch();
    gotFixRef.current = true;
    setModeState('manual');
    setError(null);
    setLoading(false);
    setLocation({ latitude: lat, longitude: lon, accuracy: 0 });
  }, [clearWatch]);

  const handleSetMode = useCallback((newMode: LocationMode) => {
    setModeState(newMode);
    if (newMode === 'gps') {
      gotFixRef.current = false;
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
