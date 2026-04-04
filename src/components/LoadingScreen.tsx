import { Siren } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="relative animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-emergency flex items-center justify-center shadow-emergency">
          <Siren className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-emergency/30 animate-radar" />
      </div>

      <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Med<span className="text-gradient-emergency">Route</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Detecting your location...</p>
      </div>

      <div className="h-1 bg-gradient-emergency rounded-full mt-6 animate-loading-bar" />
    </div>
  );
}
