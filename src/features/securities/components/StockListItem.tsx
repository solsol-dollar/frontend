import { cn } from '@/lib/utils'
import type { ProductListItem, ProductSortType } from '../types/securities'
import { Sparkline } from './Sparkline'
import { TickerLogo } from './TickerLogo'

interface Props {
  item: ProductListItem
  sort?: ProductSortType
  onClick?: () => void
}

function formatAmount(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  return v.toLocaleString()
}

function subLabel(item: ProductListItem, sort?: ProductSortType): string {
  switch (sort) {
    case 'TRADING_VOLUME':
      return item.tradeVolume > 0 ? `거래량 ${formatAmount(item.tradeVolume)}` : '거래량 -'
    case 'RISE':
    case 'FALL':
      return item.changeRateDay !== 0
        ? `등락 ${item.isUp ? '+' : ''}${item.changeRateDay.toFixed(2)}%`
        : '등락 -'
    default: // TRADING_VALUE
      return item.tradeAmount > 0 ? `거래대금 $${formatAmount(item.tradeAmount)}` : '거래대금 -'
  }
}

export function StockListItem({ item, sort, onClick }: Props) {
  const sparkData = item.sparkPrices
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 py-3 text-left">
      <span className="text-sm font-medium text-text-tertiary w-4 flex-shrink-0 text-center">{item.rank}</span>
      <TickerLogo ticker={item.ticker} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.productName}</p>
        <p className="text-xs text-text-tertiary">{subLabel(item, sort)}</p>
      </div>
      <Sparkline data={sparkData} isUp={item.isUp} />
      <div className="text-right flex-shrink-0 w-20">
        <p className="text-sm font-bold text-text-primary">
          {item.currentPriceUsd > 0
            ? item.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '-'}
        </p>
        <p className={cn('text-xs', item.isUp ? 'text-up' : 'text-down')}>
          {item.changeRateDay !== 0 ? `${item.isUp ? '+' : ''}${item.changeRateDay.toFixed(1)}%` : '-'}
        </p>
      </div>
    </button>
  )
}
