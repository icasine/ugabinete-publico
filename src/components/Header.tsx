import React, { useState } from 'react';
import { Smartphone, Download, Sparkles } from 'lucide-react';
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
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-[2px] shadow-sm shadow-blue-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white relative overflow-hidden">
                <span className="font-extrabold text-2xl tracking-tighter drop-shadow-xs">u</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-none">
                  uGabinete
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Portal Oficial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Portal de ferramentas web
              </p>
            </div>
          </div>

          {/* Botão Instalar no Celular */}
          {shouldShowInstallButton && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white border-2 border-blue-600 font-bold text-sm sm:text-base transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              aria-label="Instalar uGabinete no dispositivo"
            >
              {isIOS ? (
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              ) : (
                <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              )}
              <span>Instalar no celular</span>
            </button>
          )}
        </div>
      </header>

      {/* Modal explicativo para dispositivos iOS */}
      <InstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
