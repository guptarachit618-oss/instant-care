import { useState, useMemo, useCallback } from 'react';
import { Siren } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useHospitals } from '@/hooks/useHospitals';
import Header from '@/components/Header';
import EmergencyMap from '@/components/EmergencyMap';
import HospitalCard from '@/components/HospitalCard';
import AmbulanceModal from '@/components/AmbulanceModal';
import TriageBar from '@/components/TriageBar';
import LocationPicker from '@/components/LocationPicker';
import LoadingScreen from '@/components/LoadingScreen';
import EmergencyNumbers from '@/components/EmergencyNumbers';

export default function Index() {
  const { location, loading: geoLoading, error: geoError, mode, setMode, setManualLocation } = useGeolocation();
  const [radius, setRadius] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ambulanceHospitalId, setAmbulanceHospitalId] = useState<string | null>(null);

  const lat = location?.latitude ?? null;
  const lon = location?.longitude ?? null;

  const { hospitals, loading: hospitalsLoading } = useHospitals(lat, lon, radius);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter(
      (h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    );
  }, [hospitals, searchQuery]);

  const ambulanceHospital = ambulanceHospitalId ? hospitals.find((h) => h.id === ambulanceHospitalId) : null;

  const handleMapClick = useCallback((clickLat: number, clickLon: number) => {
    setManualLocation(clickLat, clickLon);
  }, [setManualLocation]);

  const handleSelectHospital = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  if (geoLoading && !location) return <LoadingScreen />;

  const displayLat = location?.latitude ?? 40.7128;
  const displayLon = location?.longitude ?? -74.006;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header online={!!location} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[380px] flex flex-col border-r border-border bg-card/30 order-2 lg:order-1 overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <LocationPicker
              mode={mode}
              onSetMode={setMode}
              onSetManualLocation={setManualLocation}
              currentLat={location?.latitude ?? null}
              currentLon={location?.longitude ?? null}
              geoError={geoError}
            />
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
                onSelect={() => handleSelectHospital(h.id)}
                onRequestAmbulance={() => setAmbulanceHospitalId(h.id)}
                userLat={displayLat}
                userLon={displayLon}
              />
            ))}
            {!hospitalsLoading && filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <p>No hospitals found.</p>
                <p className="text-xs mt-1">Try increasing the search radius.</p>
              </div>
            )}
          </div>

          <EmergencyNumbers />
        </aside>

        {/* Map */}
        <main className="flex-1 relative order-1 lg:order-2 min-h-[300px] lg:min-h-0">
          <EmergencyMap
            userLat={displayLat}
            userLon={displayLon}
            hospitals={filtered}
            selectedId={selectedId}
            onSelectHospital={handleSelectHospital}
            onMapClick={handleMapClick}
          />

          {/* Tap map hint */}
          {geoError && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
              📍 Tap anywhere on the map to set your location
            </div>
          )}

          {/* Quick SOS */}
          <button
            onClick={() => {
              const nearest = filtered[0];
              if (nearest) setAmbulanceHospitalId(nearest.id);
            }}
            disabled={filtered.length === 0}
            className="absolute bottom-6 right-6 z-[1000] w-28 h-28 rounded-full bg-gradient-emergency shadow-emergency flex flex-col items-center justify-center text-primary-foreground font-display font-bold hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 animate-pulse-emergency"
          >
            <Siren className="w-8 h-8 mb-1" />
            <span className="text-[11px] leading-tight tracking-wide">EMERGENCY</span>
          </button>
        </main>
      </div>

      {ambulanceHospital && (
        <AmbulanceModal
          hospital={ambulanceHospital}
          userLat={displayLat}
          userLon={displayLon}
          onClose={() => setAmbulanceHospitalId(null)}
        />
      )}
    </div>
  );
}
