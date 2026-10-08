import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  HelpCircle,
  PlayCircle,
  GraduationCap,
} from 'lucide-react';
import { Ferramenta } from '../types';
import { getToolIcon, getToolColorTheme } from '../utils/toolTheme';

interface ToolModalProps {
  tool: Ferramenta | null;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Trava a rolagem da página ao fundo e leva o foco para o botão Fechar
  useEffect(() => {
    if (!tool) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [tool]);

  useEffect(() => {
    if (!tool) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, onClose]);

  if (!tool) return null;

  const IconComponent = getToolIcon(tool.icone);
  const colorTheme = getToolColorTheme(tool.cor);
  const imagemTopo = tool.imagemDemo || tool.capa || '';
  const tutorial = tool.tutorial || [];

  const handleCopyLink = async () => {
    const directUrl = `${window.location.origin}${window.location.pathname}#${tool.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directUrl);
      } else {
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
      // Sem permissão para copiar: mostra o endereço para a pessoa copiar à mão
      window.prompt('Copie o endereço abaixo:', directUrl);
    }
  };

  const esconderSeFalhar = (e: { target: unknown }) => {
    (e.target as HTMLElement).style.display = 'none';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tool-title"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 text-slate-800 my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faixa Superior Colorida (Conforme a cor da ferramenta) */}
        <div className={`bg-gradient-to-r ${colorTheme.headerGrad} p-6 sm:p-7 text-white relative shrink-0 shadow-xs`}>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 text-white transition focus:outline-hidden focus:ring-2 focus:ring-white/70 cursor-pointer"
            aria-label="Fechar janela de detalhes"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 pr-12 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-inner overflow-hidden">
              {tool.imagem ? (
                <img src={tool.imagem} alt="" className="w-full h-full object-cover" />
              ) : (
                <IconComponent className="w-9 h-9 text-white" strokeWidth={2.2} />
              )}
            </div>

            <div className="min-w-0">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs border border-white/20">
                {tool.categoria}
              </span>
              <h2 id="modal-tool-title" className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 leading-tight tracking-tight drop-shadow-xs break-words">
                {tool.nome}
              </h2>
            </div>
          </div>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto overflow-x-hidden text-base sm:text-lg">
          {/* Imagem de demonstração (ou a capa, se não houver demonstração) */}
          {imagemTopo && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex justify-center">
              <img
                src={imagemTopo}
                alt={`Demonstração de ${tool.nome}`}
                loading="lazy"
                className="block max-w-full w-auto h-auto max-h-72 object-contain"
                onError={esconderSeFalhar}
              />
            </div>
          )}

          {/* Aviso de Login: Amarelo ou Verde */}
          {tool.exigeLogin ? (
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
              <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-lg text-amber-900 leading-snug">
                  Exige login próprio
                </strong>
                <p className="text-amber-900/90 text-base leading-relaxed mt-1">
                  Esta ferramenta requer identificação ou credenciais próprias. O uGabinete é apenas a porta de entrada e não armazena nenhuma senha.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-lg text-emerald-900 leading-snug">
                  Acesso livre
                </strong>
                <p className="text-emerald-900/90 text-base leading-relaxed mt-1">
                  Esta ferramenta é totalmente aberta. Você pode começar a usar imediatamente sem precisar de conta ou senha.
                </p>
              </div>
            </div>
          )}

          {/* Para que serve */}
          {tool.descricao && (
            <section className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg sm:text-xl mb-2.5">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3>Para que serve</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-[17px] whitespace-pre-line break-words">
                {tool.descricao}
              </p>
            </section>
          )}

          {/* Recursos principais */}
          {tool.destaques && tool.destaques.length > 0 && (
            <section className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg sm:text-xl mb-3">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3>Recursos principais</h3>
              </div>
              <ul className="space-y-2.5">
                {tool.destaques.map((destaque, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 text-[17px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2.5 shrink-0" />
                    <span className="leading-relaxed break-words">{destaque}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Como usar (passos numerados ligados por uma linha vertical) */}
          {tool.comoUsar && tool.comoUsar.length > 0 && (
            <section className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg sm:text-xl mb-4">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <h3>Como usar</h3>
              </div>

              <div className="relative pl-2 space-y-6 before:absolute before:left-[23px] before:top-4 before:bottom-6 before:w-0.5 before:bg-blue-200">
                {tool.comoUsar.map((passo, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-sm shrink-0 shadow-xs ring-4 ring-white">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 text-slate-700 text-[17px] leading-relaxed break-words min-w-0">
                      {passo}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tutorial: vídeos do YouTube e imagens */}
          {tutorial.length > 0 && (
            <section className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg sm:text-xl mb-4">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3>Tutorial</h3>
              </div>

              <div className="space-y-4">
                {tutorial.map((item, idx) =>
                  item.tipo === 'video' ? (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/40 transition min-w-0"
                    >
                      <PlayCircle className="w-9 h-9 text-red-600 shrink-0" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-900 text-base truncate">
                          {item.legenda || 'Vídeo do tutorial'}
                        </span>
                        <span className="block text-sm text-slate-500">Assistir no YouTube (abre em nova aba)</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                    </a>
                  ) : (
                    <figure key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center bg-slate-100"
                        title="Abrir a imagem inteira"
                      >
                        <img
                          src={item.url}
                          alt={item.legenda || `Imagem ${idx + 1} do tutorial`}
                          loading="lazy"
                          className="block max-w-full w-auto h-auto max-h-80 object-contain"
                          onError={esconderSeFalhar}
                        />
                      </a>
                      {item.legenda && (
                        <figcaption className="px-3.5 py-2.5 text-sm text-slate-600 border-t border-slate-200 break-words">
                          {item.legenda}
                        </figcaption>
                      )}
                    </figure>
                  )
                )}
              </div>
            </section>
          )}
        </div>

        {/* Rodapé com botões de ação */}
        <div className="p-5 sm:p-7 border-t border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row gap-3 shrink-0">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base sm:text-lg shadow-sm transition active:scale-98 text-center"
          >
            <span>Abrir ferramenta agora</span>
            <ExternalLink className="w-5 h-5 shrink-0" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-5 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-base border border-slate-300 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Endereço copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-slate-500" />
                <span>Copiar link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
