import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { TickerLogo } from './TickerLogo'
import { useRanking } from '../hooks/useRanking'

const RANK_BADGE = ['1위', '2위', '3위']

interface Props {
  productType: 'OVERSEAS' | 'ETF'
}

export function RankingSection({ productType }: Props) {
  const navigate = useNavigate()
  const { data: items = [], isLoading } = useRanking('gainer', 3, productType)
  const title = productType === 'ETF' ? '급등 ETF' : '급등주'

  return (
    <section className="bg-white">
      <div className="px-4 pt-4 pb-2 flex items-center gap-1.5">
        <p className="text-sm font-bold text-text-primary">{title}</p>
        <p className="text-xs text-text-tertiary">상승률 TOP 3</p>
      </div>

      <div className="pl-4 pr-4 pb-4 flex gap-2.5 overflow-x-auto scrollbar-none">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[108px] h-[108px] bg-surface rounded-2xl animate-pulse" />
            ))
          : items.slice(0, 3).map((item, i) => {
              const isUp = item.sign === '1' || item.sign === '2'
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/securities/stocks/${item.id}`)}
                  className="flex-shrink-0 w-[108px] bg-surface-bg rounded-2xl p-3 text-left active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] text-text-tertiary font-medium">{RANK_BADGE[i]}</span>
                    <TickerLogo ticker={item.ticker} size="sm" className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-text-primary">{item.ticker}</p>
                  <p className="text-[10px] text-text-tertiary truncate mt-0.5 leading-tight">{item.productName}</p>
                  <p className={cn('text-sm font-bold mt-2.5', isUp ? 'text-up' : 'text-down')}>
                    {isUp ? '+' : ''}{item.changeRate.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">${item.close.toFixed(2)}</p>
                </button>
              )
            })}
      </div>
    </section>
  )
}
