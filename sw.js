// A unique name for the cache
const CACHE_NAME = 'dots-calculator-cache-v1';

// List of assets to cache on installation
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './utils/date.ts',
  './utils/csv.ts',
  './hooks/useCalculations.ts',
  './components/FileUpload.tsx',
  './components/PatientView.tsx',
  './components/ThemeSwitcher.tsx',
  './components/DataTable.tsx',
  './components/DatePicker.tsx',
  './components/HelpModal.tsx',
  './components/OnboardingGuide.tsx',
  './components/DownloadButton.tsx',
  './components/PointInTimeCalculator.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/paparse.min.js',
  'https://cdn.jsdelivr.net/npm/jalali-moment/dist/jalali-moment.browser.js',
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react@^19.2.0/jsx-runtime',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
];

// Install event: opens the cache and adds the assets to it
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching initial assets');
        return cache.addAll(urlsToCache).catch(error => {
            console.error('Failed to cache one or more initial resources:', error);
            // This is not fatal. The app will still work, but first offline load might be incomplete.
        });
      })
  );
});

// Fetch event: serves assets from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the asset is in the cache, return it
        if (response) {
          return response;
        }

        // If the asset is not in the cache, fetch it from the network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = networkResponse.clone();

            // Open the cache and add the new asset to it
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            // You could return a custom offline page here if you had one.
            // For now, we'll just let the browser's default error page show.
            throw error;
        });
      })
    );
});

// Activate event: cleans up old caches
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