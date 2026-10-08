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
}

/* ------------------------------------------------------------------
 * Validação do public/ferramentas.json
 * O arquivo é editado à mão no GitHub. Estas funções garantem que um
 * erro de digitação ou um link perigoso não quebre o site nem abra
 * brecha de segurança: itens inválidos são ignorados (com aviso no
 * console) e o resto do catálogo continua funcionando.
 * ------------------------------------------------------------------ */

const LIMITE_TEXTO_CURTO = 120;
const LIMITE_TEXTO_LONGO = 2000;
const LIMITE_ITENS_LISTA = 20;

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

/** Imagem de demonstração: caminho local (/demos/...) ou link https://. */
function imagemSegura(valor: unknown): string {
  if (typeof valor !== 'string' || valor.trim() === '') return '';
  const v = valor.trim();
  if (/^\/demos\/[\w\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(v) && !v.includes('..')) return v;
  try {
    const url = new URL(v);
    if (url.protocol === 'https:') return url.href;
  } catch {
    /* link inválido */
  }
  return '';
}

/** id usado no link #id: só letras minúsculas, números e hífen. */
function idSeguro(valor: unknown): string {
  if (typeof valor !== 'string') return '';
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
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
    });
  });

  return resultado;
}
