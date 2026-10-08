import { URL_ACESSO } from '../config';

const STORAGE_SESSION_KEY = 'ugabinete_auth_sessao';
const STORAGE_USER_KEY = 'ugabinete_auth_usuario';
const STORAGE_EXPIRES_KEY = 'ugabinete_auth_expira';
const STORAGE_MODE_KEY = 'ugabinete_auth_mode'; // 'local' | 'session'

export interface SessionData {
  sessao: string;
  usuarioNome: string;
  expiraEm: number;
}

export function isConfiguredUrl(): boolean {
  return typeof URL_ACESSO === 'string' && URL_ACESSO.trim() !== '' && URL_ACESSO !== 'COLE_AQUI';
}

/** Obtém a sessão salva (se ainda estiver dentro do prazo de validade) */
export function getStoredSession(): SessionData | null {
  const mode = localStorage.getItem(STORAGE_MODE_KEY);
  const storage = mode === 'local' ? localStorage : sessionStorage;

  const sessao = storage.getItem(STORAGE_SESSION_KEY);
  const usuarioNome = storage.getItem(STORAGE_USER_KEY) || 'Administrador';
  const expiraStr = storage.getItem(STORAGE_EXPIRES_KEY);

  if (!sessao || !expiraStr) return null;

  const expiraEm = parseInt(expiraStr, 10);
  if (isNaN(expiraEm) || Date.now() > expiraEm) {
    clearStoredSession();
    return null;
  }

  return { sessao, usuarioNome, expiraEm };
}

export function saveStoredSession(
  sessao: string,
  usuarioNome: string,
  validadeHoras: number = 24,
  lembrar: boolean = false
): void {
  const expiraEm = Date.now() + Math.max(1, validadeHoras) * 60 * 60 * 1000;
  const storage = lembrar ? localStorage : sessionStorage;
  const otherStorage = lembrar ? sessionStorage : localStorage;

  // Limpa o outro armazenamento para evitar duplicidade
  otherStorage.removeItem(STORAGE_SESSION_KEY);
  otherStorage.removeItem(STORAGE_USER_KEY);
  otherStorage.removeItem(STORAGE_EXPIRES_KEY);

  localStorage.setItem(STORAGE_MODE_KEY, lembrar ? 'local' : 'session');
  storage.setItem(STORAGE_SESSION_KEY, sessao);
  storage.setItem(STORAGE_USER_KEY, usuarioNome);
  storage.setItem(STORAGE_EXPIRES_KEY, expiraEm.toString());
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem(STORAGE_EXPIRES_KEY);
  localStorage.removeItem(STORAGE_MODE_KEY);

  sessionStorage.removeItem(STORAGE_SESSION_KEY);
  sessionStorage.removeItem(STORAGE_USER_KEY);
  sessionStorage.removeItem(STORAGE_EXPIRES_KEY);
}

/** Envia requisição POST para o Google Apps Script sem gerar CORS preflight */
async function postAppsScript(dados: Record<string, unknown>): Promise<any> {
  if (!isConfiguredUrl()) {
    throw new Error(
      'A constante URL_ACESSO em src/config.ts ainda está como "COLE_AQUI". Configure a URL do Google Apps Script antes de entrar.'
    );
  }

  const res = await fetch(URL_ACESSO, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    throw new Error(`Erro no servidor de autenticação (HTTP ${res.status}).`);
  }

  return res.json();
}

/** Realiza login com usuário e senha */
export async function login(
  usuario: string,
  senha: string,
  lembrar: boolean
): Promise<SessionData> {
  const data = await postAppsScript({
    acao: 'entrar',
    usuario: usuario.trim(),
    senha,
  });

  if (!data || data.ok !== true) {
    throw new Error(data?.erro || 'Usuário ou senha incorretos.');
  }

  const sessao = data.sessao;
  const usuarioNome = data.usuario?.nome || usuario;
  const validadeHoras = Number(data.validadeHoras) || 24;

  saveStoredSession(sessao, usuarioNome, validadeHoras, lembrar);

  return {
    sessao,
    usuarioNome,
    expiraEm: Date.now() + validadeHoras * 3600 * 1000,
  };
}

/** Valida a sessão atual com { acao: 'eu', sessao } */
export async function validateSession(sessao: string): Promise<boolean> {
  try {
    const data = await postAppsScript({
      acao: 'eu',
      sessao,
    });
    return data && data.ok === true;
  } catch {
    return false;
  }
}

/** Realiza logout no servidor e limpa a sessão local */
export async function logout(sessao?: string): Promise<void> {
  if (sessao && isConfiguredUrl()) {
    try {
      await postAppsScript({
        acao: 'sair',
        sessao,
      });
    } catch {
      // Ignora falhas de rede no logout
    }
  }
  clearStoredSession();
}
