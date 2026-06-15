import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'

type StatusType = 'PENDING' | 'ALLOCATED' | 'REFUNDED'

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  PENDING:   { label: '배정 대기', className: 'bg-surface text-text-secondary' },
  ALLOCATED: { label: '배정 완료', className: 'bg-teal text-white' },
  REFUNDED:  { label: '환불 완료', className: 'bg-sky-blue text-white' },
}

const HISTORY = [
  {
    id: 1, ticker: 'CRWV', name: 'CoreWeave', color: '#FF6830', status: 'PENDING' as StatusType,
    subscribeAmount: 'USD 750', date: '청약일: 2026.06.14', allocatedQty: null,
  },
  {
    id: 2, ticker: 'DBRK', name: 'Databricks', color: '#1C1FE8', status: 'ALLOCATED' as StatusType,
    subscribeAmount: 'USD 750', date: '청약일: 2026.05.20', allocatedQty: 30,
  },
]

export function SubscriptionHistoryPage() {
  const navigate = useNavigate()
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)

  const target = HISTORY.find((h) => h.id === cancelTarget)

  return (
    <div className="page-content">
      <Header showBack title="청약 내역" showNotification={false} showMypage={false} />

      <div className="px-4 pt-4 space-y-3">
        {HISTORY.map((item) => (
          <div key={item.id} className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: item.color }}
              >
                {item.ticker.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-text-primary">{item.name}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_CONFIG[item.status].className)}>
                    {STATUS_CONFIG[item.status].label}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">{item.date}</p>
                <p className="text-sm font-bold text-text-primary mt-1">{item.subscribeAmount}</p>
                {item.allocatedQty && (
                  <p className="text-xs text-up mt-0.5">배정 {item.allocatedQty}주</p>
                )}
              </div>
            </div>

            {item.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setCancelTarget(item.id)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm text-text-secondary"
                >
                  청약 취소
                </button>
                <button
                  onClick={() => navigate(`/ipo/${item.id}`)}
                  className="flex-1 py-2.5 bg-primary rounded-xl text-sm text-white font-semibold"
                >
                  상세 보기
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 취소 확인 bottom sheet */}
      {cancelTarget && target && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setCancelTarget(null)}>
          <div className="w-full bg-white rounded-t-3xl px-4 pt-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary text-center mb-6">
              청약을 취소하시겠어요?
            </h3>
            <div className="space-y-2 mb-6">
              {[
                { label: '총 청약 금액', value: target.subscribeAmount },
                { label: '청약 잔량', value: '0' },
                { label: '환불 예정 금액', value: target.subscribeAmount },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{r.label}</span>
                  <span className="font-semibold text-text-primary">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-4 border border-border rounded-xl text-sm font-semibold"
              >
                돌아가기
              </button>
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-4 bg-up text-white rounded-xl text-sm font-semibold"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
