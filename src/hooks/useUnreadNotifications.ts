import { useNotifications } from '@/features/mypage/hooks/useMyPage'

export function useUnreadNotifications(): boolean {
  const { data } = useNotifications({ isRead: false, size: 1 })
  return (data?.length ?? 0) > 0
}
