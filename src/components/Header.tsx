import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { InstallModal } from './InstallModal';

export const Header: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstallClick = () => {
    if (isInstallable) {
      triggerInstall();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const shouldShowInstallButton = !isInstalled && (isInstallable || isIOS);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo e Nome discretos */}
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" width="32" height="32" className="w-8 h-8 shrink-0" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              uGabinete
            </span>
          </div>

          {/* Botão Instalar pequeno */}
          {shouldShowInstallButton && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer"
              aria-label="Instalar uGabinete"
            >
              {isIOS ? (
                <Smartphone className="w-4 h-4 text-slate-500" />
              ) : (
                <Download className="w-4 h-4 text-slate-500" />
              )}
              <span>Instalar</span>
            </button>
          )}
        </div>
      </header>

      <InstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
