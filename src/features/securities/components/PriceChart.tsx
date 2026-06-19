import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries, AreaSeries, CrosshairMode } from 'lightweight-charts'
import type { Time } from 'lightweight-charts'
import { cn } from '@/lib/utils'
import { useChartData } from '../hooks/useChartData'
import type { ChartCandle, ChartPeriod } from '../types/chart'

interface PriceChartProps {
  productId: string
  period: ChartPeriod
  className?: string
}

const AREA_CHART_OPTIONS = {
  layout: {
    background: { color: 'transparent' },
    textColor: '#9CA3AF',
    fontSize: 10,
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: '#F3F4F6' },
  },
  crosshair: { mode: CrosshairMode.Normal },
  rightPriceScale: {
    borderVisible: false,
    scaleMargins: { top: 0.1, bottom: 0.1 },
  },
  timeScale: {
    borderVisible: false,
    timeVisible: false,
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
  handleScale: { pinch: true, mouseWheel: false, axisPressedMouseMove: false },
} as const

const CHART_OPTIONS = {
  layout: {
    background: { color: 'transparent' },
    textColor: '#6B7280',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: '#E5E7EB' },
    horzLines: { color: '#E5E7EB' },
  },
  crosshair: { mode: CrosshairMode.Normal },
  rightPriceScale: { borderColor: '#E5E7EB' },
  timeScale: {
    borderColor: '#E5E7EB',
    timeVisible: true,
    secondsVisible: false,
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
  handleScale: { pinch: true, mouseWheel: false, axisPressedMouseMove: false },
} as const

const SERIES_OPTIONS = {
  upColor: '#E53935',        // --color-up (한국 관습: 빨강=상승)
  downColor: '#1565C0',      // --color-down (파랑=하락)
  borderUpColor: '#E53935',
  borderDownColor: '#1565C0',
  wickUpColor: '#E53935',
  wickDownColor: '#1565C0',
} as const

/**
 * ChartCandle → lightweight-charts Time 변환
 *
 * - 1D(분봉): date(YYYYMMDD) + time(HHMMSS) → ET(EDT -04:00) 기준 UTC Unix 초
 * - DAY/WEEK/MONTH: "20260618" → "2026-06-18" 문자열 (LWC BusinessDay)
 */
function toTime(candle: ChartCandle): Time {
  if (candle.time) {
    const y = candle.date.slice(0, 4)
    const mo = candle.date.slice(4, 6)
    const d = candle.date.slice(6, 8)
    const h = candle.time.slice(0, 2)
    const mi = candle.time.slice(2, 4)
    const s = candle.time.slice(4, 6)
    // KIS 분봉 시간은 미국 동부(현지) 기준, EDT = UTC-4 (MVP: EDT 고정)
    const etDate = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}-04:00`)
    return Math.floor(etDate.getTime() / 1000) as Time
  }
  // 일봉/주봉/월봉: "20260618" → "2026-06-18"
  return `${candle.date.slice(0, 4)}-${candle.date.slice(4, 6)}-${candle.date.slice(6, 8)}` as Time
}

export function PriceChart({ productId, period, className }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError } = useChartData(productId, period)
  const [detailed, setDetailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !data?.candles?.length) return

    const candles = data.candles

    // 상승/하락 판단
    const isUp =
      Number(candles[candles.length - 1].close) >= Number(candles[0].close)
    const lineColor   = isUp ? '#E53935' : '#1565C0'
    const topColor    = isUp ? 'rgba(229,57,53,0.15)' : 'rgba(21,101,192,0.15)'
    const bottomColor = 'rgba(0,0,0,0)'

    if (detailed) {
      // CandlestickSeries (자세히 보기)
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
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth })
        }
      })
      ro.observe(containerRef.current)

      return () => {
        ro.disconnect()
        chart.remove()
      }
    } else {
      // AreaSeries (기본 뷰 — 토스 스타일)
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
        lineColor,
        topColor,
        bottomColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      })
      series.setData(areaData)
      chart.timeScale().fitContent()

      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth })
        }
      })
      ro.observe(containerRef.current)

      return () => {
        ro.disconnect()
        chart.remove()
      }
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
