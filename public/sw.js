/**
 * Service Worker do uGabinete
 *
 * IMPORTANTE: ao mudar este arquivo, aumente o número da versão abaixo.
 * Isso apaga o cache antigo nos aparelhos de quem já instalou o site.
 *
 * Estratégia:
 * 1. Páginas e ferramentas.json: REDE PRIMEIRO (sempre busca a versão nova;
 *    sem internet, usa a última cópia salva).
 * 2. Arquivos de /assets/ (JS e CSS com nome único gerado pelo Vite):
 *    CACHE PRIMEIRO (nunca mudam de conteúdo).
 * 3. Demais arquivos locais (ícone, manifest, imagens): usa o cache e
 *    atualiza em segundo plano.
 * Links de outros sites (as próprias ferramentas, fontes) nunca são
 * interceptados.
 */
const VERSAO = 'v2';
const CACHE_NAME = `ugabinete-${VERSAO}`;
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon.svg', '/ferramentas.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('ugabinete-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Só guarda respostas completas e do próprio site. */
function podeGuardar(resposta) {
  return resposta && resposta.ok && resposta.status === 200 && resposta.type === 'basic';
}

async function guardar(chave, resposta) {
  if (!podeGuardar(resposta)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(chave, resposta.clone());
}

async function redePrimeiro(request, chave) {
  try {
    const resposta = await fetch(request);
    await guardar(chave, resposta);
    return resposta;
  } catch {
    const salva = await caches.match(chave);
    if (salva) return salva;
    if (request.mode === 'navigate') {
      const pagina = await caches.match('/index.html');
      if (pagina) return pagina;
    }
    return new Response('Sem conexão com a internet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function cachePrimeiro(request) {
  const salva = await caches.match(request);
  if (salva) return salva;
  const resposta = await fetch(request);
  await guardar(request, resposta);
  return resposta;
}

async function cacheEAtualiza(request) {
  const salva = await caches.match(request);
  const daRede = fetch(request)
    .then(async (resposta) => {
      await guardar(request, resposta);
      return resposta;
    })
    .catch(() => salva);
  return salva || daRede;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ferramentas.json: uma única chave, sem parâmetros (evita acumular cópias)
  if (url.pathname === '/ferramentas.json') {
    event.respondWith(redePrimeiro(request, '/ferramentas.json'));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(redePrimeiro(request, '/index.html'));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cachePrimeiro(request));
    return;
  }

  event.respondWith(cacheEAtualiza(request));
});
