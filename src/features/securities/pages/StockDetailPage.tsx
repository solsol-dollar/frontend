import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'
import { PriceChart } from '../components/PriceChart'
import { ProductStats } from '../components/ProductStats'
import { useStockDetail, useOrderBook } from '../hooks/useStockDetail'
import { type UiPeriod, PERIOD_MAP } from '../types/chart'
import type { OrderBookEntry } from '../types/securities'
import { useMarketStatus } from '../utils/marketHours'

type DetailTab = '차트' | '호가'

export function StockDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: stock } = useStockDetail(id)
  const { data: orderBook } = useOrderBook(id)
  const marketStatus = useMarketStatus()
  const canTrade = marketStatus === 'open'

  const [detailTab, setDetailTab] = useState<DetailTab>(() => {
    const stateTab = (location.state as { tab?: string } | null)?.tab
    return stateTab === '호가' ? '호가' : '차트'
  })
  const [period, setPeriod] = useState<UiPeriod>('일')
  const periods: UiPeriod[] = ['5분', '일', '주', '월']
  // 실시간 탭 — 고도화 시 복원: canTrade ? ['실시간', ...periods] : periods

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* 종목 기본 정보 */}
        <section className="bg-white px-4 pt-4">
          <p className="text-sm font-semibold text-text-tertiary tracking-wide">{stock?.ticker}</p>
          <p className="text-base text-text-secondary mt-0.5 truncate">{stock?.productName}</p>

          <p className="text-3xl font-bold text-text-primary mt-3">
            ${stock?.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-text-tertiary">{stock?.currentPriceKrw.toLocaleString()}원</p>
            <p className={cn('text-sm font-medium', stock?.isUp ? 'text-up' : 'text-down')}>
              {stock?.isUp ? '+' : ''}{stock?.dayChangeUsd.toFixed(2)} ({stock?.isUp ? '+' : ''}{stock?.dayChangeRate.toFixed(1)}%)
            </p>
          </div>

          {/* 차트/호가 탭 */}
          <div className="flex mt-4 -mx-4 px-4 border-b border-border">
            {(['차트', '호가'] as DetailTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                className={cn(
                  'flex-1 py-3 text-base font-medium border-b-2 transition-colors',
                  detailTab === t ? 'border-primary text-text-primary' : 'border-transparent text-text-tertiary',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* 차트 탭 */}
        {detailTab === '차트' && (
          <>
            <section className="bg-white px-4 pt-4 pb-4">
              <PriceChart productId={id} period={PERIOD_MAP[period]} />
              <div className="flex gap-1.5 mt-3">
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'flex-1 py-2 text-sm rounded-lg font-medium transition-colors',
                      period === p ? 'bg-primary text-white' : 'bg-surface text-text-tertiary',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white mt-2 px-4 pb-4">
              <ProductStats productId={id} />
            </section>
          </>
        )}

        {/* 호가 탭 */}
        {detailTab === '호가' && (
          <section className="bg-white mt-0 px-4 pt-4 pb-4">
            {(() => {
              const asks: OrderBookEntry[] = orderBook?.asks ?? []
              const bids: OrderBookEntry[] = orderBook?.bids ?? []
              const isEmpty = asks.length === 0 && bids.length === 0

              if (isEmpty) {
                return (
                  <div className="flex flex-col items-center py-12 gap-2">
                    <p className="text-sm font-medium text-text-primary">미국 장 마감</p>
                    <p className="text-xs text-text-tertiary">장 운영시간 (한국 기준)</p>
                    <p className="text-xs text-text-secondary font-medium">23:30 ~ 06:00 (서머타임 22:30 ~ 05:00)</p>
                  </div>
                )
              }

              const maxQty = Math.max(
                ...asks.map((a) => a.qty),
                ...bids.map((b) => b.qty),
                1,
              )
              return (
                <>
                  <div className="grid grid-cols-3 mb-2 text-xs font-medium">
                    <span className="text-down text-center">매도</span>
                    <span className="text-center text-text-tertiary text-[10px]">잔량</span>
                    <span className="text-up text-center">매수</span>
                  </div>
                  <div className="space-y-1">
                    {Array.from({ length: Math.max(asks.length, bids.length) }).map((_, i) => {
                      const ask = asks[i]
                      const bid = bids[i]
                      return (
                        <div key={i} className="grid grid-cols-3 items-center gap-1.5">
                          <div className="relative overflow-hidden rounded-md">
                            {ask && (
                              <>
                                <div
                                  className="absolute top-0 right-0 h-full bg-down/15 rounded-l-md"
                                  style={{ width: `${(ask.qty / maxQty) * 100}%` }}
                                />
                                <div className="relative px-2 py-1.5 text-right">
                                  <p className="text-down font-medium text-xs">${ask.priceUsd.toFixed(2)}</p>
                                  <p className="text-text-tertiary text-[10px]">{ask.qty.toLocaleString()}</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-center text-[10px] text-text-tertiary">
                            {ask && bid ? Math.abs(ask.qty - bid.qty).toLocaleString() : ''}
                          </div>
                          <div className="relative overflow-hidden rounded-md">
                            {bid && (
                              <>
                                <div
                                  className="absolute top-0 left-0 h-full bg-up/15 rounded-r-md"
                                  style={{ width: `${(bid.qty / maxQty) * 100}%` }}
                                />
                                <div className="relative px-2 py-1.5">
                                  <p className="text-up font-medium text-xs">${bid.priceUsd.toFixed(2)}</p>
                                  <p className="text-text-tertiary text-[10px]">{bid.qty.toLocaleString()}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </section>
        )}
      </div>

      {/* 하단 매수/매도 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-mobile mx-auto bg-white border-t border-border">
        {!canTrade && (
          <p className="text-center text-xs text-text-tertiary pt-2">
            미국 장 마감 중 · 23:30 ~ 06:00에 거래 가능
          </p>
        )}
        <div className="flex gap-3 px-4 py-3">
        <button
          onClick={() => navigate(`/securities/stocks/${id}/sell`)}
          disabled={!canTrade}
          className="flex-1 py-4 bg-down text-white rounded-2xl font-semibold text-base disabled:opacity-40"
        >
          판매하기
        </button>
        <button
          onClick={() => navigate(`/securities/stocks/${id}/buy`)}
          disabled={!canTrade}
          className="flex-1 py-4 bg-up text-white rounded-2xl font-semibold text-base disabled:opacity-40"
        >
          구매하기
        </button>
        </div>
      </div>
    </div>
  )
}
