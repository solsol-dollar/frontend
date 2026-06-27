import { useState, useEffect, useRef } from 'react'
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
  const wrapRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLElement>(null)
  const [overflow, setOverflow] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)

  useEffect(() => { setImgError(false) }, [logoUrl])

  useEffect(() => {
    const wrap = wrapRef.current
    const el = nameRef.current
    if (!wrap || !el) return
    const measure = () => {
      setOverflow(Math.max(0, el.scrollWidth - wrap.clientWidth))
      setDragOffset(0)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [name, size])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (overflow === 0) return
    const el = nameRef.current
    if (el) {
      const matrix = new DOMMatrix(window.getComputedStyle(el).transform)
      const currentX = Math.max(-overflow, Math.min(0, matrix.m41))
      setDragOffset(currentX)
      startOffsetRef.current = currentX
    } else {
      startOffsetRef.current = dragOffset
    }
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || overflow === 0) return
    const delta = e.touches[0].clientX - startXRef.current
    setDragOffset(Math.max(-overflow, Math.min(0, startOffsetRef.current + delta)))
  }

  const handleTouchEnd = () => setIsDragging(false)

  const showLogo = !!logoUrl && !imgError
  const nameClass = 'text-base font-bold text-text-primary whitespace-nowrap'
  const nameStyle: React.CSSProperties = overflow > 0
    ? isDragging
      ? { display: 'inline-block', transform: `translateX(${dragOffset}px)`, transition: 'none' }
      : {
          display: 'inline-block',
          animation: 'ipo-name-scroll 7s ease-in-out infinite',
          ['--scroll-amount' as string]: `-${overflow}px`,
        }
    : {}

  return (
    <div className={cn('flex justify-between', align === 'start' ? 'items-start' : 'items-center')}>
      <style>{`
        @keyframes ipo-name-scroll {
          0%, 20%  { transform: translateX(0); }
          80%, 100% { transform: translateX(var(--scroll-amount)); }
        }
      `}</style>
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
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
        <div className="min-w-0 flex-1">
          <div
            ref={wrapRef}
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {size === 'lg' ? (
              <h1 ref={nameRef as React.RefObject<HTMLHeadingElement>} className={nameClass} style={nameStyle}>{name}</h1>
            ) : (
              <p ref={nameRef as React.RefObject<HTMLParagraphElement>} className={nameClass} style={nameStyle}>{name}</p>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-0.5">{ticker}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {status === '청약종료' ? (
          <img src="/icons/IPO_end.svg" alt="청약종료" width={50} height={17} className="mt-[-18px]" />
        ) : status === '청약가능' ? (
          <img src="/icons/IPO_ready.svg" alt="청약가능" width={50} height={17} className="mt-[1px]" />
        ) : status === '청약예정' ? (
          <img src="/icons/IPO_upcoming.svg" alt="청약예정" width={50} height={17} className="mt-[1px]"/>
        ) : (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap',
              statusClassName,
            )}
          >
            {status}
          </span>
        )}
        {secondaryText && (
          <span className={cn('text-sm font-bold', secondaryClassName)}>{secondaryText}</span>
        )}
      </div>
    </div>
  )
}
