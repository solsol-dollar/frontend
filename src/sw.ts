/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

registerRoute(
  ({ url }) => /\/api\/ipos/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'ipo-cache',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 })],
  })
)

registerRoute(
  ({ url }) => /\/api\/(subscriptions|accounts)/.test(url.pathname),
  new NetworkFirst({ cacheName: 'ledger-cache' })
)

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const messaging = getMessaging(app)

function toSafePath(url: unknown): string {
  return typeof url === 'string' && /^\/(?!\/)/.test(url) ? url : '/home'
}

onBackgroundMessage(messaging, (payload) => {
  const { title, body } = payload.notification ?? {}
  const url = toSafePath(payload.data?.url)
  return Promise.all([
    self.registration.showNotification(title ?? 'SOL SOL 달러', {
      body,
      icon: '/icons/icon-192.png',
      data: { url },
    }),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type: 'NOTIFICATION_RECEIVED' }))
    }),
  ])
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = toSafePath(event.notification.data?.url)
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = clients.find((c) => 'navigate' in c)
      if (target) {
        return (target as WindowClient).focus().then((client) => client.navigate(url))
      }
      return self.clients.openWindow(url)
    })
  )
})
