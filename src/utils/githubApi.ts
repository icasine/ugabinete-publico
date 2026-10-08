/**
 * Cliente da API REST do GitHub para publicação direta no repositório
 * icasine/ugabinete-publico (branch main).
 */

export const GITHUB_OWNER = 'icasine';
export const GITHUB_REPO = 'ugabinete-publico';
export const GITHUB_BRANCH = 'main';

const API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
const STORAGE_KEY_TOKEN = 'ugabinete_gh_token';
const STORAGE_KEY_MODE = 'ugabinete_gh_token_mode'; // 'local' | 'session'

function lerArmazenado(chave: string): string | null {
  try {
    return localStorage.getItem(chave) || sessionStorage.getItem(chave) || null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return lerArmazenado(STORAGE_KEY_TOKEN);
}

export function saveToken(token: string, rememberOnDevice: boolean): void {
  const clean = token.trim();
  try {
    if (rememberOnDevice) {
      localStorage.setItem(STORAGE_KEY_TOKEN, clean);
      localStorage.setItem(STORAGE_KEY_MODE, 'local');
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    } else {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, clean);
      sessionStorage.setItem(STORAGE_KEY_MODE, 'session');
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  } catch {
    /* navegador sem armazenamento: o token vale só enquanto a página estiver aberta */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_MODE);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_MODE);
  } catch {
    /* nada a limpar */
  }
}

export function isRememberedOnDevice(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_MODE) === 'local';
  } catch {
    return false;
  }
}

/** Converte texto UTF-8 em Base64 com segurança para acentos e caracteres especiais */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Erro do GitHub com o código HTTP, para o painel saber quando pedir outro token. */
export class ErroGitHub extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

async function tratarErro(res: Response, acao: string): Promise<never> {
  let detalhe = '';
  try {
    const json = await res.json();
    detalhe = json.message || '';
  } catch {
    /* sem corpo json */
  }
  if (res.status === 401) {
    throw new ErroGitHub(401, 'Token inválido ou vencido. Gere outro token no GitHub.');
  }
  if (res.status === 403) {
    throw new ErroGitHub(
      403,
      `Sem permissão para ${acao}. O token precisa da permissão "Contents: Read and write" no repositório ${GITHUB_OWNER}/${GITHUB_REPO}.${detalhe ? ` (${detalhe})` : ''}`
    );
  }
  if (res.status === 404) {
    throw new ErroGitHub(404, `Repositório ${GITHUB_OWNER}/${GITHUB_REPO} não encontrado ou o token não tem acesso a ele.`);
  }
  if (res.status === 409 || res.status === 422) {
    throw new ErroGitHub(
      res.status,
      `Outra alteração foi publicada enquanto você gravava. Clique em "Tentar de novo".${detalhe ? ` (${detalhe})` : ''}`
    );
  }
  throw new ErroGitHub(res.status, `Erro no GitHub (${res.status}) ao ${acao}: ${detalhe || res.statusText}`);
}

async function chamar(token: string, caminho: string, acao: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init && init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!res.ok) await tratarErro(res, acao);
  return res.json();
}

export interface ArquivoParaGravar {
  /** Caminho no repositório, ex.: public/ferramentas.json */
  path: string;
  base64: string;
}

export interface ProgressoPublicacao {
  etapa: string;
  atual: number;
  total: number;
}

/**
 * Publica tudo em UM único commit (API Git Data):
 * envia os arquivos, apaga os que não são mais usados e só então move a branch.
 * Se algo falhar no meio, o site continua exatamente como estava.
 */
export async function publicarEmUmCommit(
  token: string,
  arquivos: ArquivoParaGravar[],
  apagar: string[],
  mensagem: string,
  aoAvancar: (p: ProgressoPublicacao) => void
): Promise<string> {
  const total = arquivos.length + 3;
  let passo = 0;
  const avancar = (etapa: string) => aoAvancar({ etapa, atual: ++passo, total });

  avancar('Lendo a versão atual do repositório');
  const ref = await chamar(token, `/git/ref/heads/${GITHUB_BRANCH}`, 'ler a branch');
  const commitAtual: string = ref.object.sha;
  const commit = await chamar(token, `/git/commits/${commitAtual}`, 'ler o último commit');
  const arvoreBase: string = commit.tree.sha;

  // Só apaga o que existe de verdade (apagar caminho inexistente faz o GitHub recusar o commit)
  let existentes = new Set<string>();
  if (apagar.length > 0) {
    const arvore = await chamar(token, `/git/trees/${arvoreBase}?recursive=1`, 'listar os arquivos');
    existentes = new Set((arvore.tree || []).map((t: { path: string }) => t.path));
  }

  const itens: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string | null }> = [];
  for (const arq of arquivos) {
    avancar(`Enviando ${arq.path}`);
    const blob = await chamar(token, '/git/blobs', `enviar ${arq.path}`, {
      method: 'POST',
      body: JSON.stringify({ content: arq.base64, encoding: 'base64' }),
    });
    itens.push({ path: arq.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const caminhosGravados = new Set(arquivos.map((a) => a.path));
  for (const caminho of apagar) {
    if (existentes.has(caminho) && !caminhosGravados.has(caminho)) {
      itens.push({ path: caminho, mode: '100644', type: 'blob', sha: null });
    }
  }

  avancar('Montando a nova versão');
  const novaArvore = await chamar(token, '/git/trees', 'montar a nova versão', {
    method: 'POST',
    body: JSON.stringify({ base_tree: arvoreBase, tree: itens }),
  });
  const novoCommit = await chamar(token, '/git/commits', 'criar o commit', {
    method: 'POST',
    body: JSON.stringify({ message: mensagem, tree: novaArvore.sha, parents: [commitAtual] }),
  });

  avancar('Publicando');
  await chamar(token, `/git/refs/heads/${GITHUB_BRANCH}`, 'publicar', {
    method: 'PATCH',
    body: JSON.stringify({ sha: novoCommit.sha, force: false }),
  });
  return novoCommit.sha as string;
}
