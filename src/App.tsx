import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ToolCard } from './components/ToolCard';
import { ToolModal } from './components/ToolModal';
import { Ferramenta } from './types';
import { Search, Filter, AlertCircle, RefreshCw, LayoutGrid } from 'lucide-react';

export default function App() {
  const [tools, setTools] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTool, setSelectedTool] = useState<Ferramenta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Carrega o arquivo public/ferramentas.json
  const loadTools = async () => {
    setLoading(true);
    setError(null);
    try {
      // Adiciona timestamp no fetch para evitar cache agressivo de navegadores no arquivo JSON
      const res = await fetch(`/ferramentas.json?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Não foi possível carregar as ferramentas (Código HTTP ${res.status}).`);
      }
      const data: Ferramenta[] = await res.json();
      setTools(data);
    } catch (err) {
      console.error(err);
      setError(
        'Não foi possível carregar a lista de ferramentas. Verifique se o arquivo public/ferramentas.json está correto.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  // Monitora a hash na URL (#id-da-ferramenta) para abrir a janela de detalhes diretamente
  useEffect(() => {
    if (tools.length === 0) return;

    const checkHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        const found = tools.find((t) => t.id.toLowerCase() === hash.toLowerCase());
        if (found) {
          setSelectedTool(found);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [tools]);

  // Ao abrir o modal, atualiza a hash; ao fechar, remove a hash
  const handleOpenModal = (tool: Ferramenta) => {
    setSelectedTool(tool);
    window.location.hash = tool.id;
  };

  const handleCloseModal = () => {
    setSelectedTool(null);
    // Limpa a hash da URL sem recarregar a página
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Categorias únicas
  const categories = useMemo(() => {
    const list = Array.from(new Set(tools.map((t) => t.categoria).filter(Boolean)));
    return ['Todas', ...list];
  }, [tools]);

  // Filtro de ferramentas (usado se busca/filtro estiverem ativos)
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'Todas' || tool.categoria === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        tool.nome.toLowerCase().includes(term) ||
        tool.resumo.toLowerCase().includes(term) ||
        tool.descricao.toLowerCase().includes(term) ||
        tool.categoria.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [tools, selectedCategory, searchTerm]);

  // Regra da especificação: busca e filtros aparecem SOMENTE com 6 ou mais ferramentas
  const showSearchAndFilters = tools.length >= 6;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Cabeçalho */}
      <Header />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Banner de Boas-vindas Simples e Acessível */}
        <section className="mb-8 p-6 bg-white rounded-2xl border-2 border-slate-200/80 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl hidden sm:flex shrink-0">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                Bem-vindo ao uGabinete
              </h2>
              <p className="mt-1 text-base sm:text-lg text-slate-600 leading-relaxed">
                Aqui você encontra acesso direto a todas as nossas ferramentas e utilitários digitais. Clique em <strong>Acessar ferramenta</strong> para abrir em uma nova janela ou em <strong>Ver detalhes</strong> para instruções de uso.
              </p>
            </div>
          </div>
        </section>

        {/* Busca e Filtros condicionais: SOMENTE se houver 6 ou mais ferramentas */}
        {showSearchAndFilters && (
          <section className="mb-8 space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Campo de Busca */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ferramentas por nome ou assunto..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-base sm:text-lg text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500 transition placeholder:text-slate-400"
                />
              </div>

              {/* Filtro por Categoria */}
              <div className="sm:w-64 relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-8 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-base sm:text-lg text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500 transition appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'Todas' ? 'Todas as categorias' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Estado: Carregando... */}
        {loading && (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-800">Carregando ferramentas...</p>
            <p className="text-base text-slate-500 mt-1">Por favor, aguarde um instante.</p>
          </div>
        )}

        {/* Estado: Erro */}
        {!loading && error && (
          <div className="p-8 text-center bg-red-50 rounded-2xl border-2 border-red-200">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Erro ao carregar</h3>
            <p className="text-base sm:text-lg text-red-800 max-w-lg mx-auto mb-6">
              {error}
            </p>
            <button
              onClick={loadTools}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-base transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Tentar novamente</span>
            </button>
          </div>
        )}

        {/* Estado: Sem resultados */}
        {!loading && !error && filteredTools.length === 0 && (
          <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xl font-bold text-slate-800">Nenhuma ferramenta encontrada</p>
            <p className="text-base text-slate-600 mt-2">
              {searchTerm || selectedCategory !== 'Todas'
                ? 'Tente alterar os termos de pesquisa ou o filtro selecionado.'
                : 'Nenhuma ferramenta cadastrada no momento.'}
            </p>
            {(searchTerm || selectedCategory !== 'Todas') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todas');
                }}
                className="mt-5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-base transition"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Grade de Cards: 1 coluna no celular, 2 colunas no computador */}
        {!loading && !error && filteredTools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onViewDetails={handleOpenModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Janela de Detalhes da Ferramenta */}
      <ToolModal tool={selectedTool} onClose={handleCloseModal} />

      {/* Rodapé Neutro (sem dados pessoais, e-mails ou telefones) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-slate-500 text-sm sm:text-base">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="font-semibold text-slate-700">
            uGabinete &bull; Catálogo de Ferramentas Web
          </p>
          <p className="mt-1 text-slate-500">
            Acesso rápido e direto às aplicações web. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
