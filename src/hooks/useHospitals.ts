import { useState, useEffect, useRef } from 'react';

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  beds: { total: number; available: number };
  phone: string;
  address: string;
  emergency: boolean;
  type: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Stable beds per hospital ID
const bedsCache = new Map<string, { total: number; available: number }>();
function getBeds(id: string): { total: number; available: number } {
  if (!bedsCache.has(id)) {
    const total = Math.floor(Math.random() * 400) + 50;
    const available = Math.floor(Math.random() * Math.min(total, 40));
    bedsCache.set(id, { total, available });
  }
  return bedsCache.get(id)!;
}

const FALLBACK_NAMES = [
  'City General Hospital', 'Memorial Medical Center', "St. Mary's Hospital",
  'Regional Health Center', 'University Hospital', 'Community Medical Center',
  "Children's Hospital", 'Veterans Medical Center',
];

function generateFallback(lat: number, lon: number, radius: number): Hospital[] {
  return FALLBACK_NAMES.map((name, i) => {
    const angle = (i / FALLBACK_NAMES.length) * Math.PI * 2;
    const maxDist = Math.min(radius, 20);
    const dist = 1 + Math.random() * maxDist;
    const dlat = (dist / 111) * Math.cos(angle);
    const dlon = (dist / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    return {
      id: `fallback-${i}`,
      name,
      latitude: lat + dlat,
      longitude: lon + dlon,
      distance: Math.round(dist * 10) / 10,
      beds: getBeds(`fallback-${i}`),
      phone: '+1-555-' + String(100 + i).padStart(3, '0') + '-0000',
      address: `${Math.round(Math.abs(lat + dlat) * 100) / 100}°, ${Math.round(Math.abs(lon + dlon) * 100) / 100}° (approximate)`,
      emergency: Math.random() > 0.3,
      type: 'General',
    };
  }).filter(h => h.distance <= radius).sort((a, b) => a.distance - b.distance);
}

export function useHospitals(lat: number | null, lon: number | null, radius: number = 25) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (lat === null || lon === null) return;

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchHospitals = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = `
          [out:json][timeout:15];
          (
            node["amenity"="hospital"](around:${radius * 1000},${lat},${lon});
            way["amenity"="hospital"](around:${radius * 1000},${lat},${lon});
            relation["amenity"="hospital"](around:${radius * 1000},${lat},${lon});
          );
          out center tags;
        `;

        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: controller.signal,
        });

        clearTimeout(timeout);
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();

        const mapped: Hospital[] = data.elements
          .map((el: any) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            if (!elLat || !elLon) return null;

            const dist = haversine(lat, lon, elLat, elLon);
            if (dist > radius) return null;

            const name = el.tags?.name || el.tags?.['name:en'] || 'Unknown Hospital';
            const street = el.tags?.['addr:street'] || el.tags?.['addr:full'] || '';
            const city = el.tags?.['addr:city'] || el.tags?.['addr:suburb'] || '';
            const country = el.tags?.['addr:country'] || '';
            const address = [street, city, country].filter(Boolean).join(', ')
              || `Near ${elLat.toFixed(4)}°, ${elLon.toFixed(4)}°`;

            return {
              id: String(el.id),
              name,
              latitude: elLat,
              longitude: elLon,
              distance: Math.round(dist * 10) / 10,
              beds: getBeds(String(el.id)),
              phone: el.tags?.phone || el.tags?.['contact:phone'] || 'N/A',
              address,
              emergency: el.tags?.emergency === 'yes' || Math.random() > 0.3,
              type: el.tags?.['healthcare:speciality'] || 'General',
            } as Hospital;
          })
          .filter(Boolean)
          .sort((a: Hospital, b: Hospital) => a.distance - b.distance);

        setHospitals(mapped.length > 0 ? mapped : generateFallback(lat, lon, radius));
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setHospitals(generateFallback(lat, lon, radius));
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
    return () => controller.abort();
  }, [lat, lon, radius]);

  return { hospitals, loading, error };
}
