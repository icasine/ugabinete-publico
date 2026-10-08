import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Key,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Search,
  History,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  HelpCircle,
  Lock,
  User,
  RotateCcw,
  KeyRound,
  PlayCircle,
  ImagePlus,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Ferramenta, ItemTutorial, gerarId, idSeguro, idYoutube, linkYoutube } from '../types';
import { AVAILABLE_ICONS, getToolColorTheme, getToolIcon } from '../utils/toolTheme';
import { cropAndResizeToSquareWebp, capaWebp, resizeDemoImageWebp } from '../utils/imageProcess';
import {
  getStoredToken,
  saveToken,
  clearToken,
  isRememberedOnDevice,
  publicarEmUmCommit,
  utf8ToBase64,
  ErroGitHub,
  ProgressoPublicacao,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
} from '../utils/githubApi';
import {
  getStoredSession,
  login,
  logout,
  validateSession,
  isConfiguredUrl,
  SessionData,
} from '../utils/authService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Ferramenta[];
  onToolsPublished: (updated: Ferramenta[]) => void;
}

/** Imagem nova, ainda só no navegador. A chave é o caminho que vai no JSON (ex.: /capas/x.webp). */
interface PendingFile {
  base64: string;
  previewUrl: string;
}

interface Rascunho {
  versao: 2;
  base: string;
  tools: Ferramenta[];
  pending: Record<string, PendingFile>;
  editing: { item: Ferramenta; isNew: boolean; originalId: string } | null;
}

const CHAVE_RASCUNHO = 'ugabinete_rascunho_v2';
const LIMITE_TUTORIAL = 12;

/** Resumo curto do conteúdo publicado, para saber se o site mudou depois que o rascunho começou. */
function assinatura(tools: Ferramenta[]): string {
  const s = JSON.stringify(tools);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${s.length}-${h >>> 0}`;
}

function copiar<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function carimbo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** Todos os caminhos de imagem locais usados pelos itens. */
function imagensUsadas(tools: Ferramenta[]): Set<string> {
  const usadas = new Set<string>();
  const add = (v?: string) => {
    if (v && v.startsWith('/')) usadas.add(v);
  };
  for (const t of tools) {
    add(t.imagem);
    add(t.capa);
    add(t.imagemDemo);
    (t.tutorial || []).forEach((it) => it.tipo === 'imagem' && add(it.url));
  }
  return usadas;
}

function lerRascunho(): Rascunho | null {
  try {
    const bruto = localStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) return null;
    const d = JSON.parse(bruto);
    if (d && d.versao === 2 && Array.isArray(d.tools)) return d as Rascunho;
  } catch {
    /* rascunho ilegível: ignora */
  }
  return null;
}

function apagarRascunho() {
  try {
    localStorage.removeItem(CHAVE_RASCUNHO);
    // chaves da versão anterior do painel
    localStorage.removeItem('ugabinete_draft_tools');
    localStorage.removeItem('ugabinete_pending_files');
  } catch {
    /* nada a apagar */
  }
}

const campo =
  'w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition';
const rotulo = 'block text-xs font-bold text-slate-700 mb-1';
const botaoLeve =
  'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-default';
const botaoIcone =
  'p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-default';

/** Lista de textos com adicionar, remover e reordenar (destaques e passos do "Como usar"). */
const ListaEditavel: React.FC<{
  titulo: string;
  itens: string[];
  numerada?: boolean;
  textoAdicionar: string;
  placeholder: string;
  onChange: (itens: string[]) => void;
}> = ({ titulo, itens, numerada, textoAdicionar, placeholder, onChange }) => {
  const mover = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= itens.length) return;
    const n = [...itens];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={rotulo}>{titulo}</span>
        <button type="button" className={botaoLeve} onClick={() => onChange([...itens, ''])} disabled={itens.length >= 20}>
          <Plus className="w-3.5 h-3.5" />
          {textoAdicionar}
        </button>
      </div>
      {itens.length === 0 && <p className="text-xs text-slate-400">Nenhum item ainda.</p>}
      {itens.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {numerada && (
            <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
          )}
          <input
            type="text"
            value={item}
            maxLength={500}
            onChange={(e) => {
              const n = [...itens];
              n[i] = e.target.value;
              onChange(n);
            }}
            placeholder={`${placeholder} ${i + 1}`}
            className={`${campo} min-w-0`}
          />
          <button type="button" className={botaoIcone} onClick={() => mover(i, -1)} disabled={i === 0} title="Subir">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button type="button" className={botaoIcone} onClick={() => mover(i, 1)} disabled={i === itens.length - 1} title="Descer">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`${botaoIcone} hover:text-red-600 hover:bg-red-50`}
            onClick={() => onChange(itens.filter((_, k) => k !== i))}
            title="Remover"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, tools: initialTools, onToolsPublished }) => {
  // 1. Sessão (usuário e senha conferidos pela planilha)
  const [session, setSession] = useState<SessionData | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [userInput, setUserInput] = useState<string>('');
  const [passInput, setPassInput] = useState<string>('');
  const [rememberSession, setRememberSession] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 2. Token do GitHub (pedido só na hora de publicar)
  const [ghToken, setGhToken] = useState<string>('');
  const [showTokenPrompt, setShowTokenPrompt] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [rememberToken, setRememberToken] = useState<boolean>(true);
  const [aceitarClassico, setAceitarClassico] = useState<boolean>(false);
  const [tokenPromptError, setTokenPromptError] = useState<string | null>(null);

  // 3. Rascunho
  const [draftTools, setDraftTools] = useState<Ferramenta[]>([]);
  const [pendingFiles, setPendingFiles] = useState<Record<string, PendingFile>>({});
  const [hasLocalDraft, setHasLocalDraft] = useState<boolean>(false);
  const [rascunhoAntigo, setRascunhoAntigo] = useState<boolean>(false);
  const [avisoRascunho, setAvisoRascunho] = useState<string | null>(null);
  const [sujo, setSujo] = useState<boolean>(false);

  // 4. Navegação interna
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingItem, setEditingItemState] = useState<Ferramenta | null>(null);
  const [isNewItem, setIsNewItem] = useState<boolean>(false);
  const [originalId, setOriginalId] = useState<string>('');
  const [menuNovo, setMenuNovo] = useState<boolean>(false);
  const menuNovoRef = useRef<HTMLDivElement>(null);

  // Editor
  const [iconSearch, setIconSearch] = useState<string>('');
  const [iconMode, setIconMode] = useState<'library' | 'upload'>('library');
  const [novoVideo, setNovoVideo] = useState<string>('');
  const [novoVideoLegenda, setNovoVideoLegenda] = useState<string>('');
  const [erroVideo, setErroVideo] = useState<string | null>(null);
  const [processandoImagem, setProcessandoImagem] = useState<boolean>(false);

  // Publicação
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<ProgressoPublicacao | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  const editingItem_ = editingItem;

  const setEditingItem = (item: Ferramenta | null) => {
    setEditingItemState(item);
    setSujo(true);
  };

  const atualizarLista = (lista: Ferramenta[]) => {
    setDraftTools(lista);
    setHasLocalDraft(true);
    setSujo(true);
  };

  const atualizarPendentes = (p: Record<string, PendingFile>) => {
    setPendingFiles(p);
    setSujo(true);
  };

  /** Mostra a imagem nova (ainda no navegador) ou a que já está publicada. */
  const srcDe = (caminho?: string) => (caminho ? (pendingFiles[caminho] ? pendingFiles[caminho].previewUrl : caminho) : '');

  // Abre o painel: carrega token, rascunho e confere a sessão
  useEffect(() => {
    if (!isOpen) return;

    const storedToken = getStoredToken();
    setGhToken(storedToken || '');

    const r = lerRascunho();
    if (r) {
      setDraftTools(r.tools);
      setPendingFiles(r.pending || {});
      setHasLocalDraft(true);
      setRascunhoAntigo(r.base !== assinatura(initialTools));
      if (r.editing) {
        setEditingItemState(r.editing.item);
        setIsNewItem(r.editing.isNew);
        setOriginalId(r.editing.originalId);
        setIconMode(r.editing.item.imagem ? 'upload' : 'library');
        setView('edit');
      } else {
        setEditingItemState(null);
        setView('list');
      }
    } else {
      setDraftTools(copiar(initialTools));
      setPendingFiles({});
      setHasLocalDraft(false);
      setRascunhoAntigo(false);
      setEditingItemState(null);
      setView('list');
    }
    setSujo(false);
    setAvisoRascunho(null);

    const currentSession = getStoredSession();
    if (currentSession) {
      setSession(currentSession);
      setIsCheckingSession(true);
      validateSession(currentSession.sessao)
        .then((isValid) => {
          if (!isValid) {
            setSession(null);
            setLoginError('Sessão expirada. Entre novamente.');
          }
        })
        .finally(() => setIsCheckingSession(false));
    } else {
      setSession(null);
      setIsCheckingSession(false);
    }

    setPublishSuccess(false);
    setPublishError(null);
  }, [isOpen, initialTools]);

  // Guarda o rascunho no aparelho a cada alteração (inclusive o item aberto no formulário)
  useEffect(() => {
    if (!isOpen || !sujo) return;
    const dados: Rascunho = {
      versao: 2,
      base: (lerRascunho() || { base: '' }).base || assinatura(initialTools),
      tools: draftTools,
      pending: pendingFiles,
      editing: view === 'edit' && editingItem_ ? { item: editingItem_, isNew: isNewItem, originalId } : null,
    };
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados));
      setAvisoRascunho(null);
    } catch {
      setAvisoRascunho(
        'O rascunho ficou grande demais para o navegador guardar (muitas imagens novas). Nada foi perdido nesta tela, mas publique ou remova algumas imagens antes de fechar a aba.'
      );
    }
  }, [isOpen, sujo, draftTools, pendingFiles, editingItem_, view, isNewItem, originalId]);

  // Fecha o menu "Novo item" ao clicar fora
  useEffect(() => {
    if (!menuNovo) return;
    const fora = (e: Event) => {
      if (menuNovoRef.current && !menuNovoRef.current.contains(e.target as Node)) setMenuNovo(false);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [menuNovo]);

  const cancelarEdicao = () => {
    setEditingItem(null);
    setView('list');
  };

  // Tecla Esc
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || isPublishing) return;
      if (menuNovo) setMenuNovo(false);
      else if (showTokenPrompt) setShowTokenPrompt(false);
      else if (view === 'edit') cancelarEdicao();
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPublishing, showTokenPrompt, view, menuNovo, onClose]);

  const handleDiscardDraft = () => {
    if (!window.confirm('Descartar o rascunho deste aparelho e voltar para a versão publicada do site?')) return;
    apagarRascunho();
    setDraftTools(copiar(initialTools));
    setPendingFiles({});
    setHasLocalDraft(false);
    setRascunhoAntigo(false);
    setAvisoRascunho(null);
    setEditingItemState(null);
    setView('list');
    setSujo(false);
  };

  // LOGIN
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !passInput) {
      setLoginError('Informe o usuário e a senha.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const sess = await login(userInput, passInput, rememberSession);
      setSession(sess);
      setUserInput('');
      setPassInput('');
    } catch (err) {
      setLoginError((err as Error).message || 'Não foi possível entrar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout(session?.sessao);
    setSession(null);
  };

  const handleForgetGithubToken = () => {
    clearToken();
    setGhToken('');
    alert('Token do GitHub removido deste aparelho.');
  };

  // LISTA
  const moveTool = (index: number, d: number) => {
    const j = index + d;
    if (j < 0 || j >= draftTools.length) return;
    const n = [...draftTools];
    [n[index], n[j]] = [n[j], n[index]];
    atualizarLista(n);
  };

  const toggleVisibility = (index: number) => {
    const n = [...draftTools];
    n[index] = { ...n[index], visivel: n[index].visivel === false };
    atualizarLista(n);
  };

  const idLivre = (base: string, ignorar = '') => {
    let id = base || 'item';
    let c = 2;
    while (draftTools.some((t) => t.id === id && t.id !== ignorar)) id = `${base}-${c++}`;
    return id;
  };

  const duplicateTool = (tool: Ferramenta) => {
    const clone: Ferramenta = { ...copiar(tool), id: idLivre(`${tool.id}-copia`), nome: `${tool.nome} (cópia)`, atalho: undefined };
    atualizarLista([...draftTools, clone]);
  };

  const deleteTool = (index: number) => {
    const item = draftTools[index];
    if (window.confirm(`Excluir "${item.nome}"? Só sai do site depois de publicar.`)) {
      atualizarLista(draftTools.filter((_, i) => i !== index));
    }
  };

  const startNewItem = (tipo: 'aplicativo' | 'link') => {
    setMenuNovo(false);
    setIsNewItem(true);
    setOriginalId('');
    setIconMode('library');
    setEditingItem({
      id: '',
      nome: '',
      resumo: '',
      descricao: '',
      categoria: 'Geral',
      url: 'https://',
      exigeLogin: false,
      cor: 'azul',
      icone: tipo === 'link' ? 'ExternalLink' : 'FileText',
      destaques: [],
      comoUsar: [],
      imagemDemo: '',
      tutorial: [],
      visivel: true,
      tipo,
      atalho: '',
    });
    setView('edit');
  };

  const startEditItem = (tool: Ferramenta) => {
    setIsNewItem(false);
    setOriginalId(tool.id);
    setIconMode(tool.imagem ? 'upload' : 'library');
    setEditingItem(copiar(tool));
    setView('edit');
  };

  const saveEditingItem = () => {
    const it = editingItem_;
    if (!it) return;
    if (!it.nome.trim()) {
      alert('Informe o nome.');
      return;
    }
    if (!/^https:\/\/[^\s/]+\.[^\s]+$/.test(it.url.trim())) {
      alert('O endereço precisa ser um link completo começando com https://');
      return;
    }
    const id = isNewItem ? idLivre(gerarId(it.nome)) : originalId;
    const salvo: Ferramenta = {
      ...it,
      id,
      nome: it.nome.trim(),
      resumo: it.resumo.trim(),
      descricao: it.descricao.trim(),
      categoria: it.categoria.trim() || 'Geral',
      url: it.url.trim(),
      destaques: it.destaques.map((d) => d.trim()).filter(Boolean),
      comoUsar: it.comoUsar.map((d) => d.trim()).filter(Boolean),
      tutorial: (it.tutorial || []).filter((t) => t.url),
      atalho: it.atalho ? idSeguro(it.atalho) || undefined : undefined,
    };
    if (salvo.tutorial && salvo.tutorial.length === 0) salvo.tutorial = undefined;
    atualizarLista(isNewItem ? [...draftTools, salvo] : draftTools.map((t) => (t.id === originalId ? salvo : t)));
    setEditingItem(null);
    setView('list');
  };

  // IMAGENS
  const novaImagem = async (
    e: React.ChangeEvent<HTMLInputElement>,
    pasta: 'icones' | 'capas' | 'demos' | 'tutorial',
    processar: (f: File) => Promise<{ base64: string; previewUrl: string; extensao?: string }>
  ): Promise<string | null> => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !editingItem_) return null;
    setProcessandoImagem(true);
    try {
      const img = await processar(file);
      const caminho = `/${pasta}/${gerarId(editingItem_.nome || editingItem_.id || 'item')}-${carimbo()}-${Math.random().toString(36).slice(2, 6)}.${img.extensao || 'webp'}`;
      atualizarPendentes({ ...pendingFiles, [caminho]: { base64: img.base64, previewUrl: img.previewUrl } });
      return caminho;
    } catch (err) {
      alert((err as Error).message);
      return null;
    } finally {
      setProcessandoImagem(false);
    }
  };

  /** Ao trocar ou remover uma imagem que ainda nem foi publicada, ela sai do rascunho. */
  const descartarPendente = (caminho?: string) => {
    if (caminho && pendingFiles[caminho]) {
      const p = { ...pendingFiles };
      delete p[caminho];
      atualizarPendentes(p);
    }
  };

  const tutorialAtual = (editingItem_ && editingItem_.tutorial) || [];
  const setTutorial = (t: ItemTutorial[]) => editingItem_ && setEditingItem({ ...editingItem_, tutorial: t });

  const adicionarVideo = () => {
    const id = idYoutube(novoVideo);
    if (!id) {
      setErroVideo('Link do YouTube não reconhecido. Cole o endereço do vídeo (youtube.com/watch?v=... ou youtu.be/...).');
      return;
    }
    if (tutorialAtual.length >= LIMITE_TUTORIAL) {
      setErroVideo(`O tutorial aceita até ${LIMITE_TUTORIAL} itens.`);
      return;
    }
    setTutorial([...tutorialAtual, { tipo: 'video', url: linkYoutube(id), legenda: novoVideoLegenda.trim() || undefined }]);
    setNovoVideo('');
    setNovoVideoLegenda('');
    setErroVideo(null);
  };

  const moverTutorial = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= tutorialAtual.length) return;
    const n = [...tutorialAtual];
    [n[i], n[j]] = [n[j], n[i]];
    setTutorial(n);
  };

  const removerTutorial = (i: number) => {
    const item = tutorialAtual[i];
    if (item.tipo === 'imagem') descartarPendente(item.url);
    setTutorial(tutorialAtual.filter((_, k) => k !== i));
  };

  const existingCategories = useMemo(
    () => Array.from(new Set(draftTools.map((t) => t.categoria).filter(Boolean))),
    [draftTools]
  );

  const filteredIcons = useMemo(() => {
    const q = iconSearch.toLowerCase().trim();
    if (!q) return AVAILABLE_ICONS;
    return AVAILABLE_ICONS.filter((opt) => opt.name.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q));
  }, [iconSearch]);

  const atalhosConflitantes = useMemo(() => {
    const counts = new Map<string, number>();
    draftTools.forEach((t) => t.atalho && counts.set(t.atalho, (counts.get(t.atalho) || 0) + 1));
    return Array.from(counts.entries())
      .filter(([, c]) => c > 1)
      .map(([a]) => a);
  }, [draftTools]);

  // PUBLICAÇÃO
  const handlePublishClick = () => {
    for (const tool of draftTools) {
      if (!tool.nome.trim()) {
        alert('Existe um item sem nome. Corrija antes de publicar.');
        return;
      }
      if (!tool.url.trim().startsWith('https://')) {
        alert(`"${tool.nome}" tem um endereço inválido (deve começar com https://).`);
        return;
      }
    }
    if (atalhosConflitantes.length > 0) {
      alert(`Atalhos repetidos: ${atalhosConflitantes.join(', ')}. Cada atalho deve ser único.`);
      return;
    }
    if (!ghToken) {
      setTokenPromptError(null);
      setTokenInput('');
      setAceitarClassico(false);
      setRememberToken(isRememberedOnDevice() || true);
      setShowTokenPrompt(true);
      return;
    }
    executePublish(ghToken);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setTokenPromptError('Cole o token do GitHub.');
      return;
    }
    if (clean.startsWith('ghp_') && !aceitarClassico) {
      setTokenPromptError(
        'Este é um token clássico (ghp_), que dá acesso a TODOS os seus repositórios. Prefira um fine-grained (github_pat_). Para usar mesmo assim, marque a opção abaixo.'
      );
      return;
    }
    if (!clean.startsWith('github_pat_') && !clean.startsWith('ghp_')) {
      setTokenPromptError('Isso não parece um token do GitHub (deve começar com github_pat_).');
      return;
    }
    saveToken(clean, rememberToken);
    setGhToken(clean);
    setShowTokenPrompt(false);
    executePublish(clean);
  };

  const executePublish = async (activeToken: string) => {
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);
    try {
      const usadas = imagensUsadas(draftTools);
      const arquivos = Object.entries(pendingFiles)
        .filter(([caminho]) => usadas.has(caminho))
        .map(([caminho, pf]) => ({ path: `public${caminho}`, base64: pf.base64 }));

      arquivos.push({ path: 'public/ferramentas.json', base64: utf8ToBase64(JSON.stringify(draftTools, null, 2) + '\n') });

      const redirects = [
        '# Atalhos do uGabinete (gerado pelo painel Gerenciar)',
        ...draftTools.filter((t) => t.atalho).map((t) => `/${t.atalho} ${t.url} 302`),
        '',
      ].join('\n');
      arquivos.push({ path: 'public/_redirects', base64: utf8ToBase64(redirects) });

      // Imagens que estavam publicadas e deixaram de ser usadas (trocadas, removidas ou de itens excluídos)
      const apagar = Array.from(imagensUsadas(initialTools))
        .filter((c) => !usadas.has(c) && /^\/(icones|capas|demos|tutorial)\//.test(c))
        .map((c) => `public${c}`);

      const agora = new Date();
      const mensagem = `Painel uGabinete: atualiza ferramentas (${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')})`;

      await publicarEmUmCommit(activeToken, arquivos, apagar, mensagem, setPublishProgress);

      apagarRascunho();
      setPendingFiles({});
      setHasLocalDraft(false);
      setRascunhoAntigo(false);
      setSujo(false);
      setPublishSuccess(true);
      onToolsPublished(draftTools);
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message || 'Falha ao publicar.';
      if (err instanceof ErroGitHub && (err.status === 401 || err.status === 403)) {
        clearToken();
        setGhToken('');
        setTokenInput('');
        setShowTokenPrompt(true);
        setTokenPromptError(`${msg} Suas edições continuam guardadas.`);
      } else {
        setPublishError(msg);
      }
    } finally {
      setIsPublishing(false);
      setPublishProgress(null);
    }
  };

  if (!isOpen) return null;

  // Cartão de prévia (mesmo visual do site)
  const Previa = ({ item }: { item: Ferramenta }) => {
    const Icone = getToolIcon(item.icone);
    const tema = getToolColorTheme(item.cor);
    return (
      <div className="relative flex flex-col min-w-0 overflow-hidden p-4 bg-white border border-slate-200 rounded-xl shadow-2xs w-full max-w-[260px]">
        {item.capa && (
          <div className="-mx-4 -mt-4 mb-3 aspect-video bg-slate-100 border-b border-slate-200 overflow-hidden">
            <img src={srcDe(item.capa)} alt="" className="block w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          {item.imagem ? (
            <img src={srcDe(item.imagem)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200/80" />
          ) : (
            <div className={`w-10 h-10 rounded-lg ${tema.iconBg} ${tema.iconText} flex items-center justify-center shrink-0`}>
              <Icone className="w-5 h-5" strokeWidth={2.2} />
            </div>
          )}
          <div className="flex items-center gap-1 text-slate-400">
            {item.exigeLogin && <Lock className="w-3.5 h-3.5 text-amber-600" />}
            {item.tipo !== 'link' && <Info className="w-4 h-4" />}
          </div>
        </div>
        <h4 className="mt-3 text-base font-semibold text-slate-900 truncate">{item.nome || 'Nome da ferramenta'}</h4>
        <p className="mt-0.5 text-sm text-slate-500 truncate">{item.resumo || 'Resumo em uma linha.'}</p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 my-auto max-h-[94vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">u</div>
            <div className="min-w-0">
              <h2 id="admin-title" className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
                Gerenciar ferramentas
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {GITHUB_OWNER}/{GITHUB_REPO}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {session && (
              <>
                <span className="hidden md:inline text-xs text-slate-600">
                  Olá, <strong className="text-slate-800">{session.usuarioNome}</strong>
                </span>
                {ghToken && (
                  <button type="button" onClick={handleForgetGithubToken} className={botaoLeve} title="Esquecer o token do GitHub guardado neste aparelho">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Esquecer token</span>
                  </button>
                )}
                <button type="button" onClick={handleLogout} className={`${botaoLeve} hover:text-red-700`} title="Sair do painel">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6">
          {isCheckingSession ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Conferindo o acesso...</p>
            </div>
          ) : !session ? (
            /* ETAPA 1: USUÁRIO E SENHA */
            <div className="max-w-md mx-auto py-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Entrar no gerenciamento</h3>
                <p className="text-sm text-slate-500 mt-1">Use o usuário e a senha cadastrados na planilha.</p>
              </div>

              {!isConfiguredUrl() && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>O endereço do script de acesso (URL_ACESSO em src/config.ts) não foi configurado.</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="user" className={rotulo}>
                    Usuário
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="user"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className={`${campo} pl-9 py-2.5`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="pass" className={rotulo}>
                    Senha
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="pass"
                      type="password"
                      autoComplete="current-password"
                      value={passInput}
                      onChange={(e) => setPassInput(e.target.value)}
                      className={`${campo} pl-9 py-2.5`}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={rememberSession} onChange={(e) => setRememberSession(e.target.checked)} className="w-4 h-4" />
                  Lembrar neste aparelho
                </label>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <span>Entrar no painel</span>
                  )}
                </button>
              </form>
            </div>
          ) : view === 'list' ? (
            /* ETAPA 2: LISTA */
            <div className="space-y-4">
              {rascunhoAntigo && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      O site publicado mudou depois que este rascunho começou. Se você continuar e publicar, o rascunho substitui o que mudou.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    <button type="button" className={botaoLeve} onClick={() => setRascunhoAntigo(false)}>
                      Continuar o rascunho
                    </button>
                    <button type="button" className={`${botaoLeve} text-red-700`} onClick={handleDiscardDraft}>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Descartar e usar o publicado
                    </button>
                  </div>
                </div>
              )}

              {avisoRascunho && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{avisoRascunho}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-sm font-bold text-slate-700">
                    {draftTools.length} {draftTools.length === 1 ? 'item' : 'itens'}
                  </span>
                  {hasLocalDraft && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Alterações não publicadas</span>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {hasLocalDraft && (
                    <button type="button" onClick={handleDiscardDraft} className={`${botaoLeve} hover:text-red-700`} title="Voltar para a versão publicada">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Descartar</span>
                    </button>
                  )}

                  <div className="relative" ref={menuNovoRef}>
                    <button
                      type="button"
                      onClick={() => setMenuNovo(!menuNovo)}
                      aria-expanded={menuNovo}
                      aria-haspopup="menu"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo item</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {menuNovo && (
                      <div role="menu" className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => startNewItem('aplicativo')}
                          className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <strong className="block">Aplicativo</strong>
                          <span className="block text-xs text-slate-500">Com janela de explicação e tutorial</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => startNewItem('link')}
                          className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <strong className="block">Link direto</strong>
                          <span className="block text-xs text-slate-500">O cartão abre o endereço no clique</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePublishClick}
                    disabled={isPublishing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{isPublishing ? 'Publicando...' : 'Publicar alterações'}</span>
                  </button>

                  <a
                    href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={botaoLeve}
                    title="Ver e recuperar versões anteriores no GitHub"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Histórico</span>
                  </a>
                </div>
              </div>

              {publishProgress && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span className="truncate">{publishProgress.etapa}</span>
                    </span>
                    <span className="font-bold shrink-0">{Math.round((publishProgress.atual / publishProgress.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${(publishProgress.atual / publishProgress.total) * 100}%` }} />
                  </div>
                </div>
              )}

              {publishSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Publicado.</strong> O site atualiza em cerca de 1 a 2 minutos. Fotos novas podem demorar esse tempo para aparecer.
                  </span>
                </div>
              )}

              {publishError && (
                <div className="sticky top-0 z-20 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>
                      <strong className="block">Não foi possível publicar. Nada foi alterado no site.</strong>
                      <span className="text-xs break-words">{publishError}</span>
                    </span>
                  </div>
                  <button type="button" onClick={handlePublishClick} className={`${botaoLeve} ml-7`}>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tentar de novo
                  </button>
                </div>
              )}

              <ul className="space-y-2">
                {draftTools.map((tool, index) => {
                  const Icone = getToolIcon(tool.icone);
                  const tema = getToolColorTheme(tool.cor);
                  const visivel = tool.visivel !== false;
                  return (
                    <li
                      key={tool.id || index}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-xl ${visivel ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {tool.capa ? (
                          <img src={srcDe(tool.capa)} alt="" className="w-20 aspect-video rounded-md object-cover shrink-0 border border-slate-200" />
                        ) : tool.imagem ? (
                          <img src={srcDe(tool.imagem)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg ${tema.iconBg} ${tema.iconText} flex items-center justify-center shrink-0`}>
                            <Icone className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <strong className="text-sm text-slate-900 truncate max-w-full">{tool.nome}</strong>
                            {!visivel && <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold">Oculto</span>}
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">{tool.tipo === 'link' ? 'Link direto' : 'Aplicativo'}</span>
                            {tool.atalho && <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px]">/{tool.atalho}</span>}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{tool.resumo || tool.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 self-end sm:self-auto shrink-0">
                        <button type="button" className={botaoIcone} onClick={() => moveTool(index, -1)} disabled={index === 0} title="Subir">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button type="button" className={botaoIcone} onClick={() => moveTool(index, 1)} disabled={index === draftTools.length - 1} title="Descer">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button type="button" className={botaoIcone} onClick={() => toggleVisibility(index)} title={visivel ? 'Ocultar' : 'Mostrar'}>
                          {visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                        </button>
                        <button type="button" className={botaoIcone} onClick={() => duplicateTool(tool)} title="Duplicar">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button type="button" className={`${botaoIcone} text-blue-600`} onClick={() => startEditItem(tool)} title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" className={`${botaoIcone} hover:text-red-600 hover:bg-red-50`} onClick={() => deleteTool(index)} title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            /* EDIÇÃO */
            editingItem_ && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500">{isNewItem ? 'Novo item' : 'Editando'}</span>
                    <h3 className="text-lg font-bold text-slate-900 truncate">{editingItem_.nome || 'Sem nome'}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={cancelarEdicao} className={botaoLeve}>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={saveEditingItem}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg cursor-pointer"
                    >
                      Salvar item
                    </button>
                  </div>
                </div>

                {processandoImagem && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Preparando a imagem...
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                  <div className="space-y-5 min-w-0">
                    {/* Dados básicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className={rotulo}>Nome *</label>
                        <input
                          type="text"
                          maxLength={120}
                          value={editingItem_.nome}
                          onChange={(e) => setEditingItem({ ...editingItem_, nome: e.target.value })}
                          className={campo}
                        />
                      </div>
                      <div>
                        <label className={rotulo}>Tipo</label>
                        <select
                          value={editingItem_.tipo || 'aplicativo'}
                          onChange={(e) => setEditingItem({ ...editingItem_, tipo: e.target.value as 'aplicativo' | 'link' })}
                          className={campo}
                        >
                          <option value="aplicativo">Aplicativo (com janela de explicação)</option>
                          <option value="link">Link direto (abre no clique)</option>
                        </select>
                      </div>
                      <div>
                        <label className={rotulo}>Categoria</label>
                        <input
                          type="text"
                          list="categorias-uGabinete"
                          maxLength={60}
                          value={editingItem_.categoria}
                          onChange={(e) => setEditingItem({ ...editingItem_, categoria: e.target.value })}
                          className={campo}
                        />
                        <datalist id="categorias-uGabinete">
                          {existingCategories.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={rotulo}>Endereço (https://) *</label>
                        <input
                          type="url"
                          value={editingItem_.url}
                          onChange={(e) => setEditingItem({ ...editingItem_, url: e.target.value })}
                          className={campo}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={rotulo}>Resumo (uma frase no cartão)</label>
                        <input
                          type="text"
                          maxLength={200}
                          value={editingItem_.resumo}
                          onChange={(e) => setEditingItem({ ...editingItem_, resumo: e.target.value })}
                          className={campo}
                        />
                      </div>
                      <div>
                        <label className={rotulo}>Atalho (opcional)</label>
                        <div className="flex items-center">
                          <span className="px-2 py-2 text-sm text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">ugabinete.com.br/</span>
                          <input
                            type="text"
                            maxLength={40}
                            value={editingItem_.atalho || ''}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem_, atalho: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                            }
                            className={`${campo} rounded-l-none min-w-0`}
                            placeholder="mapa"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={rotulo}>Cor</label>
                        <select value={editingItem_.cor || 'azul'} onChange={(e) => setEditingItem({ ...editingItem_, cor: e.target.value })} className={campo}>
                          <option value="azul">Azul</option>
                          <option value="verde">Verde</option>
                          <option value="roxo">Roxo</option>
                          <option value="laranja">Laranja</option>
                          <option value="rosa">Rosa</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={editingItem_.exigeLogin}
                            onChange={(e) => setEditingItem({ ...editingItem_, exigeLogin: e.target.checked })}
                          />
                          Exige login próprio
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={editingItem_.visivel !== false}
                            onChange={(e) => setEditingItem({ ...editingItem_, visivel: e.target.checked })}
                          />
                          Visível no site
                        </label>
                        <p className="text-xs text-slate-500 pl-6">
                          Itens ocultos não aparecem no site, mas continuam no arquivo público ferramentas.json.
                        </p>
                      </div>
                    </div>

                    {/* Capa */}
                    <section className="p-4 border border-slate-200 rounded-xl space-y-2">
                      <span className={rotulo}>Capa (opcional)</span>
                      <p className="text-xs text-slate-500">
                        Imagem larga no alto do cartão, para achar o aplicativo mais rápido. É cortada em 16:9 e reduzida automaticamente.
                      </p>
                      {editingItem_.capa ? (
                        <div className="flex flex-wrap items-end gap-3">
                          <img src={srcDe(editingItem_.capa)} alt="Capa" className="w-48 max-w-full aspect-video object-cover rounded-lg border border-slate-200" />
                          <button
                            type="button"
                            className={`${botaoLeve} hover:text-red-700`}
                            onClick={() => {
                              descartarPendente(editingItem_.capa);
                              setEditingItem({ ...editingItem_, capa: undefined });
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remover capa
                          </button>
                        </div>
                      ) : (
                        <label className={`${botaoLeve} w-fit`}>
                          <ImagePlus className="w-4 h-4" />
                          Escolher capa
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={async (e) => {
                              const c = await novaImagem(e, 'capas', (f) => capaWebp(f, 640));
                              if (c) setEditingItem({ ...editingItem_, capa: c });
                            }}
                          />
                        </label>
                      )}
                    </section>

                    {/* Ícone ou foto */}
                    <section className="p-4 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={rotulo}>Ícone do cartão</span>
                        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs">
                          <button
                            type="button"
                            onClick={() => setIconMode('library')}
                            className={`px-3 py-1.5 rounded-md cursor-pointer ${iconMode === 'library' ? 'bg-white font-bold shadow-2xs' : 'text-slate-600'}`}
                          >
                            Biblioteca
                          </button>
                          <button
                            type="button"
                            onClick={() => setIconMode('upload')}
                            className={`px-3 py-1.5 rounded-md cursor-pointer ${iconMode === 'upload' ? 'bg-white font-bold shadow-2xs' : 'text-slate-600'}`}
                          >
                            Foto quadrada
                          </button>
                        </div>
                      </div>
                      {iconMode === 'library' ? (
                        <>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={iconSearch}
                              onChange={(e) => setIconSearch(e.target.value)}
                              placeholder="Buscar ícone..."
                              className={`${campo} pl-8`}
                            />
                          </div>
                          <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-44 overflow-y-auto">
                            {filteredIcons.map((opt) => {
                              const I = getToolIcon(opt.name);
                              const sel = editingItem_.icone === opt.name && !editingItem_.imagem;
                              return (
                                <button
                                  key={opt.name}
                                  type="button"
                                  title={opt.label}
                                  onClick={() => {
                                    descartarPendente(editingItem_.imagem);
                                    setEditingItem({ ...editingItem_, icone: opt.name, imagem: undefined });
                                  }}
                                  className={`aspect-square flex items-center justify-center rounded-lg border cursor-pointer ${sel ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                                >
                                  <I className="w-5 h-5" />
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : editingItem_.imagem ? (
                        <div className="flex items-center gap-3">
                          <img src={srcDe(editingItem_.imagem)} alt="Foto do ícone" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                          <button
                            type="button"
                            className={`${botaoLeve} hover:text-red-700`}
                            onClick={() => {
                              descartarPendente(editingItem_.imagem);
                              setEditingItem({ ...editingItem_, imagem: undefined });
                              setIconMode('library');
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Voltar ao ícone
                          </button>
                        </div>
                      ) : (
                        <label className={`${botaoLeve} w-fit`}>
                          <Upload className="w-4 h-4" />
                          Escolher foto (vira 256x256)
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={async (e) => {
                              const c = await novaImagem(e, 'icones', (f) => cropAndResizeToSquareWebp(f, 256));
                              if (c) setEditingItem({ ...editingItem_, imagem: c });
                            }}
                          />
                        </label>
                      )}
                    </section>

                    {editingItem_.tipo !== 'link' && (
                      <>
                        <div>
                          <label className={rotulo}>Para que serve</label>
                          <textarea
                            rows={4}
                            maxLength={2000}
                            value={editingItem_.descricao}
                            onChange={(e) => setEditingItem({ ...editingItem_, descricao: e.target.value })}
                            className={campo}
                          />
                        </div>

                        <section className="p-4 border border-slate-200 rounded-xl space-y-2">
                          <span className={rotulo}>Imagem de demonstração (opcional)</span>
                          {editingItem_.imagemDemo ? (
                            <div className="space-y-2">
                              <img src={srcDe(editingItem_.imagemDemo)} alt="Demonstração" className="block max-w-full max-h-48 w-auto rounded-lg border border-slate-200 object-contain" />
                              <button
                                type="button"
                                className={`${botaoLeve} hover:text-red-700`}
                                onClick={() => {
                                  descartarPendente(editingItem_.imagemDemo);
                                  setEditingItem({ ...editingItem_, imagemDemo: '' });
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remover
                              </button>
                            </div>
                          ) : (
                            <label className={`${botaoLeve} w-fit`}>
                              <Upload className="w-4 h-4" />
                              Escolher imagem
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  const c = await novaImagem(e, 'demos', (f) => resizeDemoImageWebp(f, 1200, 1200));
                                  if (c) setEditingItem({ ...editingItem_, imagemDemo: c });
                                }}
                              />
                            </label>
                          )}
                        </section>

                        <ListaEditavel
                          titulo="Recursos principais"
                          itens={editingItem_.destaques}
                          textoAdicionar="Adicionar recurso"
                          placeholder="Recurso"
                          onChange={(d) => setEditingItem({ ...editingItem_, destaques: d })}
                        />

                        <ListaEditavel
                          titulo="Como usar (passos)"
                          numerada
                          itens={editingItem_.comoUsar}
                          textoAdicionar="Adicionar passo"
                          placeholder="Passo"
                          onChange={(d) => setEditingItem({ ...editingItem_, comoUsar: d })}
                        />

                        {/* Tutorial */}
                        <section className="p-4 border border-slate-200 rounded-xl space-y-3">
                          <div>
                            <span className={rotulo}>Tutorial: vídeos do YouTube e imagens</span>
                            <p className="text-xs text-slate-500">
                              Aparece no fim da janela de explicação. Vídeos abrem no YouTube; imagens são reduzidas para no máximo 1200 px. Até {LIMITE_TUTORIAL} itens.
                            </p>
                          </div>

                          {tutorialAtual.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg">
                              {t.tipo === 'video' ? (
                                <PlayCircle className="w-10 h-10 text-red-600 shrink-0" />
                              ) : (
                                <img src={srcDe(t.url)} alt="" className="w-16 h-10 object-cover rounded border border-slate-200 shrink-0" />
                              )}
                              <div className="min-w-0 flex-1 space-y-1">
                                <input
                                  type="text"
                                  maxLength={200}
                                  value={t.legenda || ''}
                                  onChange={(e) => {
                                    const n = [...tutorialAtual];
                                    n[i] = { ...t, legenda: e.target.value };
                                    setTutorial(n);
                                  }}
                                  placeholder={t.tipo === 'video' ? 'Título do vídeo' : 'Legenda da imagem (opcional)'}
                                  className={`${campo} py-1.5`}
                                />
                                {t.tipo === 'video' && <p className="text-[11px] text-slate-400 truncate">{t.url}</p>}
                              </div>
                              <button type="button" className={botaoIcone} onClick={() => moverTutorial(i, -1)} disabled={i === 0} title="Subir">
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button type="button" className={botaoIcone} onClick={() => moverTutorial(i, 1)} disabled={i === tutorialAtual.length - 1} title="Descer">
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button type="button" className={`${botaoIcone} hover:text-red-600 hover:bg-red-50`} onClick={() => removerTutorial(i)} title="Remover">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {tutorialAtual.length < LIMITE_TUTORIAL && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs font-semibold text-slate-700">Vídeo do YouTube</span>
                                <input
                                  type="url"
                                  value={novoVideo}
                                  onChange={(e) => {
                                    setNovoVideo(e.target.value);
                                    setErroVideo(null);
                                  }}
                                  placeholder="https://youtu.be/..."
                                  className={`${campo} py-1.5`}
                                />
                                <input
                                  type="text"
                                  maxLength={200}
                                  value={novoVideoLegenda}
                                  onChange={(e) => setNovoVideoLegenda(e.target.value)}
                                  placeholder="Título (opcional)"
                                  className={`${campo} py-1.5`}
                                />
                                {erroVideo && <p className="text-xs text-red-700">{erroVideo}</p>}
                                <button type="button" className={botaoLeve} onClick={adicionarVideo} disabled={!novoVideo.trim()}>
                                  <PlayCircle className="w-4 h-4 text-red-600" />
                                  Adicionar vídeo
                                </button>
                              </div>
                              <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs font-semibold text-slate-700">Imagem</span>
                                <p className="text-xs text-slate-500">Captura de tela ou foto de um passo.</p>
                                <label className={`${botaoLeve} w-fit`}>
                                  <ImagePlus className="w-4 h-4" />
                                  Adicionar imagem
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={async (e) => {
                                      const c = await novaImagem(e, 'tutorial', (f) => resizeDemoImageWebp(f, 1200, 1200));
                                      if (c) setTutorial([...tutorialAtual, { tipo: 'imagem', url: c }]);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </section>
                      </>
                    )}
                  </div>

                  {/* Prévia */}
                  <aside className="space-y-2 lg:sticky lg:top-0 self-start">
                    <span className={rotulo}>Prévia do cartão</span>
                    <Previa item={editingItem_} />
                    <p className="text-xs text-slate-500 break-words">
                      Link direto: <code>#{isNewItem ? gerarId(editingItem_.nome) : originalId}</code>
                      {editingItem_.atalho && (
                        <>
                          <br />
                          Atalho: <code>ugabinete.com.br/{editingItem_.atalho}</code>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">"Salvar item" guarda no rascunho. Só vai para o site quando você clicar em "Publicar alterações".</p>
                  </aside>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={cancelarEdicao} className={botaoLeve}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveEditingItem}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg cursor-pointer"
                  >
                    Salvar item
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Janela do token do GitHub, pedida só na hora de publicar */}
      {showTokenPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-slate-950/50" role="dialog" aria-modal="true" aria-labelledby="token-title">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <h4 id="token-title" className="font-bold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Token do GitHub para publicar
              </h4>
              <button type="button" onClick={() => setShowTokenPrompt(false)} className={botaoIcone} aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600">Suas edições já estão guardadas no rascunho. O token só é usado para gravar no repositório {GITHUB_REPO}.</p>
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="github_pat_..."
                autoComplete="off"
                autoFocus
                className={`${campo} font-mono`}
              />
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" checked={rememberToken} onChange={(e) => setRememberToken(e.target.checked)} />
                Lembrar neste aparelho
              </label>
              {tokenInput.trim().startsWith('ghp_') && (
                <label className="flex items-start gap-2 text-xs text-amber-800 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-0.5" checked={aceitarClassico} onChange={(e) => setAceitarClassico(e.target.checked)} />
                  Entendo que o token clássico vale para todos os meus repositórios e quero usar mesmo assim.
                </label>
              )}
              {tokenPromptError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">{tokenPromptError}</div>
              )}
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
                <strong className="block text-slate-700 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Como gerar
                </strong>
                <p>1. GitHub: foto do perfil, Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.</p>
                <p>2. Repository access: Only select repositories, escolha {GITHUB_REPO}.</p>
                <p>3. Permissions: Contents em Read and write.</p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTokenPrompt(false)} className={botaoLeve}>
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg cursor-pointer">
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
