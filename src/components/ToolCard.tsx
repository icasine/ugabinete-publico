import React from 'react';
import { ExternalLink, Info, Lock, CheckCircle2 } from 'lucide-react';
import { Ferramenta } from '../types';
import { getToolIcon, getToolColorTheme } from '../utils/toolTheme';

interface ToolCardProps {
  tool: Ferramenta;
  onViewDetails: (tool: Ferramenta) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onViewDetails }) => {
  const IconComponent = getToolIcon(tool.icone);
  const colorTheme = getToolColorTheme(tool.cor);

  return (
    <article className={`bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group ${colorTheme.borderAccent}`}>
      <div>
        {/* Topo do Card: Ícone colorido à esquerda e Selo de Login discreto à direita */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className={`w-14 h-14 rounded-2xl ${colorTheme.iconBg} ${colorTheme.iconText} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300`}>
            <IconComponent className="w-7 h-7" strokeWidth={2.2} />
          </div>

          {/* Selo discreto de Login */}
          {tool.exigeLogin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 font-medium text-xs sm:text-sm">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Requer login
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-xs sm:text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Acesso livre
            </span>
          )}
        </div>

        {/* Categoria em texto pequeno acima do nome */}
        <span className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
          {tool.categoria}
        </span>

        {/* Nome da Ferramenta */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
          {tool.nome}
        </h3>

        {/* Resumo da Ferramenta */}
        <p className="mt-2.5 text-slate-600 text-[16px] sm:text-[17px] leading-relaxed">
          {tool.resumo}
        </p>
      </div>

      {/* Botões de Ação: Lado a lado no computador, empilhados no celular */}
      <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        {/* Botão Principal cheio e largo: Acessar ferramenta */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-sm hover:shadow-md transition active:scale-98 text-center"
        >
          <span>Acessar ferramenta</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>

        {/* Botão Secundário mais leve: Ver detalhes */}
        <button
          onClick={() => onViewDetails(tool)}
          className="sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-base transition cursor-pointer border border-slate-200/70"
        >
          <Info className="w-4 h-4 text-slate-600 shrink-0" />
          <span>Ver detalhes</span>
        </button>
      </div>
    </article>
  );
};
