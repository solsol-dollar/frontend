import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { messaging, onMessage, registerPushToken } from '@/lib/firebase'

function toSafePath(url: unknown): string {
  return typeof url === 'string' && /^\/(?!\/)/.test(url) ? url : '/home'
}

export function usePushNotification() {
  const qc = useQueryClient()

  useEffect(() => {
    registerPushToken()

    const unsubscribe = onMessage(messaging, (payload) => {
      console.info('[FCM] 포그라운드 메시지:', payload)

      const title = payload.notification?.title ?? '알림'
      const body = payload.notification?.body

      if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((sw) => {
          sw.showNotification(title, { body, icon: '/icons/appLogo.png', data: { url: toSafePath(payload.data?.url) } })
        })
      }

      qc.invalidateQueries({ queryKey: ['mypage', 'notifications'] })
    })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        qc.invalidateQueries({ queryKey: ['mypage', 'notifications'] })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_RECEIVED') {
        qc.invalidateQueries({ queryKey: ['mypage', 'notifications'] })
      }
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage)
    }

    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage)
      }
    }
  }, [qc])
}
