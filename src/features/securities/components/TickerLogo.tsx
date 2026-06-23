import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  ticker: string
  size?: 'sm' | 'md'
  className?: string
}

export function TickerLogo({ ticker, size = 'md', className }: Props) {
  const [failed, setFailed] = useState(false)
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-9 h-9'
  const text = size === 'sm' ? 'text-[9px]' : 'text-xs'

  if (!failed) {
    return (
      <img
        src={`https://financialmodelingprep.com/image-stock/${ticker}.png`}
        alt={ticker}
        className={cn(dim, 'rounded-full object-cover flex-shrink-0', className)}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className={cn(dim, 'rounded-full bg-primary flex items-center justify-center flex-shrink-0', className)}>
      <span className={cn('text-white font-bold', text)}>{ticker.slice(0, 2)}</span>
    </div>
  )
}
