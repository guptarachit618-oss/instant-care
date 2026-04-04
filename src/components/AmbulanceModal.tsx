import { useState } from 'react';
import { Hospital } from '@/hooks/useHospitals';
import { X, Siren, MapPin, Phone, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  hospital: Hospital;
  userLat: number;
  userLon: number;
  onClose: () => void;
}

type Step = 'form' | 'confirming' | 'confirmed';

export default function AmbulanceModal({ hospital, userLat, userLon, onClose }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'urgent' | 'stable'>('urgent');

  const handleSubmit = () => {
    setStep('confirming');
    setTimeout(() => setStep('confirmed'), 2500);
  };

  const eta = Math.max(3, Math.round(hospital.distance * 2.5 + Math.random() * 5));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-emergency p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-primary-foreground" />
            <h2 className="font-display font-bold text-primary-foreground">Request Ambulance</h2>
          </div>
          <button onClick={onClose} className="text-primary-foreground/80 hover:text-primary-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hospital info */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <p className="font-semibold text-sm text-foreground">{hospital.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{hospital.distance} km away</span>
            <span className="mx-1">•</span>
            <span>ETA ~{eta} min</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-3"
            >
              {/* Severity */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['critical', 'urgent', 'stable'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`py-2 rounded-md text-xs font-semibold capitalize transition-all ${
                        severity === s
                          ? s === 'critical'
                            ? 'bg-emergency text-primary-foreground shadow-emergency'
                            : s === 'urgent'
                            ? 'bg-warning text-accent-foreground'
                            : 'bg-success text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Patient Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Emergency Description</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the emergency..."
                    rows={2}
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-3 py-2 flex items-center gap-2">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>Pickup: {userLat.toFixed(5)}, {userLon.toFixed(5)}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full py-3 rounded-lg bg-gradient-emergency text-primary-foreground font-display font-bold text-sm shadow-emergency hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🚑 Dispatch Ambulance Now
              </button>
            </motion.div>
          )}

          {step === 'confirming' && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 flex flex-col items-center justify-center"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emergency/20 flex items-center justify-center">
                  <Siren className="w-8 h-8 text-emergency animate-pulse-emergency" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emergency/30 animate-radar" />
              </div>
              <p className="mt-4 font-display font-semibold text-foreground">Dispatching ambulance...</p>
              <p className="text-sm text-muted-foreground mt-1">Connecting to {hospital.name}</p>
            </motion.div>
          )}

          {step === 'confirmed' && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="mt-4 font-display font-bold text-foreground text-lg">Ambulance Dispatched!</p>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                ETA: ~{eta} minutes from <span className="text-foreground">{hospital.name}</span>
              </p>
              <div className="mt-4 bg-muted rounded-lg p-3 w-full text-center">
                <p className="text-xs text-muted-foreground">Tracking ID</p>
                <p className="font-mono font-bold text-foreground text-sm mt-0.5">
                  MR-{Date.now().toString(36).toUpperCase()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
