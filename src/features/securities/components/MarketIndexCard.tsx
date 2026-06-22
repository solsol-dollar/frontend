import { cn } from '@/lib/utils'
import type { MarketIndex } from '../types/securities'

interface Props {
  index: MarketIndex
}

export function MarketIndexCard({ index }: Props) {
  const showBadge = index.name !== 'USD/KRW'
  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-2xl px-4 py-3 border border-border">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-text-tertiary">{index.name}</p>
        {showBadge && (
          <span className={cn(
            'text-[9px] font-semibold px-1.5 py-0.5 rounded-full',
            index.isMarketOpen
              ? 'bg-green-100 text-green-600'
              : 'bg-surface-bg text-text-tertiary',
          )}>
            {index.isMarketOpen ? '실시간' : '종가'}
          </span>
        )}
      </div>
      <p className="text-base font-bold text-text-primary">
        {index.value != null
          ? index.value.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : '—'}
      </p>
      <p className={cn('text-xs mt-0.5', index.isUp ? 'text-up' : 'text-down')}>
        {index.value != null
          ? `${index.isUp ? '+' : ''}${(index.changeAmount ?? 0).toFixed(2)} ${(index.changeRate ?? 0).toFixed(2)}%`
          : '데이터 없음'}
      </p>
    </div>
  )
}
