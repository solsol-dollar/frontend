import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { messaging, onMessage, registerPushToken } from '@/lib/firebase'

export function usePushNotification() {
  const qc = useQueryClient()

  useEffect(() => {
    registerPushToken()

    const unsubscribe = onMessage(messaging, (payload) => {
      console.info('[FCM] 포그라운드 메시지:', payload)

      const title = payload.notification?.title ?? '알림'
      const body = payload.notification?.body

      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icons/icon-192.png' })
      }

      qc.invalidateQueries({ queryKey: ['mypage', 'notifications'] })
    })

    return unsubscribe
  }, [qc])
}
