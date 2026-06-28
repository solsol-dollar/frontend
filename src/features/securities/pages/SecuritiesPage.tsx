import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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

type Tab = 'MY홈' | '해외' | 'ETF'

// ─── MY홈 탭 ─────────────────────────────────────────────────
function MyHomeTab() {
  const navigate = useNavigate()
  const { data, isLoading } = useMyInvestments()
  const [priceMode, setPriceMode] = useState<'current' | 'avg'>('current')
  const [currencyMode, setCurrencyMode] = useState<'usd' | 'krw'>('usd')

  const holdings: HoldingItem[] = data?.holdings ?? []
  const stocks = holdings.filter((h) => h.productType === 'OVERSEAS')
  const etfs = holdings.filter((h) => h.productType === 'ETF')


  const HoldingRow = ({ h }: { item?: undefined; h: HoldingItem }) => {
    const value = priceMode === 'current'
      ? `${currencyMode === 'usd' ? '$' + h.currentValueUsd.toFixed(2) : h.currentValueUsd.toFixed(0) + '원'}`
      : `${currencyMode === 'usd' ? '$' + h.avgPriceUsd.toFixed(2) : Math.round(h.avgPriceUsd).toLocaleString() + '원'}`

    return (
      <button
        onClick={() => navigate(`/securities/stocks/${h.productId}`)}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        <TickerLogo ticker={h.ticker} size="md" className="w-10 h-10" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{h.productName}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{h.ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-text-primary">{value}</p>
        </div>
      </button>
    )
  }

  return (
    <div className="pb-20">
      {/* 내 투자 요약 */}
      <section className="bg-white px-4 pt-5 pb-5">
        <p className="text-sm text-text-tertiary">내 투자</p>
        <p className="text-2xl font-bold text-text-primary mt-1">
          ${data?.totalCurrentValueUsd.toLocaleString('en-US')}
        </p>
        <p className={cn('text-sm mt-1', (data?.dayChangeRate ?? 0) >= 0 ? 'text-up' : 'text-down')}>
          {(data?.dayChangeRate ?? 0) >= 0 ? '+' : ''}{(data?.dayChangeUsd ?? 0).toFixed(2)} ({(data?.dayChangeRate ?? 0) >= 0 ? '+' : ''}{(data?.dayChangeRate ?? 0).toFixed(1)}%)
        </p>
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

      {/* 현재가/평가금 · $/원 토글 */}
      <div className="bg-white mt-2 px-4 py-2.5 flex items-center justify-end gap-1.5">
        {(['current', 'avg'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setPriceMode(m)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              priceMode === m ? 'bg-surface-bg text-text-primary' : 'text-text-tertiary',
            )}
          >
            {m === 'current' ? '현재가' : '평가금'}
          </button>
        ))}
        <div className="w-px h-3.5 bg-border mx-1" />
        {(['usd', 'krw'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setCurrencyMode(m)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              currencyMode === m ? 'bg-surface-bg text-text-primary' : 'text-text-tertiary',
            )}
          >
            {m === 'usd' ? '$' : '원'}
          </button>
        ))}
      </div>

      {/* 해외주식 섹션 */}
      {isLoading ? (
        <div className="bg-white mt-2 px-4"><SkeletonList count={3} /></div>
      ) : stocks.length > 0 ? (
        <section className="bg-white mt-2 px-4 py-4">
          <p className="text-xs text-text-tertiary font-medium mb-2">해외주식</p>
          <div className="divide-y divide-border">
            {stocks.map((h) => <HoldingRow key={h.productId} h={h} />)}
          </div>
        </section>
      ) : (
        <section className="bg-white mt-2 px-4 py-10 flex flex-col items-center gap-1.5">
          <p className="text-sm font-medium text-text-secondary">보유 해외주식이 없습니다</p>
          <p className="text-xs text-text-tertiary">해외 탭에서 종목을 찾아보세요</p>
        </section>
      )}

      {/* ETF 섹션 */}
      {etfs.length > 0 && (
        <section className="bg-white mt-2 px-4 py-4">
          <p className="text-xs text-text-tertiary font-medium mb-2">ETF</p>
          <div className="divide-y divide-border">
            {etfs.map((h) => <HoldingRow key={h.productId} h={h} />)}
          </div>
          <button
            onClick={() => navigate('/securities/my')}
            className="w-full flex items-center justify-center gap-1 mt-3 py-2 text-sm text-text-secondary"
          >
            자세히 보기 <ChevronRight size={14} />
          </button>
        </section>
      )}

      {/* 주문 내역 / 판매 수익 링크 */}
      <section className="bg-white mt-2">
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
  const { data: products = [], isLoading } = useSecuritiesProducts(type, sort)

  return (
    <div className="pb-20">
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
      <section className="bg-white mt-2">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <p className="text-sm font-bold text-text-primary">전체 종목</p>
          <MarketStatusBadge />
        </div>
        <RankingTabBar value={sort} onChange={setSort} />
        {isLoading ? (
          <SkeletonList count={6} />
        ) : products.length > 0 ? (
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      {/* 헤더 + 탭 통합 */}
      <header className="sticky top-0 z-10 bg-white border-b border-border flex items-center justify-between px-4 h-14 flex-shrink-0">
        <div className="flex items-center gap-5">
          {VALID_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'text-[17px] transition-colors',
                tab === t ? 'font-bold text-text-primary' : 'font-medium text-text-tertiary',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')}>
            <img src="/icons/Bell.svg" width={25} height={25} alt="" />
          </button>
          <button onClick={() => navigate('/securities/search')}>
            <img src="/icons/search.svg" width={19} height={19} alt="" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {tab === 'MY홈' && <MyHomeTab />}
        {tab === '해외' && <StockMarketTab type="OVERSEAS" />}
        {tab === 'ETF' && <StockMarketTab type="ETF" />}
      </div>
    </div>
  )
}
