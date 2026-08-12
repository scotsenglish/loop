/* eslint-disable no-undef */
// Background push handler for Loop. Config is passed via the registration
// URL's query string (see src/lib/push.ts) so this static file needs no build step.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

const params = new URLSearchParams(self.location.search)

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
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'loop-daily-reminder',
  })
})
