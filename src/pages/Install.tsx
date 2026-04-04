import { useState, useEffect } from 'react';
import { Siren, Download, Share, CheckCircle2, Smartphone, Monitor, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-display font-bold text-2xl text-foreground">Already Installed!</h1>
        <p className="text-muted-foreground mt-2 text-sm">MedRoute is running as an installed app.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 rounded-lg bg-gradient-emergency text-primary-foreground font-display font-bold text-sm">
          Open MedRoute
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to app
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        {/* App icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-emergency flex items-center justify-center shadow-emergency mb-6">
          <Siren className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="font-display font-bold text-3xl text-foreground">
          Install Med<span className="text-gradient-emergency">Route</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Install MedRoute on your device for instant access to emergency triage — works offline, loads instantly, just like a native app.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mt-8 w-full">
          {[
            { icon: Smartphone, label: 'Works offline' },
            { icon: Download, label: 'Instant access' },
            { icon: Monitor, label: 'All devices' },
            { icon: Siren, label: 'Quick SOS' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
              <Icon className="w-4 h-4 text-emergency" />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Install actions */}
        <div className="mt-8 w-full space-y-3">
          {installed ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-success" />
              <p className="font-display font-bold text-foreground">Successfully Installed!</p>
              <p className="text-sm text-muted-foreground">Find MedRoute on your home screen.</p>
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full py-4 rounded-xl bg-gradient-emergency text-primary-foreground font-display font-bold text-base shadow-emergency hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install MedRoute
            </button>
          ) : isIOS ? (
            <div className="bg-card border border-border rounded-xl p-4 text-left space-y-3">
              <p className="font-display font-semibold text-foreground text-sm">Install on iPhone / iPad:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emergency/20 text-emergency text-xs flex items-center justify-center font-bold">1</span>
                  <span>Tap the <Share className="w-4 h-4 inline text-info" /> <strong className="text-foreground">Share</strong> button in Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emergency/20 text-emergency text-xs flex items-center justify-center font-bold">2</span>
                  <span>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emergency/20 text-emergency text-xs flex items-center justify-center font-bold">3</span>
                  <span>Tap <strong className="text-foreground">"Add"</strong> to confirm</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4 text-left space-y-3">
              <p className="font-display font-semibold text-foreground text-sm">Install on your device:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emergency/20 text-emergency text-xs flex items-center justify-center font-bold">1</span>
                  <span>Open this page in <strong className="text-foreground">Chrome</strong> or <strong className="text-foreground">Edge</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emergency/20 text-emergency text-xs flex items-center justify-center font-bold">2</span>
                  <span>Tap the <strong className="text-foreground">⋮ menu</strong> (top right)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emergency/20 text-emergency text-xs flex items-center justify-center font-bold">3</span>
                  <span>Tap <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong></span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
