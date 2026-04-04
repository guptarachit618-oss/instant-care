import { Hospital } from '@/hooks/useHospitals';
import { MapPin, Bed, Phone, Siren } from 'lucide-react';

interface Props {
  hospital: Hospital;
  selected: boolean;
  onSelect: () => void;
  onRequestAmbulance: () => void;
}

export default function HospitalCard({ hospital, selected, onSelect, onRequestAmbulance }: Props) {
  const bedsPercent = hospital.beds.available / hospital.beds.total;
  const bedColor = bedsPercent > 0.2 ? 'bg-success' : bedsPercent > 0.05 ? 'bg-warning' : 'bg-emergency';

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
        selected
          ? 'border-accent bg-accent/10 shadow-emergency'
          : 'border-border bg-card hover:border-muted-foreground/30'
      } hover:scale-[1.01] active:scale-[0.99]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-foreground truncate text-sm">{hospital.name}</h3>
            {hospital.emergency && (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-emergency/20 text-emergency rounded">
                ER
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
            <MapPin className="w-3 h-3" />
            <span>{hospital.distance} km</span>
            <span className="mx-1">•</span>
            <span className="truncate">{hospital.address}</span>
          </div>

          {/* Bed bar */}
          <div className="mt-2 flex items-center gap-2">
            <Bed className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bedColor} transition-all`}
                style={{ width: `${Math.max(bedsPercent * 100, 2)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">
              {hospital.beds.available}
              <span className="text-muted-foreground">/{hospital.beds.total}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <a
            href={`tel:${hospital.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-md bg-info/15 text-info hover:bg-info/25 transition-colors"
            title="Call hospital"
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestAmbulance();
            }}
            className="p-2 rounded-md bg-emergency/15 text-emergency hover:bg-emergency/25 transition-colors animate-pulse-emergency"
            title="Request ambulance"
          >
            <Siren className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
