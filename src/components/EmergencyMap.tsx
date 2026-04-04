import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '@/hooks/useHospitals';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  html: `<div style="width:20px;height:20px;background:hsl(210,90%,55%);border:3px solid white;border-radius:50%;box-shadow:0 0 12px hsl(210,90%,55%,0.6);"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const hospitalIcon = new L.DivIcon({
  html: `<div style="width:28px;height:28px;background:hsl(0,85%,55%);border:2px solid white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:bold;box-shadow:0 0 10px hsl(0,85%,55%,0.5);">+</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const selectedHospitalIcon = new L.DivIcon({
  html: `<div style="width:34px;height:34px;background:hsl(35,95%,55%);border:3px solid white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:white;font-weight:bold;box-shadow:0 0 20px hsl(35,95%,55%,0.6);">+</div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, 14, { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, map]);
  return null;
}

interface Props {
  userLat: number;
  userLon: number;
  hospitals: Hospital[];
  selectedId: string | null;
  onSelectHospital: (id: string) => void;
}

export default function EmergencyMap({ userLat, userLon, hospitals, selectedId, onSelectHospital }: Props) {
  const flyTarget: [number, number] = selectedId
    ? (() => {
        const h = hospitals.find((x) => x.id === selectedId);
        return h ? [h.latitude, h.longitude] : [userLat, userLon];
      })()
    : [userLat, userLon];

  return (
    <MapContainer
      center={[userLat, userLon]}
      zoom={13}
      className="w-full h-full rounded-lg"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo center={flyTarget} />

      {/* User location */}
      <Marker position={[userLat, userLon]} icon={userIcon}>
        <Popup>
          <span className="font-semibold">Your Location</span>
        </Popup>
      </Marker>

      <Circle
        center={[userLat, userLon]}
        radius={300}
        pathOptions={{ color: 'hsl(210,90%,55%)', fillColor: 'hsl(210,90%,55%)', fillOpacity: 0.1, weight: 1 }}
      />

      {/* Hospitals */}
      {hospitals.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={h.id === selectedId ? selectedHospitalIcon : hospitalIcon}
          eventHandlers={{ click: () => onSelectHospital(h.id) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{h.name}</p>
              <p>{h.distance} km away</p>
              <p className="text-green-400">{h.beds.available} beds available</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
