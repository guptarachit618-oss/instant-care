import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  radius: number;
  onRadiusChange: (r: number) => void;
  onRefresh: () => void;
  hospitalCount: number;
  loading: boolean;
}

export default function TriageBar({
  searchQuery,
  onSearchChange,
  radius,
  onRadiusChange,
  onRefresh,
  hospitalCount,
  loading,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search hospitals..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Radius + Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="range"
            min={5}
            max={100}
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="flex-1 h-1 accent-emergency"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap w-12">{radius} km</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-md bg-muted hover:bg-muted/70 text-muted-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {loading ? 'Scanning for hospitals...' : `${hospitalCount} hospitals found`}
      </p>
    </div>
  );
}
