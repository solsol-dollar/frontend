import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'
import { useMyInvestments } from '../hooks/useMyInvestments'
import { TickerLogo } from '../components/TickerLogo'
import type { HoldingItem } from '../types/securities'

type PriceMode = 'current' | 'avg'
type CurrencyMode = 'usd' | 'krw'

export function MyInvestmentsPage() {
  const navigate = useNavigate()
  const { data } = useMyInvestments()
  const [priceMode, setPriceMode] = useState<PriceMode>('current')
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('usd')

  const holdings: HoldingItem[] = data?.holdings ?? []
  const stocks = holdings.filter((h) => h.productType === 'OVERSEAS')
  const etfs = holdings.filter((h) => h.productType === 'ETF')
  const totalValue = data?.totalCurrentValueUsd ?? 1

  const HoldingRow = ({ h }: { h: HoldingItem }) => {
    const costBasisUsd = h.avgPriceUsd * h.qty
    const effectiveValueUsd = h.currentValueUsd ?? costBasisUsd
    const ratio = totalValue > 0 ? (effectiveValueUsd / totalValue) * 100 : 0
    const value = priceMode === 'current'
      ? currencyMode === 'usd' ? `$${effectiveValueUsd.toFixed(2)}` : `${Math.round(effectiveValueUsd).toLocaleString()}원`
      : currencyMode === 'usd' ? `$${h.avgPriceUsd.toFixed(2)}` : `${Math.round(h.avgPriceUsd).toLocaleString()}원`

    return (
      <button
        onClick={() => navigate(`/securities/stocks/${h.productId}`)}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        <TickerLogo ticker={h.ticker} size="md" className="w-10 h-10" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{h.productName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(ratio, 100).toFixed(1)}%` }}
              />
            </div>
            <span className="text-[10px] text-text-tertiary flex-shrink-0">{ratio.toFixed(0)}%</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-text-primary">{value}</p>
          <p className={cn('text-xs', h.dayChangeRate >= 0 ? 'text-up' : 'text-down')}>
            {h.dayChangeRate >= 0 ? '+' : ''}{h.dayChangeUsd.toFixed(2)} ({h.dayChangeRate >= 0 ? '+' : ''}{h.dayChangeRate.toFixed(1)}%)
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header showBack showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* 투자 요약 */}
        <section className="bg-white px-4 pt-4 pb-5">
          <p className="text-xs text-text-tertiary mb-1">내 투자</p>
          <p className="text-2xl font-bold text-text-primary">
            ${data?.totalCurrentValueUsd.toLocaleString('en-US')}
          </p>
          <div className="flex gap-3 mt-3">
            {[
              { label: '원금', value: `$${data?.totalCostUsd.toLocaleString('en-US')}` },
              {
                label: '총 수익',
                value: `${((data?.totalCurrentValueUsd ?? 0) - (data?.totalCostUsd ?? 0) > 0) ? '+' : ''}$${((data?.totalCurrentValueUsd ?? 0) - (data?.totalCostUsd ?? 0)).toFixed(2)}`,
                isProfit: (data?.totalCurrentValueUsd ?? 0) >= (data?.totalCostUsd ?? 0),
              },
            ].map((s) => (
              <div key={s.label} className="flex-1 bg-surface rounded-xl px-3 py-3">
                <p className="text-xs text-text-tertiary">{s.label}</p>
                <p className={cn('text-sm font-semibold mt-0.5', s.isProfit !== undefined ? (s.isProfit ? 'text-up' : 'text-down') : 'text-text-primary')}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 가격/통화 토글 */}
        <div className="bg-white px-4 py-3 mt-2 flex items-center justify-end gap-2">
          {(['current', 'avg'] as PriceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setPriceMode(m)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                priceMode === m ? 'bg-surface-bg text-text-primary' : 'text-text-tertiary',
              )}
            >
              {m === 'current' ? '현재가' : '평가금'}
            </button>
          ))}
          <div className="w-px h-4 bg-border" />
          {(['usd', 'krw'] as CurrencyMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setCurrencyMode(m)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                currencyMode === m ? 'bg-surface-bg text-text-primary' : 'text-text-tertiary',
              )}
            >
              {m === 'usd' ? '$' : '원'}
            </button>
          ))}
        </div>

        {/* 해외주식 */}
        {stocks.length > 0 ? (
          <section className="bg-white mt-2 px-4 py-4">
            <p className="text-xs text-text-tertiary font-medium mb-3">해외주식</p>
            <div className="divide-y divide-border">
              {stocks.map((h) => <HoldingRow key={h.productId} h={h} />)}
            </div>
          </section>
        ) : (
          <section className="bg-white mt-2 px-4 py-10 flex flex-col items-center gap-1.5">
            <p className="text-sm text-text-secondary">보유 해외주식이 없습니다</p>
          </section>
        )}

        {/* ETF */}
        {etfs.length > 0 && (
          <section className="bg-white mt-2 px-4 py-4">
            <p className="text-xs text-text-tertiary font-medium mb-3">ETF</p>
            <div className="divide-y divide-border">
              {etfs.map((h) => <HoldingRow key={h.productId} h={h} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
