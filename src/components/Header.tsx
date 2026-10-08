import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
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

  // O botão só aparece se for instalável via evento nativo ou se for iOS ainda não instalado
  const shouldShowInstallButton = !isInstalled && (isInstallable || isIOS);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo e Título */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <span className="text-white font-black text-2xl tracking-tighter">u</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                uGabinete
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-medium">
                Portal de ferramentas web
              </p>
            </div>
          </div>

          {/* Botão Instalar no Celular */}
          {shouldShowInstallButton && (
            <div className="w-full sm:w-auto flex justify-center">
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-blue-50 text-blue-800 border-2 border-blue-600 font-bold text-base hover:bg-blue-600 hover:text-white active:bg-blue-700 transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label="Instalar aplicativo uGabinete no dispositivo"
              >
                {isIOS ? (
                  <Smartphone className="w-5 h-5 shrink-0" />
                ) : (
                  <Download className="w-5 h-5 shrink-0" />
                )}
                <span>Instalar no celular</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal explicativo do iOS */}
      <InstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
