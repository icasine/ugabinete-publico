/**
 * Service Worker do uGabinete
 * Versão do Cache: ugabinete-v1
 *
 * Estratégia de cache:
 * 1. ferramentas.json e páginas HTML (navegação): NETWORK-FIRST (sempre tenta buscar dados novos online; se sem internet, usa cache).
 * 2. Recursos estáticos (scripts, estilos, ícones, imagens): CACHE-FIRST (usa cache para agilidade e economia de dados).
 */

const CACHE_NAME = 'ugabinete-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/ferramentas.json'
];

// Instalação do Service Worker e pré-cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de versões antigas do cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Apenas intercepta requisições HTTP GET locais
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Não intercepta requisições de outras origens ou de extensões
  if (url.origin !== self.location.origin) return;

  // Regra A: ferramentas.json e navegação de páginas -> Rede primeiro (Network-First)
  const isDataOrPage =
    url.pathname.endsWith('ferramentas.json') ||
    request.mode === 'navigate' ||
    url.pathname === '/';

  if (isDataOrPage) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Em caso de falha de conexão, recorre ao cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Sem conexão com a internet', { status: 503 });
          });
        })
    );
    return;
  }

  // Regra B: Arquivos estáticos (JS, CSS, Imagens, Fontes) -> Cache primeiro (Cache-First)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
