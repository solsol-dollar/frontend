import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'
import { useSellProfits } from '../hooks/useSellProfits'
import type { ProductType } from '../types/securities'

type Filter = 'ALL' | ProductType

const FILTERS: { label: string; value: Filter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '해외주식', value: 'OVERSEAS' },
  { label: 'ETF', value: 'ETF' },
]

export function SellProfitsPage() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const { data } = useSellProfits()

  const filtered = (data?.items ?? []).filter(
    (i) => filter === 'ALL' || i.productType === filter,
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header showBack showNotification={false} showMypage={false} title="판매 수익" />

      <div className="flex-1 overflow-y-auto">
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
          <p className={cn('text-3xl font-bold', data?.isProfit ? 'text-up' : 'text-down')}>
            {data?.isProfit ? '+' : ''}{data?.totalProfitKrw.toLocaleString()}원
          </p>
          <div className="flex gap-2 mt-3">
            <button className={cn('px-3 py-1 rounded-full text-xs bg-surface-bg text-text-primary')}>
              일별 ∨
            </button>
          </div>
        </section>

        {/* 테이블 */}
        <section className="bg-white mt-2">
          <div className="grid grid-cols-5 px-4 py-2 border-b border-border">
            {['판매일', '종목유형', '종목명', '총 판매수익', '수익률'].map((h) => (
              <p key={h} className="text-xs text-text-tertiary text-center first:text-left">{h}</p>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-1.5">
              <p className="text-sm text-text-secondary">판매 수익 내역이 없습니다</p>
            </div>
          )}
          {filtered.map((item) => (
            <div key={item.orderId} className="grid grid-cols-5 px-4 py-3.5 border-b border-border last:border-0 items-center">
              <p className="text-xs text-text-secondary">{item.date}</p>
              <p className="text-xs text-text-secondary text-center">{item.productType === 'OVERSEAS' ? '해외주식' : 'ETF'}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">{item.ticker.slice(0, 2)}</span>
                </div>
                <p className="text-xs text-text-primary truncate">{item.productName}</p>
              </div>
              <p className={cn('text-xs font-medium text-center', item.isProfit ? 'text-up' : 'text-down')}>
                {item.isProfit ? '+' : ''}${item.totalSaleAmountUsd.toFixed(2)}
              </p>
              <p className={cn('text-xs font-medium text-right', item.isProfit ? 'text-up' : 'text-down')}>
                {item.profitRate.toFixed(1)}%
              </p>
            </div>
          ))}
        </section>

        {filtered.length > 0 && (
          <div className="bg-white mt-2 px-4 py-3">
            <p className={cn('text-sm font-medium', data?.isProfit ? 'text-up' : 'text-down')}>
              총 판매수익 {data?.isProfit ? '+' : ''}${filtered.reduce((s, i) => s + i.totalSaleAmountUsd, 0).toFixed(2)} ({filtered[0]?.profitRate.toFixed(1)}%)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
