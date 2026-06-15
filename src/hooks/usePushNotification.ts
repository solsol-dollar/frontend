import { useEffect } from 'react'
import { onMessage } from '@/lib/firebase'
import { requestNotificationPermission } from '@/lib/firebase'
import { useUserStore } from '@/store/userStore'

export function usePushNotification() {
  const { setFcmToken } = useUserStore()

  useEffect(() => {
    requestNotificationPermission()
      .then((token) => {
        if (token) {
          setFcmToken(token)
          // TODO: 서버에 FCM 토큰 등록 API 호출
        }
      })
      .catch(() => {
        // 알림 거부 시 조용히 무시
      })

    const unsubscribe = onMessage(null as any, (payload) => {
      // 포그라운드 알림 처리
      // TODO: 토스트 또는 인앱 알림 표시
      console.info('FCM foreground message:', payload)
    })

    return unsubscribe
  }, [setFcmToken])
}
