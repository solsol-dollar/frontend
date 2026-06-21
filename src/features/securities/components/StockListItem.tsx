import { cn } from '@/lib/utils'
import type { ProductListItem } from '../types/securities'
import { Sparkline, mockSparkData } from './Sparkline'

interface Props {
  item: ProductListItem
  onClick?: () => void
}

export function StockListItem({ item, onClick }: Props) {
  const sparkData = mockSparkData(item.productId, item.isUp)
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 py-3 text-left">
      <span className="text-sm text-text-tertiary w-4 flex-shrink-0 text-center">{item.rank}</span>
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{item.ticker.slice(0, 2)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.productName}</p>
        <p className="text-xs text-text-tertiary">거래대금 {item.tradeAmount.toLocaleString()}백만</p>
      </div>
      <Sparkline data={sparkData} isUp={item.isUp} />
      <div className="text-right flex-shrink-0 w-20">
        <p className="text-sm font-bold text-text-primary">
          {item.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={cn('text-xs', item.isUp ? 'text-up' : 'text-down')}>
          {item.isUp ? '+' : ''}{item.changeRateDay.toFixed(1)}%
        </p>
      </div>
    </button>
  )
}
