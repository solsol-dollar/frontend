import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, deleteToken, onMessage } from 'firebase/messaging'
import { serviceApi } from './axios'

const FCM_SW_MIGRATION_KEY = 'fcm_sw_v3'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const isFCMSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

export const messaging = isFCMSupported ? getMessaging(app) : null

export async function registerPushToken(): Promise<void> {
  if (!messaging) return
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return
  if (Notification.permission === 'denied') return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  try {
    const swReg = await navigator.serviceWorker.ready
    if (!localStorage.getItem(FCM_SW_MIGRATION_KEY)) {
      try {
        await deleteToken(messaging)
        localStorage.setItem(FCM_SW_MIGRATION_KEY, '1')
      } catch {
      }
    }
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    })
    if (!token) return
    await serviceApi.post('/api/service/api/v1/mypage/push-subscriptions', { fcmToken: token })
    console.info('[FCM] 토큰 등록 성공:', token)
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
