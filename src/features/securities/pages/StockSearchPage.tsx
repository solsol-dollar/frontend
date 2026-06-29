import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSecuritiesProducts } from '../hooks/useSecuritiesProducts'
import { TickerLogo } from '../components/TickerLogo'
import type { ProductListItem } from '../types/securities'

export function StockSearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { data: popularData } = useSecuritiesProducts('OVERSEAS', 'TRADING_VALUE')
  const popular = popularData?.pages.flat() ?? []

  const { data: searchData, isFetching } = useSecuritiesProducts('OVERSEAS', 'TRADING_VALUE', query.trim() || undefined)
  const { data: etfData } = useSecuritiesProducts('ETF', 'TRADING_VALUE', query.trim() || undefined)
  const searchResults = searchData?.pages.flat() ?? []
  const etfResults = etfData?.pages.flat() ?? []
  const filtered: ProductListItem[] = query.trim() ? [...searchResults, ...etfResults] : []

  const firstItem = query.trim() === '' ? popular[0] : filtered[0]

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && firstItem) {
      navigate(`/securities/stocks/${firstItem.productId}`)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1" aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-surface-bg rounded-xl px-3 py-2.5">
          <Search size={16} className="text-text-tertiary flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="종목명 또는 티커 검색"
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="검색어 지우기">
              <X size={14} className="text-text-tertiary" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim() === '' ? (
          <div className="pt-5">
            <p className="text-xs font-semibold text-text-tertiary px-4 mb-3">인기 종목</p>
            <div className="divide-y divide-border">
              {popular.map((p, i) => (
                <SearchResultItem key={p.productId} item={p} rank={i + 1} isFirst={i === 0} onClick={() => navigate(`/securities/stocks/${p.productId}`)} />
              ))}
            </div>
          </div>
        ) : isFetching ? (
          <div className="flex justify-center pt-12">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="pt-4 divide-y divide-border">
            {filtered.map((p, i) => (
              <SearchResultItem key={p.productId} item={p} isFirst={i === 0} onClick={() => navigate(`/securities/stocks/${p.productId}`)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-text-tertiary text-sm">
              <span className="font-semibold text-text-primary">"{query}"</span> 검색 결과가 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchResultItem({ item, rank, isFirst, onClick }: { item: ProductListItem; rank?: number; isFirst?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl', isFirst && 'bg-surface-bg')}>
      {rank != null && (
        <span className="w-5 text-center text-xs font-semibold text-text-tertiary flex-shrink-0 -ml-1">{rank}</span>
      )}
      <TickerLogo ticker={item.ticker} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.productName}</p>
        <p className="text-xs text-text-tertiary">{item.ticker} · {item.productType === 'OVERSEAS' ? '해외주식' : 'ETF'}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-text-primary">
          ${item.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className={cn('text-xs', item.isUp ? 'text-up' : 'text-down')}>
          {item.isUp ? '+' : ''}{item.changeRateDay.toFixed(1)}%
        </p>
      </div>
    </button>
  )
}
