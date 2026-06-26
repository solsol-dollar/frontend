import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface IpoStockHeaderProps {
  avatarText: string
  avatarColor: string
  logoUrl?: string | null
  name: string
  ticker: string
  status: string
  statusClassName: string
  secondaryText?: string
  secondaryClassName?: string
  align?: 'start' | 'center'
  size?: 'sm' | 'lg'
}

export function IpoStockHeader({
  avatarText,
  avatarColor,
  logoUrl,
  name,
  ticker,
  status,
  statusClassName,
  secondaryText,
  secondaryClassName,
  align = 'center',
  size = 'lg',
}: IpoStockHeaderProps) {
  const [imgError, setImgError] = useState(false)
  useEffect(() => { setImgError(false) }, [logoUrl])
  const showLogo = !!logoUrl && !imgError

  return (
    <div className={cn('flex justify-between', align === 'start' ? 'items-start' : 'items-center')}>
      <div className="flex items-center gap-3">
        {showLogo ? (
          <img
            src={logoUrl!}
            alt={name}
            onError={() => setImgError(true)}
            className={cn(
              'rounded-full object-cover flex-shrink-0',
              size === 'sm' ? 'w-10 h-10' : 'w-12 h-12',
            )}
          />
        ) : (
          <div
            className={cn(
              'rounded-full flex items-center justify-center text-white font-bold flex-shrink-0',
              size === 'sm' ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-base',
            )}
            style={{ backgroundColor: avatarColor }}
          >
            {avatarText}
          </div>
        )}
        <div>
          {size === 'lg' ? (
            <h1 className="text-base font-bold text-text-primary">{name}</h1>
          ) : (
            <p className="text-base font-bold text-text-primary">{name}</p>
          )}
          <p className="text-sm text-text-secondary mt-0.5">{ticker}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap',
            statusClassName,
          )}
        >
          {status}
        </span>
        {secondaryText && (
          <span className={cn('text-sm font-bold', secondaryClassName)}>{secondaryText}</span>
        )}
      </div>
    </div>
  )
}
