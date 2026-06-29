import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import dayjs from 'dayjs'
import { Header } from '@/components/common/Header'
import { useNotifications, useMarkNotificationRead, type Notification } from '@/features/mypage/hooks/useMyPage'

const TYPE_ICON: Record<string, string> = {
  IPO_ALLOCATION: '/icons/notification_con.svg',
  IPO_REFUND: '/icons/notification_return.svg',
  IDLE_DOLLAR: '/icons/notification_dollar.svg',
}

const TARGET_PATH: Record<string, (id: number | null, notificationType: string) => string> = {
  IPO: (id, type) => type === 'IPO_ALLOCATION' ? `/ipo/${id}/result` : `/ipo/${id}`,
  RETURN_PLAN: (id) => `/return-plan/result/${id}`,
  ACCOUNT: () => '/home/sleeping-dollar',
  CARD: () => '/home/card/history',
}

function NotifCard({ n, onRead }: { n: Notification; onRead: (id: number) => void }) {
  const navigate = useNavigate()
  const path = n.targetType ? TARGET_PATH[n.targetType]?.(n.targetId, n.notificationType) : undefined

  const handleClick = () => {
    if (!n.isRead) onRead(n.notificationId)
    if (path) navigate(path)
  }

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-border ${!n.isRead ? 'bg-[#FAFCFF] border-l-[3px] border-l-primary' : 'bg-white'} ${path ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-[42px] h-[42px] flex-shrink-0">
          {TYPE_ICON[n.notificationType]
            ? <img src={TYPE_ICON[n.notificationType]} alt="" className="w-full h-full" />
            : <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xl">🔔</div>
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">{n.title}</p>
            <span className="text-xs text-text-tertiary">{dayjs(n.sentAt).format('A h:mm')}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1 whitespace-pre-line font-medium">
            {n.message
              .replace('배정되었습니다.', '배정되었습니다.\n')
              .replace('잠자고 있어요.', '잠자고 있어요.\n')
              .split(/(\$[\d,]+(?:\.\d+)?)/g)
              .map((part, i) =>
                /^\$[\d,]+(?:\.\d+)?$/.test(part)
                  ? <span key={i} className="font-bold text-primary">{part}</span>
                  : part
              )}
          </p>
        </div>
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { data: notifications = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const key = dayjs(n.sentAt).format('YYYY-MM-DD')
    if (!acc[key]) acc[key] = []
    acc[key].push(n)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1))
  const todayStr = dayjs().format('YYYY-MM-DD')

  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.notificationId)
  const handleMarkAll = () => {
    unreadIds.forEach((id) => markRead.mutate(id))
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        centerContent={<span className="text-base font-bold text-text-primary">알림 센터</span>}
        rightAction={
          <button onClick={() => navigate('/notifications/settings')} className="p-1">
            <Settings size={20} className="text-text-primary" />
          </button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-sm text-text-secondary">불러오는 중...</div>
      ) : notifications.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-text-secondary">알림이 없습니다.</div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-end justify-between px-4 py-3">
                <p className="text-[14px] text-[#999EA4] font-semibold">
                  {date === todayStr ? `오늘 · ${dayjs(date).format('YYYY.MM.DD')}` : dayjs(date).format('YYYY.MM.DD')}
                </p>
                {date === sortedDates[0] && unreadIds.length > 0 && (
                  <button onClick={handleMarkAll} className="text-[12px] font-bold text-primary">모두 읽음</button>
                )}
              </div>
              {grouped[date].map((n) => (
                <NotifCard key={n.notificationId} n={n} onRead={(id) => markRead.mutate(id)} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
