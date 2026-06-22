import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'
import { PriceChart } from '../components/PriceChart'
import { useStockDetail, useOrderBook } from '../hooks/useStockDetail'
import { useWatchlist } from '../hooks/useWatchlist'
import { type UiPeriod, PERIOD_MAP } from '../types/chart'
import type { OrderBookEntry } from '../types/securities'

type DetailTab = '차트' | '호가'

export function StockDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: stock } = useStockDetail(id)
  const { data: orderBook } = useOrderBook(id)
  const { toggle, isWatchlisted } = useWatchlist()

  const [detailTab, setDetailTab] = useState<DetailTab>('차트')
  const [period, setPeriod] = useState<UiPeriod>('일')
  const periods: UiPeriod[] = ['5분', '일', '주', '월']

  const watchlisted = isWatchlisted(Number(id))

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={
          <button onClick={() => toggle(Number(id))}>
            <Heart
              size={22}
              className={cn(watchlisted ? 'text-heart fill-heart' : 'text-text-tertiary')}
            />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* 종목 기본 정보 */}
        <section className="bg-white px-4 pt-4 pb-5">
          <p className="text-sm text-text-secondary mb-1">{stock?.productName}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary">
              ${stock?.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-tertiary">{stock?.currentPriceKrw.toLocaleString()}원</p>
            <div className="ml-auto flex items-center gap-1 bg-surface rounded-lg px-2 py-1">
              <span className="text-xs text-text-tertiary">$</span>
              <span className="text-xs text-text-tertiary">원</span>
            </div>
          </div>
          <p className={cn('text-sm mt-1', stock?.isUp ? 'text-up' : 'text-down')}>
            어제보다 {stock?.isUp ? '+' : ''}{stock?.dayChangeUsd.toFixed(2)} ({stock?.isUp ? '+' : ''}{stock?.dayChangeRate.toFixed(1)}%)
          </p>

          {/* 차트/호가 탭 */}
          <div className="flex mt-4 border-b border-border">
            {(['차트', '호가'] as DetailTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                className={cn(
                  'flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors',
                  detailTab === t ? 'border-primary text-text-primary' : 'border-transparent text-text-tertiary',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 차트 탭 */}
          {detailTab === '차트' && (
            <div className="mt-4">
              <div className="flex items-center gap-1 text-text-tertiary mb-2">
                <span className="text-xs">⊙ 자세한 차트</span>
              </div>
              <PriceChart productId={id} period={PERIOD_MAP[period]} className="h-52" />
              <div className="flex gap-1 mt-3">
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors',
                      period === p ? 'bg-primary text-white' : 'text-text-tertiary',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 호가 탭 — REQ-09-05-04, REQ-09-05-05 */}
          {detailTab === '호가' && (
            <div className="mt-4">
              <div className="grid grid-cols-3 mb-2 text-xs font-medium">
                <span className="text-down text-center">매도</span>
                <span className="text-center text-text-tertiary text-[10px]">잔량</span>
                <span className="text-up text-center">매수</span>
              </div>
              <div className="space-y-1">
                {(() => {
                  const asks: OrderBookEntry[] = orderBook?.asks ?? []
                  const bids: OrderBookEntry[] = orderBook?.bids ?? []
                  const maxQty = Math.max(
                    ...(asks.map((a) => a.qty).length ? asks.map((a) => a.qty) : [1]),
                    ...(bids.map((b) => b.qty).length ? bids.map((b) => b.qty) : [1]),
                  )
                  return Array.from({ length: Math.max(asks.length, bids.length) }).map((_, i) => {
                    const ask = asks[i]
                    const bid = bids[i]
                    return (
                      <div key={i} className="grid grid-cols-3 items-center gap-1.5">
                        {/* 매도 — depth bar 오른쪽 정렬 */}
                        <div className="relative overflow-hidden rounded-md">
                          {ask && (
                            <>
                              <div
                                className="absolute top-0 right-0 h-full bg-down/15"
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
                        {/* 매수 — depth bar 왼쪽 정렬 */}
                        <div className="relative overflow-hidden rounded-md">
                          {bid && (
                            <>
                              <div
                                className="absolute top-0 left-0 h-full bg-up/15"
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
                  })
                })()}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 하단 매수/매도 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-mobile mx-auto px-4 py-4 bg-white border-t border-border flex gap-3">
        <button
          onClick={() => navigate(`/securities/stocks/${id}/sell`)}
          className="flex-1 py-4 bg-down text-white rounded-2xl font-semibold"
        >
          판매하기
        </button>
        <button
          onClick={() => navigate(`/securities/stocks/${id}/buy`)}
          className="flex-1 py-4 bg-up text-white rounded-2xl font-semibold"
        >
          구매하기
        </button>
      </div>
    </div>
  )
}
