/** Um item do tutorial: vídeo do YouTube ou imagem enviada pelo painel. */
export interface ItemTutorial {
  tipo: 'video' | 'imagem';
  /** Vídeo: endereço do YouTube já normalizado. Imagem: caminho local (/tutorial/...). */
  url: string;
  legenda?: string;
}

export interface Ferramenta {
  id: string;
  nome: string;
  resumo: string;
  descricao: string;
  categoria: string;
  url: string;
  exigeLogin: boolean;
  destaques: string[];
  comoUsar: string[];
  imagemDemo: string;
  icone?: string;
  cor?: 'azul' | 'verde' | 'roxo' | 'laranja' | 'rosa' | string;
  imagem?: string;
  /** Capa do aplicativo (16:9), mostrada no alto do cartão para facilitar a escolha. */
  capa?: string;
  /** Vídeos do YouTube e imagens que explicam como usar. */
  tutorial?: ItemTutorial[];
  visivel?: boolean;
  tipo?: 'aplicativo' | 'link';
  atalho?: string;
}

/* ------------------------------------------------------------------
 * Validação do public/ferramentas.json
 * O arquivo é editado no painel ou à mão no GitHub. Estas funções garantem
 * que um erro de digitação ou um link perigoso não quebre o site:
 * itens inválidos são ignorados e o resto do catálogo continua funcionando.
 * ------------------------------------------------------------------ */

const LIMITE_TEXTO_CURTO = 120;
const LIMITE_TEXTO_LONGO = 2000;
const LIMITE_ITENS_LISTA = 20;
const LIMITE_ITENS_TUTORIAL = 12;

function texto(valor: unknown, limite: number): string {
  if (typeof valor !== 'string') return '';
  return valor.trim().slice(0, limite);
}

function lista(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    .slice(0, LIMITE_ITENS_LISTA)
    .map((item) => item.trim().slice(0, 500));
}

/** Aceita somente links https:// (ou http:// em último caso). Bloqueia javascript:, data: etc. */
export function linkSeguro(valor: unknown): string {
  if (typeof valor !== 'string' || valor.trim() === '') return '';
  try {
    const url = new URL(valor.trim());
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    /* link inválido */
  }
  return '';
}

/**
 * Imagem (ícone, capa, demonstração ou tutorial): só caminhos locais do próprio site.
 * Imagens de outros sites são bloqueadas pela política de segurança (_headers) e não apareceriam.
 */
export function imagemSegura(valor: unknown): string {
  if (typeof valor !== 'string' || valor.trim() === '') return '';
  const v = valor.trim();
  if (/^\/(demos|icones|capas|tutorial)\/[\w\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(v) && !v.includes('..')) {
    return v;
  }
  return '';
}

/** Extrai o código de 11 caracteres de um link do YouTube (watch, youtu.be, shorts, embed, live). */
export function idYoutube(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  const v = valor.trim();
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v);
    const host = url.hostname.replace(/^www\.|^m\./, '');
    let id = '';
    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] || '';
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
      id = url.searchParams.get('v') || '';
      if (!id) {
        const partes = url.pathname.split('/').filter(Boolean);
        if (['shorts', 'embed', 'live', 'v'].includes(partes[0])) id = partes[1] || '';
      }
    }
    return /^[\w-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

export function linkYoutube(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

function tutorialSeguro(valor: unknown): ItemTutorial[] {
  if (!Array.isArray(valor)) return [];
  const saida: ItemTutorial[] = [];
  for (const bruto of valor) {
    if (!bruto || typeof bruto !== 'object') continue;
    const item = bruto as Record<string, unknown>;
    const legenda = texto(item.legenda, 200) || undefined;
    if (item.tipo === 'video') {
      const id = idYoutube(item.url);
      if (id) saida.push({ tipo: 'video', url: linkYoutube(id), legenda });
    } else if (item.tipo === 'imagem') {
      const src = imagemSegura(item.url);
      if (src) saida.push({ tipo: 'imagem', url: src, legenda });
    }
    if (saida.length >= LIMITE_ITENS_TUTORIAL) break;
  }
  return saida;
}

/** id usado no link #id: só letras minúsculas, números e hífen. */
export function idSeguro(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Gera id a partir de um nome */
export function gerarId(nome: string): string {
  const base = idSeguro(nome);
  return base || 'item';
}

export function normalizarFerramentas(dados: unknown): Ferramenta[] {
  if (!Array.isArray(dados)) {
    throw new Error('O arquivo ferramentas.json precisa ser uma lista [ ... ].');
  }

  const vistos = new Set<string>();
  const resultado: Ferramenta[] = [];

  dados.forEach((item, posicao) => {
    if (!item || typeof item !== 'object') {
      console.warn(`ferramentas.json: item ${posicao + 1} ignorado (não é um objeto).`);
      return;
    }
    const bruto = item as Record<string, unknown>;
    const id = idSeguro(bruto.id);
    const nome = texto(bruto.nome, LIMITE_TEXTO_CURTO);
    const url = linkSeguro(bruto.url);

    if (!id || !nome || !url) {
      console.warn(
        `ferramentas.json: item ${posicao + 1} ignorado (faltou id, nome ou um link https:// válido).`
      );
      return;
    }
    if (vistos.has(id)) {
      console.warn(`ferramentas.json: id repetido "${id}" ignorado no item ${posicao + 1}.`);
      return;
    }
    vistos.add(id);

    const tipoBruto = texto(bruto.tipo, 20).toLowerCase();
    const tipo = tipoBruto === 'link' ? 'link' : 'aplicativo';
    const atalhoBruto = idSeguro(bruto.atalho);
    const tutorial = tutorialSeguro(bruto.tutorial);

    resultado.push({
      id,
      nome,
      resumo: texto(bruto.resumo, 200),
      descricao: texto(bruto.descricao, LIMITE_TEXTO_LONGO),
      categoria: texto(bruto.categoria, 60) || 'Outras',
      url,
      exigeLogin: bruto.exigeLogin === true,
      destaques: lista(bruto.destaques),
      comoUsar: lista(bruto.comoUsar),
      imagemDemo: imagemSegura(bruto.imagemDemo),
      icone: texto(bruto.icone, 40) || undefined,
      cor: texto(bruto.cor, 20) || undefined,
      imagem: imagemSegura(bruto.imagem) || undefined,
      capa: imagemSegura(bruto.capa) || undefined,
      tutorial: tutorial.length > 0 ? tutorial : undefined,
      visivel: bruto.visivel !== false,
      tipo,
      atalho: atalhoBruto || undefined,
    });
  });

  return resultado;
}
