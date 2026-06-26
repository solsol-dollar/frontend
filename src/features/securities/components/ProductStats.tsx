import { cn } from '@/lib/utils'
import { useProductStats } from '../hooks/useProductStats'

export function ProductStats({ productId }: { productId: string }) {
  const { data } = useProductStats(productId)

  if (!data) return null

  const PERIOD_LABELS: Record<string, string> = {
    '1M': '1개월', '3M': '3개월', '6M': '6개월', '1Y': '1년',
  }

  const high = data.week52High
  const low  = data.week52Low

  return (
    <section className="mt-4 pt-4 border-t border-border">
      {/* 52주 고저 */}
      {high && low && (
        <div className="mb-4">
          <p className="text-xs text-text-tertiary mb-2">52주 가격대</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-down w-16 text-right">${low.toFixed(2)}</span>
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-down to-up rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-up w-16">${high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5 px-16">
            <span>52주 최저</span>
            <span>52주 최고</span>
          </div>
        </div>
      )}

      {/* 기간별 수익률 */}
      {Object.keys(data.returns).length > 0 && (
        <div>
          <p className="text-xs text-text-tertiary mb-2">기간별 수익률</p>
          <div className="grid grid-cols-4 gap-2">
            {(['1M', '3M', '6M', '1Y'] as const).map((period) => {
              const ret = data.returns[period]
              if (ret === undefined) return null
              const isPositive = ret >= 0
              return (
                <div key={period} className="bg-surface rounded-xl px-2 py-2.5 text-center">
                  <p className="text-[10px] text-text-tertiary mb-1">{PERIOD_LABELS[period]}</p>
                  <p className={cn('text-xs font-semibold', isPositive ? 'text-up' : 'text-down')}>
                    {isPositive ? '+' : ''}{ret.toFixed(2)}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
