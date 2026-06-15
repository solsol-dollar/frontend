import { useState } from 'react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'

type FilterType = '전체' | '입금' | '출금'

const HISTORY = [
  { id: 1, type: '출금' as const, from: 'CMA 계좌 · 270-14-164537', to: null, amount: '$700.00', sub: '100,000원', date: '어제' },
  { id: 2, type: '입금' as const, from: 'Value-up 외화적립예금', to: null, amount: '$300.00', sub: '100,000원', date: '어제' },
]

export function TransferHistoryPage() {
  const [filter, setFilter] = useState<FilterType>('전체')
  const [exchangeOpen, setExchangeOpen] = useState(false)

  const filters: FilterType[] = ['전체', '입금', '출금']
  const filtered = HISTORY.filter((h) => filter === '전체' || h.type === filter)

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header showBack title="송금 내역" showNotification={false} showMypage={false} />

      <div className="px-4 pt-3 flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f ? 'bg-primary text-white' : 'bg-surface text-text-secondary',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="p-4 bg-white border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                  <span className="text-xs text-text-secondary">{item.type === '출금' ? '↑' : '↓'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.from}</p>
                  <p className="text-xs text-text-tertiary">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-bold', item.type === '입금' ? 'text-up' : 'text-text-primary')}>
                  {item.type === '입금' ? '+' : '-'}{item.amount}
                </p>
                <p className="text-xs text-text-tertiary">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 환전 방법 선택 bottom sheet */}
      {exchangeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setExchangeOpen(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">이렇게 환전할까요?</h3>
            <div className="space-y-3">
              {['전액', '일부', '출금'].map((opt) => (
                <button key={opt} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border">
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
