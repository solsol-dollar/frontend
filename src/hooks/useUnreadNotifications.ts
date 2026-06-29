import { useNotifications } from '@/features/mypage/hooks/useMyPage'

export function useUnreadNotifications(): boolean {
  const { data } = useNotifications()
  return data?.some((n) => !n.isRead) ?? false
}
