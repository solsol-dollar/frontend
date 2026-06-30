import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BellIcon } from '@/components/common/Header'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import solCharacter from '@/assets/common/쏠.png'
import { MarketIndexCard } from '../components/MarketIndexCard'
import { StockListItem } from '../components/StockListItem'
import { RankingTabBar } from '../components/RankingTabBar'
import { MarketStatusBadge } from '../components/MarketStatusBadge'
import { SkeletonList } from '../components/SkeletonList'
import { TickerLogo } from '../components/TickerLogo'
import { RankingSection } from '../components/RankingSection'
import { useMyInvestments } from '../hooks/useMyInvestments'
import { useSecuritiesProducts } from '../hooks/useSecuritiesProducts'
import { useMarketIndices } from '../hooks/useMarketIndices'
import type { ProductSortType, HoldingItem } from '../types/securities'
import { serviceApi } from '@/lib/axios'
import { getInvestmentStatus, markInvestmentCompleted } from '@/lib/auth'
import { InvestmentProfileSheet } from '@/features/mypage/components/InvestmentProfileSheet'

type Tab = 'MY홈' | '해외' | 'ETF'

// ─── MY홈 탭 ─────────────────────────────────────────────────
function MyHomeTab() {
  const navigate = useNavigate()
  const { data, isLoading } = useMyInvestments()
  const { data: indices } = useMarketIndices()
  const [currencyMode, setCurrencyMode] = useState<'usd' | 'krw'>('usd')

  const usdKrw = indices?.find((i) => i.name === 'USD/KRW')?.value ?? 0

  const holdings: HoldingItem[] = data?.holdings ?? []
  const stocks = holdings.filter((h) => h.productType === 'OVERSEAS')
  const etfs = holdings.filter((h) => h.productType === 'ETF')

  const HoldingRow = ({ h }: { item?: undefined; h: HoldingItem }) => {
    const costBasisUsd = h.avgPriceUsd * h.qty
    const usdAmount = h.currentValueUsd ?? costBasisUsd
    const value = currencyMode === 'usd'
      ? `$${usdAmount.toFixed(2)}`
      : usdKrw > 0 ? `${Math.round(usdAmount * usdKrw).toLocaleString()}원` : '--'
    const isFallback = !h.hasPrice

    return (
      <button
        onClick={() => navigate(`/securities/stocks/${h.productId}`)}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        <TickerLogo ticker={h.ticker} size="md" className="w-10 h-10" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{h.productName}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{h.qty}주 · ${h.avgPriceUsd.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className={cn('text-sm font-bold', isFallback ? 'text-text-secondary' : 'text-text-primary')}>
            {value}
          </p>
          {isFallback && (
            <p className="text-[10px] text-text-tertiary mt-0.5">취득원가</p>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="pb-32">
      {/* 내 투자 요약 */}
      <section className="bg-white px-4 pt-5 pb-5">
        <p className="text-sm font-semibold text-text-tertiary">
          {data?.hasPriceData ? '내 투자' : '투자 원금'}
        </p>
        <p className="text-2xl font-bold text-text-primary mt-1">
          ${(data?.hasPriceData ? data.totalCurrentValueUsd : (data?.totalCostUsd ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {data?.hasPriceData ? (
          <p className={cn('text-sm mt-1', (data.dayChangeRate ?? 0) >= 0 ? 'text-up' : 'text-down')}>
            {(data.dayChangeRate ?? 0) >= 0 ? '+' : ''}{(data.dayChangeUsd ?? 0).toFixed(2)} ({(data.dayChangeRate ?? 0) >= 0 ? '+' : ''}{(data.dayChangeRate ?? 0).toFixed(1)}%)
          </p>
        ) : (
          <p className="text-xs text-text-tertiary mt-1">실시간 시세 미수신 · 취득원가 기준</p>
        )}
        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-surface-bg rounded-2xl px-3 py-4">
            <p className="text-xs text-text-tertiary">달러</p>
            <p className="text-sm font-semibold text-text-primary mt-1">${data?.cashUsd.toLocaleString('en-US')}</p>
          </div>
          <div className="flex-1 bg-surface-bg rounded-2xl px-3 py-4">
            <p className="text-xs text-text-tertiary">원화</p>
            <p className="text-sm font-semibold text-text-primary mt-1">{data?.cashKrw.toLocaleString()}원</p>
          </div>
        </div>
      </section>

      {/* 해외주식 섹션 */}
      {isLoading ? (
        <div className="bg-white mt-2 px-4"><SkeletonList count={3} /></div>
      ) : stocks.length > 0 ? (
        <section className="bg-white mt-[13px] px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-tertiary font-medium">해외주식</p>
            <div className="flex gap-1">
              {(['usd', 'krw'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCurrencyMode(m)}
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                    currencyMode === m ? 'bg-surface-bg text-text-primary' : 'text-text-tertiary',
                  )}
                >
                  {m === 'usd' ? '$' : '원'}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {stocks.map((h) => <HoldingRow key={h.productId} h={h} />)}
          </div>
        </section>
      ) : (
        <section className="bg-white mt-[13px] px-4 py-10 flex flex-col items-center gap-1.5">
          <p className="text-sm font-medium text-text-secondary">보유 해외주식이 없습니다</p>
          <p className="text-xs text-text-tertiary">해외 탭에서 종목을 찾아보세요</p>
        </section>
      )}

      {/* ETF 섹션 */}
      {etfs.length > 0 && (
        <section className="bg-white mt-[13px] px-4 py-4">
          <p className="text-xs text-text-tertiary font-medium mb-2">ETF</p>
          <div className="divide-y divide-border">
            {etfs.map((h) => <HoldingRow key={h.productId} h={h} />)}
          </div>
        </section>
      )}

      {/* 주문 내역 / 판매 수익 링크 */}
      <section className="bg-white mt-[13px]">
        {[
          { label: '주문 내역', path: '/securities/orders' },
          { label: '판매 수익', path: '/securities/profits' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-border last:border-0"
          >
            <span className="text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight size={16} className="text-text-tertiary" />
          </button>
        ))}
      </section>
    </div>
  )
}

// ─── 해외/ETF 탭 ──────────────────────────────────────────────
function StockMarketTab({ type }: { type: 'OVERSEAS' | 'ETF' }) {
  const navigate = useNavigate()
  const [sort, setSort] = useState<ProductSortType>('TRADING_VALUE')
  const { data: indices = [] } = useMarketIndices()
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSecuritiesProducts(type, sort)

  const products = data?.pages.flat() ?? []

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="pb-32">
      {/* 마켓 인덱스 카드 */}
      {indices.length > 0 && (
        <div className="px-4 py-4 flex gap-3 overflow-x-auto scrollbar-none">
          {indices.map((idx) => (
            <MarketIndexCard key={idx.name} index={idx} />
          ))}
        </div>
      )}

      {/* 종목 랭킹 */}
      <RankingSection productType={type} />

      {/* 전체 종목 리스트 */}
      <section className="bg-white mt-[13px]">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <p className="text-sm font-bold text-text-primary">전체 종목</p>
          <MarketStatusBadge />
        </div>
        <RankingTabBar value={sort} onChange={setSort} />
        {isLoading ? (
          <SkeletonList count={6} />
        ) : products.length > 0 ? (
          <>
            <div className="divide-y divide-border px-4">
              {products.map((p) => (
                <StockListItem
                  key={p.productId}
                  item={p}
                  sort={sort}
                  onClick={() => navigate(`/securities/stocks/${p.productId}`)}
                />
              ))}
            </div>
            {isFetchingNextPage && <SkeletonList count={3} />}
            <div ref={sentinelRef} className="h-1" />
          </>
        ) : (
          <div className="flex flex-col items-center py-16 gap-1.5">
            <p className="text-sm text-text-secondary">종목 정보를 불러올 수 없습니다</p>
            <p className="text-xs text-text-tertiary">잠시 후 다시 시도해 주세요</p>
          </div>
        )}
      </section>
    </div>
  )
}

// ─── SecuritiesPage ───────────────────────────────────────────
const VALID_TABS: Tab[] = ['MY홈', '해외', 'ETF']

export function SecuritiesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') as Tab | null
  const tab: Tab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : 'MY홈'

  const setTab = (t: Tab) => setSearchParams({ tab: t }, { replace: true })

  const qc = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [pullY, setPullY] = useState(0)
  const [solJump, setSolJump] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 0) > 0) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) setPullY(Math.min(delta, 72))
  }
  const handleTouchEnd = async () => {
    if (pullY >= 60) {
      setPullY(0)
      setSolJump(true)
      await Promise.all([
        qc.refetchQueries({ queryKey: ['securities'] }),
        new Promise(r => setTimeout(r, 700)),
      ])
      setSolJump(false)
    } else {
      setPullY(0)
    }
  }

  const [showDiagnosis, setShowDiagnosis] = useState(() => getInvestmentStatus() === 'REQUIRED')
  const submitDiagnosis = async (data: { hope: string; provide: string }) => {
    try {
      await serviceApi.post('/api/service/api/v1/mypage/investment-profile', data)
      markInvestmentCompleted()
      setShowDiagnosis(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      {/* 헤더 + 탭 통합 */}
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-14 flex-shrink-0">
        <div className="flex items-center gap-5">
          {VALID_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'text-[17px] transition-colors',
                tab === t ? 'font-bold text-text-primary' : 'font-bold text-text-tertiary',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')}>
            <BellIcon />
          </button>
          <button onClick={() => navigate('/securities/search')} className="ml-[9px] mr-[4px]">
            <img src="/icons/search.svg" width={19} height={19} alt="" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-200"
          style={{ height: (pullY > 0 || solJump) ? Math.max(pullY, 56) : 0 }}
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-end justify-center overflow-hidden">
            <img src={solCharacter} alt="" className={cn('w-10 h-10 object-contain translate-y-4', solJump && 'animate-bounce')} />
          </div>
        </div>
        {tab === 'MY홈' && <MyHomeTab />}
        {tab === '해외' && <StockMarketTab type="OVERSEAS" />}
        {tab === 'ETF' && <StockMarketTab type="ETF" />}
      </div>

      {showDiagnosis && (
        <InvestmentProfileSheet
          onConfirm={submitDiagnosis}
          onClose={() => setShowDiagnosis(false)}
        />
      )}
    </div>
  )
}
