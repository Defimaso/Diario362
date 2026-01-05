// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'Check-in Giornaliero',
    body: 'Non dimenticare di compilare il tuo check-in oggi!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: { url: '/diario' }
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/diario' },
    actions: [
      { action: 'open', title: 'Apri App' },
      { action: 'close', title: 'Chiudi' }
    ],
    requireInteraction: true,
    tag: 'daily-checkin'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/diario';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed');
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('[SW] Activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('install', function(event) {
  console.log('[SW] Installing...');
  self.skipWaiting();
});
