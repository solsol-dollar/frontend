import { useEffect, useRef, useState } from 'react'

interface ScrollingTextProps {
  text: string
  className?: string
}

export function ScrollingText({ text, className }: ScrollingTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(0)

  useEffect(() => {
    const wrap = wrapRef.current
    const el = textRef.current
    if (!wrap || !el) return
    const measure = () => setOverflow(Math.max(0, el.scrollWidth - wrap.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [text])

  const style: React.CSSProperties = overflow > 0
    ? {
        display: 'inline-block',
        animation: 'scrolling-text-scroll 7s ease-in-out infinite',
        ['--scroll-amount' as string]: `-${overflow}px`,
      }
    : {}

  return (
    <div ref={wrapRef} className="overflow-hidden">
      <style>{`
        @keyframes scrolling-text-scroll {
          0%, 20%  { transform: translateX(0); }
          80%, 100% { transform: translateX(var(--scroll-amount)); }
        }
      `}</style>
      <span ref={textRef} className={className} style={{ ...style, whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </div>
  )
}
