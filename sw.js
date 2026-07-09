// ================================================================
// SERVICE WORKER — POLARCSX
// Esto es lo que le faltaba a la PWA para que el aviso de instalar
// aparezca de forma consistente en Android/Chrome (no solo la
// primera vez). Sin un service worker registrado, la mayoría de
// navegadores simplemente no ofrecen instalar la app.
//
// Estrategia: "network first, cache fallback" — el usuario siempre
// ve la versión más reciente si hay internet, y si no hay señal,
// ve la última versión guardada en vez de una pantalla en blanco.
// ================================================================

const CACHE_NAME = 'polarcsx-cache-v1';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
];

// Al instalar: guarda lo esencial para que la app abra aunque no haya internet
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

// Al activar: borra versiones de caché viejas (cuando subas cambios nuevos)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Al pedir cualquier recurso: intenta internet primero, si falla usa el caché
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
