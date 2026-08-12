/* eslint-disable no-undef */
// Background push handler for Loop. Config is passed via the registration
// URL's query string (see src/lib/push.ts) so this static file needs no build step.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

const params = new URLSearchParams(self.location.search)
// Derive the app's base path (e.g. "/loop/") from where this file itself is
// served, so icon URLs still resolve correctly on GitHub Pages subpaths.
const BASE = self.location.pathname.replace(/firebase-messaging-sw\.js$/, '')

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Loop nhắc bạn 👋'
  const body = payload.notification?.body || 'Đừng quên ghi lại chi tiêu hôm nay nhé!'
  self.registration.showNotification(title, {
    body,
    icon: `${BASE}icons/icon-192.png`,
    badge: `${BASE}icons/icon-96.png`,
    tag: 'loop-daily-reminder',
  })
})
