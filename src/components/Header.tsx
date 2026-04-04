import { Siren, MapPin, Wifi } from 'lucide-react';

interface Props {
  locationName?: string;
  online: boolean;
}

export default function Header({ locationName, online }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 glass">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-emergency flex items-center justify-center shadow-emergency animate-pulse-slow">
          <Siren className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-foreground text-lg leading-none">
            Med<span className="text-gradient-emergency">Route</span>
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Emergency Triage Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {locationName && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{locationName}</span>
          </div>
        )}
        <div className={`flex items-center gap-1 text-xs ${online ? 'text-success' : 'text-emergency'}`}>
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">{online ? 'Live' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
}
