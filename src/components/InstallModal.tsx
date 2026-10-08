import React, { useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 id="ios-install-title" className="text-xl font-bold text-slate-900">
            Como instalar no iPhone ou iPad
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            aria-label="Fechar janela"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-base md:text-lg">
          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
              1
            </span>
            <div className="text-slate-700 leading-snug">
              Toque no botão <strong className="text-slate-900 inline-flex items-center gap-1 font-semibold"><Share className="w-4 h-4 text-blue-600 inline" /> Compartilhar</strong> na barra do Safari (na parte inferior ou superior da tela).
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
              2
            </span>
            <div className="text-slate-700 leading-snug">
              Role a lista de opções para cima e toque em <strong className="text-slate-900 inline-flex items-center gap-1 font-semibold"><PlusSquare className="w-4 h-4 text-blue-600 inline" /> Adicionar à Tela de Início</strong>.
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
              3
            </span>
            <div className="text-slate-700 leading-snug">
              Toque em <strong className="text-slate-900 font-semibold">Adicionar</strong> no canto superior direito para confirmar.
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500 text-center">
          Pronto! O ícone do uGabinete ficará disponível na sua tela de início como um aplicativo normal.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-semibold rounded-xl transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          Entendi, fechar
        </button>
      </div>
    </div>
  );
};
