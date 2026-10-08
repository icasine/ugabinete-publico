import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ToolCard } from './components/ToolCard';
import { ToolModal } from './components/ToolModal';
import { Ferramenta, normalizarFerramentas } from './types';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';

function idDaHash(): string {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, '')).trim().toLowerCase();
  } catch {
    return '';
  }
}

const semAcento = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function App() {
  const [tools, setTools] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Ferramenta | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Carrega public/ferramentas.json sem usar cópia antiga do navegador
  const loadTools = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/ferramentas.json', { cache: 'no-store', signal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: unknown = await res.json();
      setTools(normalizarFerramentas(data));
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Erro ao carregar ferramentas.json:', err);
      setError('Não foi possível carregar a lista de ferramentas.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTools(controller.signal);
    return () => controller.abort();
  }, [loadTools]);

  // Link direto #id: abre e fecha a janela de detalhes conforme o endereço
  useEffect(() => {
    if (tools.length === 0) return;
    const syncWithHash = () => {
      const id = idDaHash();
      setSelectedTool(id ? tools.find((t) => t.id === id) ?? null : null);
    };
    syncWithHash();
    window.addEventListener('hashchange', syncWithHash);
    return () => window.removeEventListener('hashchange', syncWithHash);
  }, [tools]);

  const handleOpenModal = (tool: Ferramenta) => {
    setSelectedTool(tool);
    if (idDaHash() !== tool.id) window.location.hash = tool.id;
  };

  const handleCloseModal = useCallback(() => {
    setSelectedTool(null);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(tools.map((t) => t.categoria).filter(Boolean)));
    return ['Todas', ...list.sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [tools]);

  const filteredTools = useMemo(() => {
    const term = semAcento(searchTerm).trim();
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'Todas' || tool.categoria === selectedCategory;
      const matchesSearch =
        !term ||
        semAcento(`${tool.nome} ${tool.resumo} ${tool.descricao} ${tool.categoria}`).includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [tools, selectedCategory, searchTerm]);

  // Busca e filtro aparecem SOMENTE a partir de 6 ferramentas
  const showSearchAndFilters = tools.length >= 6;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6">
        {showSearchAndFilters && (
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ferramenta..."
                aria-label="Buscar ferramenta"
                maxLength={80}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div className="sm:w-48 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filtrar por categoria"
                className="w-full pl-9 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-16 text-center" role="status">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500">Carregando ferramentas...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center max-w-md mx-auto my-8" role="alert">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              type="button"
              onClick={() => loadTools()}
              className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && filteredTools.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">
            Nenhuma ferramenta encontrada.
          </div>
        )}

        {!loading && !error && filteredTools.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onViewDetails={handleOpenModal} />
            ))}
          </div>
        )}
      </main>

      <ToolModal tool={selectedTool} onClose={handleCloseModal} />

      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500">
        uGabinete &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
