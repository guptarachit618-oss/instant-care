import { Siren } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-emergency flex items-center justify-center shadow-emergency">
          <Siren className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-emergency/30 animate-radar" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <h1 className="font-display font-bold text-2xl text-foreground">
          Med<span className="text-gradient-emergency">Route</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Detecting your location...</p>
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '160px' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="h-1 bg-gradient-emergency rounded-full mt-6"
      />
    </div>
  );
}
