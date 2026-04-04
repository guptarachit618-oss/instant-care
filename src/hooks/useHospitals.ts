import { useState, useEffect } from 'react';

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // km
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

function generateBeds(): { total: number; available: number } {
  const total = Math.floor(Math.random() * 400) + 50;
  const available = Math.floor(Math.random() * Math.min(total, 40));
  return { total, available };
}

export function useHospitals(lat: number | null, lon: number | null, radius: number = 25) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lon === null) return;

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

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!res.ok) throw new Error('Failed to fetch hospitals');

        const data = await res.json();

        const mapped: Hospital[] = data.elements
          .map((el: any) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            if (!elLat || !elLon) return null;

            const dist = haversine(lat, lon, elLat, elLon);
            const name = el.tags?.name || el.tags?.['name:en'] || 'Unknown Hospital';

            return {
              id: String(el.id),
              name,
              latitude: elLat,
              longitude: elLon,
              distance: Math.round(dist * 10) / 10,
              beds: generateBeds(),
              phone: el.tags?.phone || el.tags?.['contact:phone'] || '+1-XXX-XXX-XXXX',
              address: [el.tags?.['addr:street'], el.tags?.['addr:city'], el.tags?.['addr:country']].filter(Boolean).join(', ') || 'Address unavailable',
              emergency: el.tags?.emergency === 'yes' || Math.random() > 0.3,
              type: el.tags?.['healthcare:speciality'] || 'General',
            } as Hospital;
          })
          .filter(Boolean)
          .sort((a: Hospital, b: Hospital) => a.distance - b.distance);

        setHospitals(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [lat, lon, radius]);

  return { hospitals, loading, error };
}
