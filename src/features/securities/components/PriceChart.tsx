import { useEffect, useRef, useState } from 'react'
// import { useQuery } from '@tanstack/react-query' // 실시간 기능 비활성화
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  HistogramSeries,
  CrosshairMode,
} from 'lightweight-charts'
import type { IChartApi, Time } from 'lightweight-charts'
// import type { ISeriesApi } from 'lightweight-charts' // 실시간 기능 비활성화
import { cn } from '@/lib/utils'
// import { serviceApi } from '@/lib/axios' // 실시간 기능 비활성화
import { useChartData } from '../hooks/useChartData'
import type { ChartCandle, ChartPeriod } from '../types/chart'

type PriceChartProps = {
  productId: string
  period: ChartPeriod
  realtime?: boolean
  className?: string
}

// 이동평균선 설정: [기간, 색상, 레이블]
const MA_CONFIGS: [number, string, string][] = [
  [5,  '#FF6B35', 'MA5'],
  [20, '#4CAF50', 'MA20'],
  [60, '#9C27B0', 'MA60'],
]

// 거래량 캔들 색상 (상승=빨강 60%, 하락=파랑 60%)
const VOL_UP   = 'rgba(229,57,53,0.55)'
const VOL_DOWN = 'rgba(21,101,192,0.55)'

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function toTime(candle: ChartCandle): Time {
  if (candle.time) {
    const y = candle.date.slice(0, 4), mo = candle.date.slice(4, 6), d = candle.date.slice(6, 8)
    const h = candle.time.slice(0, 2), mi = candle.time.slice(2, 4), s = candle.time.slice(4, 6)
    return Math.floor(new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}-04:00`).getTime() / 1000) as Time
  }
  return `${candle.date.slice(0, 4)}-${candle.date.slice(4, 6)}-${candle.date.slice(6, 8)}` as Time
}

function sortByTime<T extends { time: Time }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const at = typeof a.time === 'number' ? a.time : new Date(a.time as string).getTime()
    const bt = typeof b.time === 'number' ? b.time : new Date(b.time as string).getTime()
    return at - bt
  })
}

function calcMA(
  data: { time: Time; close: number }[],
  maPeriod: number,
): { time: Time; value: number }[] {
  return data
    .map((c, i) => {
      if (i < maPeriod - 1) return null
      const avg = data.slice(i - maPeriod + 1, i + 1).reduce((s, cc) => s + cc.close, 0) / maPeriod
      return { time: c.time, value: avg }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
}

export function PriceChart({ productId, period, realtime = false, className }: PriceChartProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const chartRef      = useRef<IChartApi | null>(null)
  // const seriesRef  = useRef<ISeriesApi<'Area'> | null>(null) // 실시간 기능 비활성화
  const barSpacingRef = useRef(10)

  // OHLC 표시용 — crosshair 이동 시 setState 없이 DOM 직접 업데이트
  const ohlcOpenRef  = useRef<HTMLSpanElement>(null)
  const ohlcHighRef  = useRef<HTMLSpanElement>(null)
  const ohlcLowRef   = useRef<HTMLSpanElement>(null)

  /* 실시간 기능 비활성화 (고도화 시 복원)
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null)
  const isUpRef    = useRef(true)
  const lastTimeRef = useRef<Time | null>(null)
  */

  const { data, isLoading, isError } = useChartData(productId, period)
  const [detailed, setDetailed] = useState(false)

  /* 실시간 현재가 폴링 (5초)
  const { data: realtimePrice } = useQuery({
    queryKey: ['price-rt', productId],
    queryFn: async () => {
      const res = await serviceApi.get(`/api/service/api/v1/securities/products/${productId}`)
      return ((res as unknown as { data: { price: number } }).data).price
    },
    enabled: realtime && !!productId,
    refetchInterval: 5000,
    staleTime: 0,
  })
  */

  useEffect(() => {
    if (!containerRef.current || !data?.candles?.length) return

    const C = {
      up:            cssVar('--color-up'),
      down:          cssVar('--color-down'),
      border:        cssVar('--color-border'),
      textSecondary: cssVar('--color-text-secondary'),
      textTertiary:  cssVar('--color-text-tertiary'),
    }
    const candles = data.candles

    // ── 상세 모드: 캔들스틱 + MA + 거래량 ──────────────────────────
    if (detailed) {
      const chart = createChart(containerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: C.textSecondary,
          fontSize: 11,
          attributionLogo: false,
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
          rightOffset: 3,
          barSpacing: barSpacingRef.current,
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { pinch: true, mouseWheel: true, axisPressedMouseMove: true },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
      chartRef.current = chart

      // 캔들스틱 시리즈 (pane 0)
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor:         C.up,
        downColor:       C.down,
        borderUpColor:   C.up,
        borderDownColor: C.down,
        wickUpColor:     C.up,
        wickDownColor:   C.down,
      })

      const chartData = sortByTime(
        candles.map((c) => ({
          time:   toTime(c),
          open:   Number(c.open),
          high:   Number(c.high),
          low:    Number(c.low),
          close:  Number(c.close),
          volume: Number(c.volume),
        })),
      )

      candleSeries.setData(chartData)

      // MA 오버레이 — 일봉에서만
      if (period === '1D') {
        MA_CONFIGS.forEach(([maPeriod, color]) => {
          if (chartData.length < maPeriod) return
          const maSeries = chart.addSeries(LineSeries, {
            color,
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          })
          maSeries.setData(calcMA(chartData, maPeriod))
        })
      }

      // 거래량 히스토그램 (pane 1)
      const volumeSeries = chart.addSeries(
        HistogramSeries,
        { priceFormat: { type: 'volume' }, priceScaleId: 'vol' },
        1,
      )
      volumeSeries.setData(
        chartData.map((c) => ({
          time:  c.time,
          value: c.volume,
          color: c.close >= c.open ? VOL_UP : VOL_DOWN,
        })),
      )
      // 거래량 pane 높이 고정
      chart.panes()[1]?.setHeight(68)

      // 우측 최신 봉부터 barSpacing 기준으로 자연 표시 (fitContent 미사용)
      chart.timeScale().scrollToRealTime()

      // OHLC 초기값 표시 및 crosshair 연동
      const updateOhlc = (o: number, h: number, l: number) => {
        if (ohlcOpenRef.current) ohlcOpenRef.current.textContent = `$${o.toFixed(2)}`
        if (ohlcHighRef.current) ohlcHighRef.current.textContent = `$${h.toFixed(2)}`
        if (ohlcLowRef.current)  ohlcLowRef.current.textContent  = `$${l.toFixed(2)}`
      }

      if (chartData.length > 0) {
        const last = chartData[chartData.length - 1]
        updateOhlc(last.open, last.high, last.low)

        chart.subscribeCrosshairMove((param) => {
          const d = param.seriesData?.get(candleSeries) as
            | { open: number; high: number; low: number }
            | undefined
          if (d && 'open' in d) {
            updateOhlc(d.open, d.high, d.low)
          } else {
            updateOhlc(last.open, last.high, last.low)
          }
        })
      }

      const ro = new ResizeObserver(() => {
        if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
      })
      ro.observe(containerRef.current)

      return () => {
        chartRef.current = null
        ro.disconnect()
        chart.remove()
      }
    }

    // ── 간단 모드: 영역 차트 ────────────────────────────────────────
    const isUp = Number(candles[candles.length - 1].close) >= Number(candles[0].close)
    // isUpRef.current = isUp // 실시간 dot 색상용 — 고도화 시 복원

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: C.textTertiary,
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: C.border },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderVisible: false, timeVisible: false, fixRightEdge: true, rightOffset: 2 },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
      handleScale: { pinch: false, mouseWheel: false, axisPressedMouseMove: false },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })

    const areaData = sortByTime(candles.map((c) => ({ time: toTime(c), value: Number(c.close) })))

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor:   isUp ? C.up : C.down,
      topColor:    isUp ? 'rgba(229,57,53,0.15)' : 'rgba(21,101,192,0.15)',
      bottomColor: 'rgba(0,0,0,0)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    })
    areaSeries.setData(areaData)

    chart.timeScale().fitContent()

    /* 실시간 모드: seriesRef 연결 + 중앙 스크롤 + 초기 dot 위치 계산 (고도화 시 복원)
    if (realtime) {
      chart.timeScale().scrollToPosition(areaData.length / 2, false)
      seriesRef.current = areaSeries
      const last = areaData[areaData.length - 1]
      if (last) {
        lastTimeRef.current = last.time
        requestAnimationFrame(() => {
          const x = chart.timeScale().timeToCoordinate(last.time)
          const y = areaSeries.priceToCoordinate(last.value)
          if (x !== null && y !== null) setDotPos({ x, y })
        })
      }
    }
    */

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
  }, [data, detailed, period, realtime])

  /* 실시간 가격 수신 → 마지막 봉 제자리 업데이트 + dot 위치 갱신 (고도화 시 복원)
  useEffect(() => {
    if (!realtime || realtimePrice == null || !seriesRef.current || !chartRef.current) return
    if (lastTimeRef.current == null) return
    seriesRef.current.update({ time: lastTimeRef.current, value: realtimePrice })
    requestAnimationFrame(() => {
      if (!seriesRef.current || !chartRef.current || lastTimeRef.current == null) return
      const x = chartRef.current.timeScale().timeToCoordinate(lastTimeRef.current)
      const y = seriesRef.current.priceToCoordinate(realtimePrice)
      if (x !== null && y !== null) setDotPos({ x, y })
    })
  }, [realtimePrice, realtime])
  */

  // ── 로딩 / 에러 / 빈 데이터 ──────────────────────────────────────
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

  // ── 렌더 ─────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col', className)}>

      {/* 상단: 자세한 차트 토글 (좌) + OHLC (우) */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={() => setDetailed((v) => !v)}
          className="flex items-center gap-1.5"
        >
          <span className={cn(
            'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
            detailed ? 'bg-primary' : 'border border-border bg-white',
          )}>
            {detailed && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className={cn('text-xs font-medium', detailed ? 'text-primary' : 'text-text-tertiary')}>
            자세한 차트
          </span>
        </button>

        {/* OHLC — crosshair 움직임에 따라 DOM 직접 업데이트 */}
        {detailed && (
          <div className="flex gap-3 text-[11px] text-text-tertiary">
            <span>시 <span ref={ohlcOpenRef} className="text-text-secondary font-medium">—</span></span>
            <span className="text-up">고 <span ref={ohlcHighRef} className="font-medium">—</span></span>
            <span className="text-down">저 <span ref={ohlcLowRef} className="font-medium">—</span></span>
          </div>
        )}
      </div>

      {/* 차트 캔버스 */}
      <div
        ref={containerRef}
        className={cn('w-full rounded-sm overflow-hidden', detailed ? 'h-[260px]' : 'h-40')}
      />
      {/* 실시간 pulsing dot — 고도화 시 복원
      {realtime && dotPos && (
        <div className="absolute pointer-events-none" style={{ left: dotPos.x - 5, top: dotPos.y - 5 }}>
          <span className={`absolute inline-flex h-[10px] w-[10px] rounded-full ${isUpRef.current ? 'bg-up' : 'bg-down'} opacity-60 animate-ping`} />
          <span className={`relative inline-flex h-[10px] w-[10px] rounded-full ${isUpRef.current ? 'bg-up' : 'bg-down'}`} />
        </div>
      )}
      */}

      {/* MA 범례 — 자세히 보기 + 일봉 한정 */}
      {detailed && period === '1D' && (
        <div className="flex gap-3 mt-1.5">
          {MA_CONFIGS.map(([, color, label]) => (
            <span key={label} className="flex items-center gap-1 text-[10px] text-text-tertiary">
              <span style={{ color, fontSize: 9 }}>■</span>{label}
            </span>
          ))}
          <span className="flex items-center gap-1 text-[10px] text-text-tertiary ml-1">
            <span style={{ fontSize: 9 }}>▐</span>거래량
          </span>
        </div>
      )}
    </div>
  )
}
