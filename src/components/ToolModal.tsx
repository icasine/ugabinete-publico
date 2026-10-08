import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Copy, Check, Lock, CheckCircle2, ListOrdered, Sparkles, HelpCircle } from 'lucide-react';
import { Ferramenta } from '../types';

interface ToolModalProps {
  tool: Ferramenta | null;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tool) return;

    // Fecha ao teclar Esc
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, onClose]);

  if (!tool) return null;

  const handleCopyLink = async () => {
    const directUrl = `${window.location.origin}${window.location.pathname}#${tool.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directUrl);
      } else {
        // Fallback para navegadores antigos
        const tempInput = document.createElement('input');
        tempInput.value = directUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tool-title"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div>
            <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-800 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              {tool.categoria}
            </span>
            <h2 id="modal-tool-title" className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {tool.nome}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0 ml-3"
            aria-label="Fechar janela de detalhes"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo com rolagem se necessário */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-base sm:text-lg">
          {/* Imagem de Demonstração (se houver) */}
          {tool.imagemDemo && (
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
              <img
                src={tool.imagemDemo}
                alt={`Demonstração de ${tool.nome}`}
                className="w-full h-auto object-cover max-h-72"
                onError={(e) => {
                  // Se falhar o carregamento da imagem, esconde o bloco
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Aviso de Login: Amarelo ou Verde */}
          {tool.exigeLogin ? (
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950">
              <Lock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-lg text-amber-900">
                  Exige login próprio
                </strong>
                <p className="text-amber-900/90 text-base leading-relaxed mt-0.5">
                  Esta ferramenta possui sistema de acesso próprio. Você precisará se autenticar dentro do site dela para utilizá-la. O uGabinete não gerencia e não armazena nenhuma senha.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-lg text-emerald-900">
                  Acesso livre
                </strong>
                <p className="text-emerald-900/90 text-base leading-relaxed mt-0.5">
                  Esta ferramenta é pública e aberta. Você pode usá-la imediatamente sem precisar de cadastro ou senha.
                </p>
              </div>
            </div>
          )}

          {/* Para que serve */}
          <section>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg sm:text-xl mb-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3>Para que serve</h3>
            </div>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {tool.descricao}
            </p>
          </section>

          {/* Recursos principais */}
          {tool.destaques && tool.destaques.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg sm:text-xl mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3>Recursos principais</h3>
              </div>
              <ul className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {tool.destaques.map((destaque, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-2.5 shrink-0" />
                    <span>{destaque}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Como usar (passos numerados) */}
          {tool.comoUsar && tool.comoUsar.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg sm:text-xl mb-2">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                <h3>Como usar</h3>
              </div>
              <ol className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {tool.comoUsar.map((passo, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{passo}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Rodapé com botões de ação */}
        <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row gap-3">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base sm:text-lg shadow-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-center"
          >
            <span>Abrir ferramenta agora</span>
            <ExternalLink className="w-5 h-5" />
          </a>

          <button
            onClick={handleCopyLink}
            className="sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-5 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-base border-2 border-slate-300 transition focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Endereço copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-slate-600" />
                <span>Copiar endereço desta ferramenta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
