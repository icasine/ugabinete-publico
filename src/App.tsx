import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ToolCard } from './components/ToolCard';
import { ToolModal } from './components/ToolModal';
import { Ferramenta } from './types';
import {
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Download,
  MousePointerClick,
  Info,
  ExternalLink,
  Layers,
} from 'lucide-react';

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
      const res = await fetch(`/ferramentas.json?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Não foi possível carregar as ferramentas (Código HTTP ${res.status}).`);
      }
      const data: Ferramenta[] = await res.json();
      setTools(data);
    } catch (err) {
      console.error(err);
      setError(
        'Não foi possível carregar a lista de ferramentas. Verifique se o arquivo public/ferramentas.json está acessível.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  // Monitora a hash na URL (#id-da-ferramenta) para abrir o modal diretamente
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

  const handleOpenModal = (tool: Ferramenta) => {
    setSelectedTool(tool);
    window.location.hash = tool.id;
  };

  const handleCloseModal = () => {
    setSelectedTool(null);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Categorias únicas
  const categories = useMemo(() => {
    const list = Array.from(new Set(tools.map((t) => t.categoria).filter(Boolean)));
    return ['Todas', ...list];
  }, [tools]);

  // Filtro de ferramentas
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

  // Busca e filtro aparecem apenas se houver 6 ou mais ferramentas
  const showSearchAndFilters = tools.length >= 6;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Cabeçalho Fixo */}
      <Header />

      <main className="flex-1">
        {/* ABERTURA (HERO) de Largura Total com Gradiente Suave e Formas Geométricas Desfocadas */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-[#f8fafc] border-b border-slate-200/60 pt-12 pb-16 sm:pt-16 sm:pb-20">
          {/* Formas Geométricas Sutis ao Fundo */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/35 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>
          <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-200/25 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#1e3a8a] tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Ferramentas para o dia a dia do gabinete, num só lugar
            </h1>

            {/* Subtítulo Curto */}
            <p className="mt-4 sm:mt-5 text-lg sm:text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Sem burocracia: é só escolher a ferramenta e clicar para abrir direto no seu navegador.
            </p>

            {/* Linha com 3 Pequenos Selos */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 font-semibold text-sm sm:text-base border border-slate-200/90 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                Sem cadastro para navegar
              </span>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 font-semibold text-sm sm:text-base border border-slate-200/90 shadow-2xs">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                Funciona no celular
              </span>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 font-semibold text-sm sm:text-base border border-slate-200/90 shadow-2xs">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                Pode instalar como aplicativo
              </span>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA: Faixa com 3 passos ilustrados */}
        <section className="bg-white border-b border-slate-200/80 py-12 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Como funciona
              </h2>
              <p className="mt-1.5 text-base sm:text-lg text-slate-500">
                Acesse qualquer aplicação em 3 passos simples
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Passo 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-4 shadow-xs">
                  <MousePointerClick className="w-8 h-8" strokeWidth={2} />
                </div>
                <div className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                  Passo 1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                  Escolha a ferramenta
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Localize no catálogo a aplicação ideal para a tarefa que você precisa realizar.
                </p>
              </div>

              {/* Passo 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
                  <Info className="w-8 h-8" strokeWidth={2} />
                </div>
                <div className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full mb-2">
                  Passo 2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                  Veja os detalhes
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Confira orientações de uso, recursos principais e se há necessidade de login próprio.
                </p>
              </div>

              {/* Passo 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
                  <ExternalLink className="w-8 h-8" strokeWidth={2} />
                </div>
                <div className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2">
                  Passo 3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                  Abra e use
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Acesse o sistema em uma nova aba com total segurança e execute suas atividades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO: FERRAMENTAS DISPONÍVEIS */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1e3a8a] tracking-tight">
                Ferramentas disponíveis
              </h2>
              {!loading && !error && (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-[#1e3a8a] font-extrabold text-sm sm:text-base border border-blue-200">
                  {tools.length}
                </span>
              )}
            </div>

            <p className="text-slate-500 text-base">
              Aplicações web prontas para uso direto
            </p>
          </div>

          {/* Busca e Filtros condicionais: SOMENTE se houver 6 ou mais ferramentas */}
          {showSearchAndFilters && (
            <div className="mb-8 space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar ferramentas por nome ou assunto..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-lg text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500 transition placeholder:text-slate-400"
                  />
                </div>

                <div className="sm:w-64 relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-lg text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500 transition appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'Todas' ? 'Todas as categorias' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Estado: Carregando... */}
          {loading && (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <RefreshCw className="w-11 h-11 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-xl sm:text-2xl font-bold text-slate-800">Carregando ferramentas...</p>
              <p className="text-base text-slate-500 mt-1">Buscando catálogo atualizado.</p>
            </div>
          )}

          {/* Estado: Erro */}
          {!loading && error && (
            <div className="p-8 sm:p-10 text-center bg-red-50/90 rounded-3xl border border-red-200 shadow-xs">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-red-900 mb-2">Erro ao carregar o catálogo</h3>
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
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6">
              <p className="text-xl font-bold text-slate-800">Nenhuma ferramenta encontrada</p>
              <p className="text-base text-slate-600 mt-2">
                {searchTerm || selectedCategory !== 'Todas'
                  ? 'Tente alterar os termos da busca ou selecione outra categoria.'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onViewDetails={handleOpenModal}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Janela de Detalhes da Ferramenta */}
      <ToolModal tool={selectedTool} onClose={handleCloseModal} />

      {/* RODAPÉ em azul-marinho com texto claro: nome uGabinete, frase curta e o ano atual. Sem dados pessoais. */}
      <footer className="mt-auto bg-[#0f172a] text-slate-300 py-10 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0">
              u
            </div>
            <div>
              <p className="font-extrabold text-white text-lg tracking-tight">
                uGabinete
              </p>
              <p className="text-sm text-slate-400">
                Portal e catálogo de ferramentas web
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-400">
            Acesso rápido, simples e direto às ferramentas do dia a dia &bull; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
