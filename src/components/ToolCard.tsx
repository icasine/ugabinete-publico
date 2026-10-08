import React from 'react';
import { ExternalLink, Info, Lock, CheckCircle2 } from 'lucide-react';
import { Ferramenta } from '../types';

interface ToolCardProps {
  tool: Ferramenta;
  onViewDetails: (tool: Ferramenta) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onViewDetails }) => {
  return (
    <article className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-400 transition-all p-5 sm:p-6 shadow-xs hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Topo: Categoria e Selo de Login */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">
            {tool.categoria}
          </span>

          {tool.exigeLogin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-sm">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Requer login
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              Acesso livre
            </span>
          )}
        </div>

        {/* Nome da Ferramenta */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {tool.nome}
        </h2>

        {/* Resumo (1 frase) */}
        <p className="mt-2.5 text-slate-600 text-base sm:text-lg leading-relaxed">
          {tool.resumo}
        </p>
      </div>

      {/* Dois botões grandes e acessíveis */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-xs transition focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-center"
        >
          <span>Acessar ferramenta</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>

        <button
          onClick={() => onViewDetails(tool)}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-base transition border border-slate-300/80 focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer text-center"
        >
          <Info className="w-4 h-4 text-slate-600 shrink-0" />
          <span>Ver detalhes</span>
        </button>
      </div>
    </article>
  );
};
