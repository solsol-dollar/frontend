import { useEffect } from 'react'
import { messaging, onMessage } from '@/lib/firebase'

export function usePushNotification() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.info('[FCM] 포그라운드 메시지:', payload)
    })

    return unsubscribe
  }, [])
}
