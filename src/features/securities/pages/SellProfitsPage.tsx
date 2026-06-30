import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'
import { useSellProfits } from '../hooks/useSellProfits'
import { TickerLogo } from '../components/TickerLogo'
import type { ProductType, SellProfitItem } from '../types/securities'

type Filter = 'ALL' | ProductType

const FILTERS: { label: string; value: Filter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '해외주식', value: 'OVERSEAS' },
  { label: 'ETF', value: 'ETF' },
]

export function SellProfitsPage() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const { data } = useSellProfits()

  const items: SellProfitItem[] = data?.items ?? []
  const filtered = items.filter(
    (i) => filter === 'ALL' || i.productType === filter,
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header showBack showNotification={false} showMypage={false} centerContent={<span className="text-base font-bold text-text-primary">판매 수익</span>} />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* 필터 칩 */}
        <div className="bg-white px-4 py-3 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                filter === f.value
                  ? 'bg-text-primary text-white border-text-primary'
                  : 'bg-white text-text-secondary border-border',
              )}
            >
              {f.label}
              {filter === f.value && <span className="ml-1">∨</span>}
            </button>
          ))}
        </div>

        {/* 총 수익 */}
        <section className="bg-white mt-2 px-4 py-4">
          <p className="text-xs text-text-tertiary mb-1">판매수익</p>
          <p className={cn('text-2xl font-bold', data?.isProfit ? 'text-up' : 'text-down')}>
            {data?.isProfit ? '+' : ''}{data?.totalProfitKrw.toLocaleString()}원
          </p>
        </section>

        {/* 내역 리스트 */}
        <section className="bg-white mt-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-1.5">
              <p className="text-sm text-text-secondary">판매 수익 내역이 없습니다</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.orderId} className="flex items-center px-4 py-3.5 gap-3 border-b border-border last:border-0">
                <TickerLogo ticker={item.ticker} size="sm" className="w-9 h-9 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.productName}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {item.date} · {item.productType === 'OVERSEAS' ? '해외주식' : 'ETF'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn('text-sm font-bold', item.isProfit ? 'text-up' : 'text-down')}>
                    {item.isProfit ? '+' : ''}${item.totalSaleAmountUsd.toFixed(2)}
                  </p>
                  <p className={cn('text-xs mt-0.5', item.isProfit ? 'text-up' : 'text-down')}>
                    {item.profitRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </section>

        {filtered.length > 0 && (
          <div className="bg-white mt-2 px-4 py-3">
            <p className={cn('text-sm font-medium', data?.isProfit ? 'text-up' : 'text-down')}>
              총 판매수익 {data?.isProfit ? '+' : ''}${filtered.reduce((s, i) => s + i.totalSaleAmountUsd, 0).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
