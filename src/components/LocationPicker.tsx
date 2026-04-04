import { useState } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';

interface Props {
  onLocationSet: (lat: number, lon: number) => void;
  onRequestGPS: () => void;
  gpsLoading: boolean;
  hasGPS: boolean;
}

export default function LocationPicker({ onLocationSet, onRequestGPS, gpsLoading, hasGPS }: Props) {
  const [mode, setMode] = useState<'gps' | 'manual'>(hasGPS ? 'gps' : 'manual');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');

    // Check if it's coordinates (lat, lon)
    const coordMatch = query.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        onLocationSet(lat, lon);
        setSearching(false);
        return;
      }
    }

    // Geocode using Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'MedRoute/1.0' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        onLocationSet(parseFloat(data[0].lat), parseFloat(data[0].lon));
      } else {
        setError('Location not found. Try a different search or enter coordinates (lat, lon).');
      }
    } catch {
      setError('Search failed. Try entering coordinates like: 28.6139, 77.2090');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-4 border-b border-border bg-card/50 space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('gps'); onRequestGPS(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            mode === 'gps'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground border border-border hover:bg-muted/70'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Use GPS'}
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground border border-border hover:bg-muted/70'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Enter Location
        </button>
      </div>

      {/* Manual input */}
      {mode === 'manual' && (
        <div className="space-y-2">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="City, address, or lat,lon..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
            </button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-[10px] text-muted-foreground">
            Examples: "New Delhi", "Tokyo, Japan", or "28.6139, 77.2090"
          </p>
        </div>
      )}
    </div>
  );
}
