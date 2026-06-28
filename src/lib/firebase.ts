import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { serviceApi } from './axios'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export const messaging = getMessaging(app)

export async function registerPushToken(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return
  if (Notification.permission === 'denied') return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  try {
    const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: sw,
    })
    if (!token) return
    await serviceApi.post('/api/service/api/v1/mypage/push-subscriptions', { fcmToken: token })
  } catch (err) {
    console.warn('[FCM] 토큰 등록 실패:', err)
  }
}

export async function unregisterPushToken(): Promise<void> {
  try {
    await serviceApi.delete('/api/service/api/v1/mypage/push-subscriptions')
  } catch (err) {
    console.warn('[FCM] 토큰 해제 실패:', err)
  }
}

export { onMessage }
