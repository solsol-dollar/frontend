import { cn } from '@/lib/utils'
import type { ProductSortType } from '../types/securities'

const TABS: { label: string; value: ProductSortType }[] = [
  { label: '거래대금', value: 'TRADING_VALUE' },
  { label: '거래량', value: 'TRADING_VOLUME' },
  { label: '상승', value: 'RISE' },
  { label: '하락', value: 'FALL' },
]

interface Props {
  value: ProductSortType
  onChange: (v: ProductSortType) => void
}

export function RankingTabBar({ value, onChange }: Props) {
  return (
    <div className="flex border-b border-border">
      {TABS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
            value === t.value
              ? 'border-primary text-text-primary'
              : 'border-transparent text-text-tertiary',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
