import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReturnPlans } from '../hooks/useReturnPlans'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'
import type { ReturnPlanListItem } from '../types/returnPlan'

const formatUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ReturnPlanSearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const q = query.trim()

  const { data: defaultPlans = [], isLoading: defaultLoading } = useReturnPlans({ size: 100 })
  const { data: searchPlans = [], isFetching } = useReturnPlans(
    { keyword: q, size: 100 },
    { enabled: !!q },
  )

  const items = q ? searchPlans : defaultPlans
  const loading = q ? isFetching : defaultLoading

  const getPlanPath = (plan: ReturnPlanListItem) =>
    plan.planStatus === 'EXECUTED'
      ? `/return-plan/result/${plan.returnPlanId}`
      : `/return-plan/pending/${plan.returnPlanId}`

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && items[0]) {
      navigate(getPlanPath(items[0]))
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
              : '리턴 내역이 없습니다'}
          </p>
        </div>
      )
    }
    return (
      <div>
        {!q && (
          <p className="text-xs font-semibold text-text-tertiary px-4 pt-5 mb-3">전체 내역</p>
        )}
        <div className="divide-y divide-border">
          {items.map((plan, i) => (
            <ReturnPlanSearchItem
              key={plan.returnPlanId}
              item={plan}
              isFirst={i === 0}
              onClick={() => navigate(getPlanPath(plan))}
            />
          ))}
        </div>
      </div>
    )
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

      <div className="flex-1 overflow-y-auto">{renderBody()}</div>
    </div>
  )
}

function ReturnPlanSearchItem({
  item,
  isFirst,
  onClick,
}: {
  item: ReturnPlanListItem
  isFirst?: boolean
  onClick: () => void
}) {
  const color = generateLogoColor(item.sourceTicker)
  const isDone = item.planStatus === 'EXECUTED'
  const date = item.refundDate ? item.refundDate.slice(0, 10).replace(/-/g, '.') : '예정'
  const [logoImgError, setLogoImgError] = useState(false)

  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl', isFirst && 'bg-surface-bg')}>
      {item.sourceLogoUrl && !logoImgError ? (
        <img
          src={item.sourceLogoUrl}
          alt={item.sourceTicker}
          onError={() => setLogoImgError(true)}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <span className="text-white text-xs font-bold">{item.sourceTicker.slice(0, 2)}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.sourceCompanyName}</p>
        <p className="text-xs text-text-tertiary">
          {item.sourceTicker} · {date}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-text-primary">{formatUsd(item.totalRefundAmount)}</p>
        <p className={cn('text-xs', isDone ? 'text-success' : 'text-text-tertiary')}>
          {isDone ? '분배 완료' : '분배 예정'}
        </p>
      </div>
    </button>
  )
}
