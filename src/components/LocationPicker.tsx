import { useState } from 'react';
import { MapPin, Navigation, Globe, X } from 'lucide-react';
import { LocationMode } from '@/hooks/useGeolocation';

interface Props {
  mode: LocationMode;
  onSetMode: (mode: LocationMode) => void;
  onSetManualLocation: (lat: number, lon: number) => void;
  currentLat: number | null;
  currentLon: number | null;
  geoError: string | null;
}

export default function LocationPicker({ mode, onSetMode, onSetManualLocation, currentLat, currentLon, geoError }: Props) {
  const [open, setOpen] = useState(false);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [searching, setSearching] = useState(false);

  const handleManualSubmit = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onSetManualLocation(lat, lon);
      setOpen(false);
    }
  };

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'MedRoute/1.0' },
      });
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setLatInput(lat.toFixed(5));
        setLonInput(lon.toFixed(5));
        onSetManualLocation(lat, lon);
        setOpen(false);
      }
    } catch {
      // silent fail
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground hover:bg-muted/70 transition-colors w-full"
      >
        {mode === 'gps' ? (
          <Navigation className="w-3.5 h-3.5 text-success shrink-0" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
        )}
        <span className="flex-1 text-left truncate">
          {mode === 'gps'
            ? geoError
              ? 'GPS unavailable — using default'
              : currentLat
                ? `GPS: ${currentLat.toFixed(4)}, ${currentLon?.toFixed(4)}`
                : 'Detecting GPS...'
            : `Manual: ${currentLat?.toFixed(4)}, ${currentLon?.toFixed(4)}`}
        </span>
        <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-card p-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Set Location</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onSetMode('gps'); setOpen(false); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                mode === 'gps' ? 'bg-success/20 text-success border border-success/30' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              GPS Auto
            </button>
            <button
              onClick={() => onSetMode('manual')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                mode === 'manual' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Manual
            </button>
          </div>

          {/* Manual input */}
          {mode === 'manual' && (
            <>
              {/* City search */}
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Search by city or address</label>
                <div className="flex gap-1.5">
                  <input
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                    placeholder="e.g. Tokyo, London, Mumbai..."
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={handleCitySearch}
                    disabled={searching}
                    className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {searching ? '...' : 'Find'}
                  </button>
                </div>
              </div>

              {/* Coordinate inputs */}
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Or enter coordinates</label>
                <div className="flex gap-1.5">
                  <input
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="Latitude"
                    type="number"
                    step="any"
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    placeholder="Longitude"
                    type="number"
                    step="any"
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={handleManualSubmit}
                    className="px-3 py-1.5 rounded-md bg-emergency text-primary-foreground text-xs font-medium hover:opacity-90"
                  >
                    Go
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
