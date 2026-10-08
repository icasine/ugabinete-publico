import React from 'react';
import { Info, Lock } from 'lucide-react';
import { Ferramenta } from '../types';
import { getToolIcon, getToolColorTheme } from '../utils/toolTheme';

interface ToolCardProps {
  tool: Ferramenta;
  onViewDetails: (tool: Ferramenta) => void;
}

/**
 * Bloco da ferramenta. O link cobre o bloco inteiro (via ::after) e o botão
 * "i" fica por cima dele.
 * Capa (tool.capa): faixa 16:9 no alto do cartão, sempre cortada no tamanho do cartão.
 * Imagem personalizada (tool.imagem): substitui o ícone, sempre 40x40.
 * Tipo 'link' (link direto): não exibe o botão de detalhes.
 */
export const ToolCard: React.FC<ToolCardProps> = ({ tool, onViewDetails }) => {
  const IconComponent = getToolIcon(tool.icone);
  const colorTheme = getToolColorTheme(tool.cor);
  const isDirectLink = tool.tipo === 'link';

  return (
    <div className="group relative flex flex-col min-w-0 overflow-hidden p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-xl transition-all shadow-2xs hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
      {tool.capa && (
        <div className="-mx-4 -mt-4 mb-3 aspect-video bg-slate-100 border-b border-slate-200 overflow-hidden">
          <img
            src={tool.capa}
            alt=""
            loading="lazy"
            className="block w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        {tool.imagem ? (
          <img
            src={tool.imagem}
            alt=""
            className="w-10 h-10 max-w-10 max-h-10 rounded-lg object-cover shrink-0 border border-slate-200/80"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-lg ${colorTheme.iconBg} ${colorTheme.iconText} flex items-center justify-center shrink-0`}
            aria-hidden="true"
          >
            <IconComponent className="w-5 h-5" strokeWidth={2.2} />
          </div>
        )}

        <div className="relative z-10 flex items-center gap-1">
          {tool.exigeLogin && (
            <span className="p-1 text-amber-600" title="Exige login próprio">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">Exige login próprio</span>
            </span>
          )}
          {!isDirectLink && (
            <button
              type="button"
              onClick={() => onViewDetails(tool)}
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              title="Ver detalhes da ferramenta"
              aria-label={`Ver detalhes de ${tool.nome}`}
            >
              <Info className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus:outline-hidden after:absolute after:inset-0 after:content-['']"
          title={`Abrir ${tool.nome} (nova aba)`}
        >
          {tool.nome}
        </a>
      </h3>

      <p className="mt-0.5 text-sm text-slate-500 truncate" title={tool.resumo}>
        {tool.resumo}
      </p>
    </div>
  );
};
