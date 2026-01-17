
// sw.js - Service Worker for PWA Functionality

const CACHE_NAME = 'cr-kitchen-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  
  // Core App Logic
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/utils/helpers.ts',
  '/storage.ts',

  // Components
  '/components/BrandingModal.tsx',
  '/components/CatalogModal.tsx',
  '/components/ChangePasswordModal.tsx',
  '/components/ClientManager.tsx',
  '/components/Dashboard.tsx',
  '/components/DatabaseManager.tsx',
  '/components/DeleteQuoteModal.tsx',
  '/components/ImageCropperModal.tsx',
  '/components/Login.tsx',
  '/components/PDFRenderer.tsx',
  '/components/PDFSettingsModal.tsx',
  '/components/PreviewModal.tsx',
  '/components/ServerSettingsModal.tsx',
  '/components/StepNavigator.tsx',
  '/components/TemplateModal.tsx',
  '/components/UserManager.tsx',
  '/components/VersionHistoryModal.tsx',
  '/components/steps/Step1General.tsx',
  '/components/steps/Step2Gallery.tsx',
  '/components/steps/Step3Budget.tsx',
  '/components/steps/Step4Terms.tsx',

  // External Dependencies (CDNs)
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js'
];

// Evento de Instalación: Se cachean los assets principales de la app.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento Fetch: Intercepta las peticiones de red.
// Estrategia: Network First, then Cache. Prioriza contenido fresco.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Si la red falla, intenta servir desde la caché.
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // Opcional: devolver una página offline por defecto si no está en caché.
      });
    })
  );
});

// Evento de Activación: Limpia cachés antiguas si es necesario.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
