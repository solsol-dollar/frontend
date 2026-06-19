import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries, AreaSeries, CrosshairMode } from 'lightweight-charts'
import type { Time } from 'lightweight-charts'
import { cn } from '@/lib/utils'
import { useChartData } from '../hooks/useChartData'
import type { ChartCandle, ChartPeriod } from '../types/chart'

type PriceChartProps = {
  productId: string
  period: ChartPeriod
  className?: string
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const C = {
  up:            cssVar('--color-up'),
  down:          cssVar('--color-down'),
  border:        cssVar('--color-border'),
  textSecondary: cssVar('--color-text-secondary'),
  textTertiary:  cssVar('--color-text-tertiary'),
} as const

const AREA_CHART_OPTIONS = {
  layout: {
    background: { color: 'transparent' },
    textColor: C.textTertiary,
    fontSize: 10,
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: C.border },
  },
  crosshair: { mode: CrosshairMode.Normal },
  rightPriceScale: {
    borderVisible: false,
    scaleMargins: { top: 0.1, bottom: 0.1 },
  },
  timeScale: {
    borderVisible: false,
    timeVisible: false,
    fixRightEdge: true,
    rightOffset: 2,
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
  handleScale: { pinch: true, mouseWheel: false, axisPressedMouseMove: false },
} as const

const CHART_OPTIONS = {
  layout: {
    background: { color: 'transparent' },
    textColor: C.textSecondary,
    fontSize: 11,
  },
  grid: {
    vertLines: { color: C.border },
    horzLines: { color: C.border },
  },
  crosshair: { mode: CrosshairMode.Normal },
  rightPriceScale: { borderColor: C.border },
  timeScale: {
    borderColor: C.border,
    timeVisible: true,
    secondsVisible: false,
    fixRightEdge: true,
    rightOffset: 2,
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
  handleScale: { pinch: true, mouseWheel: false, axisPressedMouseMove: false },
} as const

const SERIES_OPTIONS = {
  upColor:        C.up,
  downColor:      C.down,
  borderUpColor:  C.up,
  borderDownColor: C.down,
  wickUpColor:    C.up,
  wickDownColor:  C.down,
} as const

// --color-up / --color-down 기반 에어리어 그라디언트 (15% 불투명도)
const AREA_UP_COLOR   = 'rgba(229,57,53,0.15)'
const AREA_DOWN_COLOR = 'rgba(21,101,192,0.15)'

function toTime(candle: ChartCandle): Time {
  if (candle.time) {
    const y  = candle.date.slice(0, 4)
    const mo = candle.date.slice(4, 6)
    const d  = candle.date.slice(6, 8)
    const h  = candle.time.slice(0, 2)
    const mi = candle.time.slice(2, 4)
    const s  = candle.time.slice(4, 6)
    // KIS 분봉은 미국 동부 현지 시각(EDT = UTC-4) 기준
    const etDate = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}-04:00`)
    return Math.floor(etDate.getTime() / 1000) as Time
  }
  return `${candle.date.slice(0, 4)}-${candle.date.slice(4, 6)}-${candle.date.slice(6, 8)}` as Time
}

export function PriceChart({ productId, period, className }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError } = useChartData(productId, period)
  const [detailed, setDetailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !data?.candles?.length) return

    const candles = data.candles
    const isUp = Number(candles[candles.length - 1].close) >= Number(candles[0].close)

    if (detailed) {
      const chart = createChart(containerRef.current, {
        ...CHART_OPTIONS,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })

      const series = chart.addSeries(CandlestickSeries, SERIES_OPTIONS)

      const chartData = candles
        .map((c) => ({
          time: toTime(c),
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
        }))
        .sort((a, b) => {
          const aTime = typeof a.time === 'number' ? a.time : new Date(a.time as string).getTime()
          const bTime = typeof b.time === 'number' ? b.time : new Date(b.time as string).getTime()
          return aTime - bTime
        })

      series.setData(chartData)
      chart.timeScale().fitContent()

      const ro = new ResizeObserver(() => {
        if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
      })
      ro.observe(containerRef.current)

      return () => { ro.disconnect(); chart.remove() }
    } else {
      const chart = createChart(containerRef.current, {
        ...AREA_CHART_OPTIONS,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })

      const areaData = candles
        .map((c) => ({ time: toTime(c), value: Number(c.close) }))
        .sort((a, b) =>
          (typeof a.time === 'number' ? a.time : new Date(a.time as string).getTime()) -
          (typeof b.time === 'number' ? b.time : new Date(b.time as string).getTime()),
        )

      const series = chart.addSeries(AreaSeries, {
        lineColor:   isUp ? C.up : C.down,
        topColor:    isUp ? AREA_UP_COLOR : AREA_DOWN_COLOR,
        bottomColor: 'rgba(0,0,0,0)',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      })
      series.setData(areaData)
      chart.timeScale().fitContent()

      const ro = new ResizeObserver(() => {
        if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
      })
      ro.observe(containerRef.current)

      return () => { ro.disconnect(); chart.remove() }
    }
  }, [data, detailed])

  if (isLoading) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="h-40 bg-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="h-40 flex items-center justify-center text-sm text-text-tertiary">
          차트 데이터를 불러올 수 없습니다
        </div>
      </div>
    )
  }

  if (!data?.candles?.length) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="h-40 flex items-center justify-center text-sm text-text-tertiary">
          해당 기간의 데이터가 없습니다
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div ref={containerRef} className={cn('w-full', detailed ? 'h-48' : 'h-40')} />
      <button
        onClick={() => setDetailed((d) => !d)}
        className="mt-2 text-xs text-text-tertiary underline underline-offset-2 self-end"
      >
        {detailed ? '간단히 보기' : '자세히 보기'}
      </button>
    </div>
  )
}
