import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIpoList } from '@/features/ipo/hooks/useIpo'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'
import type { IpoListItem } from '@/features/ipo/api/ipoApi'

function getAbbr(name: string): string {
  const words = name.split(/(?=[A-Z])|[\s-]/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}


export function IpoSearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const q = query.trim()

  const { data: defaultData, isLoading: defaultLoading } = useIpoList()
  const { data: searchData, isFetching } = useIpoList(q ? { keyword: q } : undefined)

  const defaultIpos = (defaultData?.data.ipos ?? []).filter((ipo) => ipo.ipoStatus !== 'CLOSED')
  const searchIpos: IpoListItem[] = searchData?.data.ipos ?? []

  const sorted = [...(q ? searchIpos : defaultIpos)].sort((a, b) => {
    if (a.ipoStatus === 'OPEN' && b.ipoStatus !== 'OPEN') return -1
    if (a.ipoStatus !== 'OPEN' && b.ipoStatus === 'OPEN') return 1
    return 0
  })
  const items = sorted
  const loading = q ? isFetching : defaultLoading

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && items[0]) {
      navigate(`/ipo/${items[0].id}`)
    }
  }

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex justify-center pt-12">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-text-tertiary text-sm">
            {q
              ? <><span className="font-semibold text-text-primary">"{query}"</span> 검색 결과가 없습니다</>
              : '청약 중·예정인 IPO가 없습니다'}
          </p>
        </div>
      )
    }
    return (
      <div>
        {!q && (
          <p className="text-xs font-semibold text-text-tertiary px-4 pt-5 mb-3">청약 중 · 예정</p>
        )}
        <div className="divide-y divide-border">
          {items.map((ipo, i) => (
            <IpoSearchItem
              key={ipo.id}
              item={ipo}
              isFirst={i === 0}
              onClick={() => navigate(`/ipo/${ipo.id}`)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
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
            <button onClick={() => setQuery('')}>
              <X size={14} className="text-text-tertiary" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{renderBody()}</div>
    </div>
  )
}

function IpoSearchItem({ item, isFirst, onClick }: { item: IpoListItem; isFirst?: boolean; onClick: () => void }) {
  const color = generateLogoColor(item.ticker)
  const price = item.confirmedOfferPrice ?? item.offerPriceMax ?? item.offerPriceMin
  const status = item.ipoStatus?.toUpperCase() ?? 'UPCOMING'

  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl', isFirst && 'bg-surface-bg')}>
      {item.logoUrl ? (
        <img
          src={item.logoUrl}
          alt={item.ticker}
          className="w-10 h-10 rounded-full object-contain flex-shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <span className="text-white text-xs font-bold">{getAbbr(item.companyName)}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.companyName}</p>
        <p className="text-xs text-text-tertiary">{item.ticker}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {status === 'OPEN' ? (
          <>
            <img src="/icons/IPO_ready.svg" width={50} height={17} alt="청약 중" />
            {price != null && (
              <p className="text-xs font-medium text-[#CA3D40] mt-0.5 mr-0.5">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </>
        ) : status === 'UPCOMING' ? (
          <>
            <img src="/icons/IPO_upcoming.svg" width={50} height={17} alt="청약 예정" />
            {price != null && (
              <p className="text-xs font-medium text-[#3045BB] mt-0.5 mr-0.5">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </>
        ) : (
          <>
            <img src="/icons/IPO_end.svg" width={50} height={17} alt="청약 완료" />
            {price != null && (
              <p className="text-xs font-medium text-[#6B7280] mt-0.5 mr-0.5">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </>
        )}
      </div>
    </button>
  )
}
