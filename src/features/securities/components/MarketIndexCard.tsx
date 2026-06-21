import { cn } from '@/lib/utils'
import type { MarketIndex } from '../types/securities'

interface Props {
  index: MarketIndex
}

export function MarketIndexCard({ index }: Props) {
  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-2xl px-4 py-3 border border-border">
      <p className="text-xs text-text-tertiary mb-1">{index.name}</p>
      <p className="text-base font-bold text-text-primary">
        {index.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
      </p>
      <p className={cn('text-xs mt-0.5', index.isUp ? 'text-up' : 'text-down')}>
        {index.isUp ? '+' : ''}{index.changeAmount.toFixed(2)} {index.changeRate.toFixed(2)}%
      </p>
    </div>
  )
}
