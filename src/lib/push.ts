import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { app, VAPID_KEY } from '@/lib/firebase'

const FIREBASE_CFG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  const params = new URLSearchParams(FIREBASE_CFG).toString()
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`, {
    scope: '/firebase-push/',
  })
}

/** Requests notification permission and returns an FCM registration token, or
 *  null if push isn't supported/permitted. Call this from a user gesture
 *  (e.g. toggling a switch in Settings) — browsers require that for the
 *  permission prompt. Requires VITE_FIREBASE_VAPID_KEY to be set. */
export async function enablePush(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('VITE_FIREBASE_VAPID_KEY chưa được cấu hình — bỏ qua push notification.')
    return null
  }
  const supported = await isSupported().catch(() => false)
  if (!supported) return null

  const reg = await registerPushServiceWorker()
  if (!reg) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const messaging = getMessaging(app)
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })
    return token || null
  } catch (err) {
    console.error('Không lấy được FCM token:', err)
    return null
  }
}

/** Listens for push messages that arrive while the app is in the foreground. */
export async function listenForegroundPush(onMsg: (title: string, body: string) => void) {
  const supported = await isSupported().catch(() => false)
  if (!supported) return () => {}
  const messaging = getMessaging(app)
  return onMessage(messaging, (payload) => {
    onMsg(payload.notification?.title ?? 'Loop', payload.notification?.body ?? '')
  })
}
