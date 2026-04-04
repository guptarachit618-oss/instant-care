import { useState, useMemo } from 'react';
import { Siren } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useHospitals } from '@/hooks/useHospitals';
import Header from '@/components/Header';
import EmergencyMap from '@/components/EmergencyMap';
import HospitalCard from '@/components/HospitalCard';
import AmbulanceModal from '@/components/AmbulanceModal';
import TriageBar from '@/components/TriageBar';
import LoadingScreen from '@/components/LoadingScreen';
import LocationPicker from '@/components/LocationPicker';

export default function Index() {
  const { location, loading: geoLoading, refresh: refreshGPS, setManualLocation } = useGeolocation();
  const [radius, setRadius] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ambulanceHospitalId, setAmbulanceHospitalId] = useState<string | null>(null);

  const { hospitals, loading: hospitalsLoading } = useHospitals(
    location?.latitude ?? null,
    location?.longitude ?? null,
    radius
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter(
      (h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    );
  }, [hospitals, searchQuery]);

  const ambulanceHospital = ambulanceHospitalId ? hospitals.find((h) => h.id === ambulanceHospitalId) : null;

  if (geoLoading && !location) return <LoadingScreen />;

  const lat = location?.latitude ?? 40.7128;
  const lon = location?.longitude ?? -74.006;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header online={!!location} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[380px] flex flex-col border-r border-border bg-card/30 order-2 lg:order-1 overflow-hidden">
          <div className="p-4 border-b border-border">
            <TriageBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              radius={radius}
              onRadiusChange={setRadius}
              onRefresh={() => {}}
              hospitalCount={filtered.length}
              loading={hospitalsLoading}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((h) => (
              <HospitalCard
                key={h.id}
                hospital={h}
                selected={h.id === selectedId}
                onSelect={() => setSelectedId(h.id === selectedId ? null : h.id)}
                onRequestAmbulance={() => setAmbulanceHospitalId(h.id)}
              />
            ))}
            {!hospitalsLoading && filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <p>No hospitals found.</p>
                <p className="text-xs mt-1">Try increasing the search radius.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative order-1 lg:order-2 min-h-[300px] lg:min-h-0">
          <EmergencyMap
            userLat={lat}
            userLon={lon}
            hospitals={filtered}
            selectedId={selectedId}
            onSelectHospital={(id) => setSelectedId(id)}
          />

          {/* Quick SOS */}
          <button
            onClick={() => {
              const nearest = filtered[0];
              if (nearest) setAmbulanceHospitalId(nearest.id);
            }}
            disabled={filtered.length === 0}
            className="absolute bottom-6 right-6 z-[1000] w-24 h-24 rounded-full bg-gradient-emergency shadow-emergency flex flex-col items-center justify-center text-primary-foreground font-display font-bold hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 animate-pulse-emergency"
          >
            <Siren className="w-7 h-7 mb-1" />
            <span className="text-[11px] leading-tight tracking-wide">EMERGENCY</span>
          </button>
        </main>
      </div>

      {/* Ambulance modal */}
      {ambulanceHospital && (
        <AmbulanceModal
          hospital={ambulanceHospital}
          userLat={lat}
          userLon={lon}
          onClose={() => setAmbulanceHospitalId(null)}
        />
      )}
    </div>
  );
}
