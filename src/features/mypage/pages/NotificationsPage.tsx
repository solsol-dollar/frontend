import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { Header } from '@/components/common/Header'

type NotifType = 'allocation' | 'refund' | 'sleeping'

interface Notification {
  id: number
  type: NotifType
  title: string
  body: string
  time: string
  action?: { label: string; path: string }
  read: boolean
}

const TODAY: Notification[] = [
  {
    id: 1, type: 'allocation', title: 'CoreWeave 배정 완료', read: false, time: '오전 8:00',
    body: '청약 금액 $960 중 30주 배정\n리턴플랜으로 환불 예정 금액 $470.00 분배 완료',
  },
]
const YESTERDAY: Notification[] = [
  {
    id: 2, type: 'refund', title: '환불금 입금 완료', read: false, time: '오전 8:00',
    body: 'Databricks 미배정 환불금 $2,250.00이 외화 증권 계좌에 입금되었습니다.',
    action: { label: '리턴 플랜 설정', path: '/return-plan/settings' },
  },
  {
    id: 3, type: 'sleeping', title: '쉬는 달러 알림', read: true, time: '오전 8:00',
    body: '외화예수금의 달러가 오래 머물고 있어요. 해외 IPO에 참여해보세요!',
  },
]

const ICON: Record<NotifType, string> = {
  allocation: '🎉',
  refund: '💰',
  sleeping: '😴',
}

function NotifCard({ n }: { n: Notification }) {
  const navigate = useNavigate()
  return (
    <div className={`p-4 border-b border-border ${!n.read ? 'bg-white border-l-2 border-l-primary' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xl flex-shrink-0">
          {ICON[n.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">{n.title}</p>
            <span className="text-xs text-text-tertiary">{n.time}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1 whitespace-pre-line">{n.body}</p>
          {n.action && (
            <button
              onClick={() => navigate(n.action!.path)}
              className="mt-3 w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold"
            >
              {n.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const navigate = useNavigate()

  return (
    <div className="page-content">
      <Header
        showBack
        title="알림센터"
        showNotification={false}
        showMypage={false}
        rightAction={
          <button onClick={() => navigate('/notifications/settings')} className="p-1">
            <Settings size={20} className="text-text-primary" />
          </button>
        }
      />

      <div className="pt-2">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-xs text-text-secondary font-medium">오늘 · 2026.06.18</p>
          <button className="text-xs text-primary">모두 읽음</button>
        </div>
        {TODAY.map((n) => <NotifCard key={n.id} n={n} />)}

        <div className="px-4 py-3">
          <p className="text-xs text-text-secondary font-medium">2026.06.17</p>
        </div>
        {YESTERDAY.map((n) => <NotifCard key={n.id} n={n} />)}
      </div>
    </div>
  )
}
