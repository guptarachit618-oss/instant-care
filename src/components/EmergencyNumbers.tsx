import { Phone, Shield, Flame, Heart, AlertTriangle } from 'lucide-react';
import { memo } from 'react';

const NUMBERS = [
  { label: 'Emergency (US)', number: '911', icon: Phone, color: 'text-emergency' },
  { label: 'Police', number: '100', icon: Shield, color: 'text-info' },
  { label: 'Fire', number: '101', icon: Flame, color: 'text-warning' },
  { label: 'Ambulance', number: '102', icon: Heart, color: 'text-emergency' },
  { label: 'Disaster', number: '108', icon: AlertTriangle, color: 'text-accent' },
  { label: 'Women Helpline', number: '1091', icon: Phone, color: 'text-success' },
];

const EmergencyNumbers = memo(function EmergencyNumbers() {
  return (
    <div className="p-3 border-t border-border">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Emergency Numbers</p>
      <div className="grid grid-cols-3 gap-1.5">
        {NUMBERS.map((n) => (
          <a
            key={n.number}
            href={`tel:${n.number}`}
            className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted hover:bg-muted/70 transition-colors"
          >
            <n.icon className={`w-4 h-4 ${n.color}`} />
            <span className="text-[10px] text-foreground font-bold">{n.number}</span>
            <span className="text-[8px] text-muted-foreground text-center leading-tight">{n.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
});

export default EmergencyNumbers;
