import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import dayjs from 'dayjs'
import { LinePath } from '@visx/shape'
import { curveNatural } from '@visx/curve'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Header } from '@/components/common/Header'
import { IpoStockHeader } from '@/features/ipo/components/IpoStockHeader'
import { getSubscriptionStatusBadgeClass } from '@/features/ipo/utils/subscriptionStatus'
import { useToggleFavorite, useIpoNews, useIpoList, useIpoScore, useIpoFinancials } from '@/features/ipo/hooks/useIpo'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'
import type { IpoDetailItem } from '@/features/ipo/api/ipoApi'

const SOURCE_LOGO_MAP: Record<string, string> = {
  'Yahoo Finance': '/icons/Yahoo Finance.png',
  'uk.finance.yahoo.com': '/icons/Yahoo Finance.png',
  'sg.finance.yahoo.com': '/icons/Yahoo Finance.png',
  'Seeking Alpha': '/icons/Seeking Alpha.jpg',
  'Nasdaq': '/icons/Seeking Alpha.jpg',
  'GlobeNewsWire': '/icons/GlobeNewsWire.jpg',
  'CNBC': '/icons/CNBC.png',
  'investing.com': '/icons/investing.webp',
  'u.today': '/icons/utoday.png',
}

const CHART_COLORS = ['#C5D1F5', '#5B7BE5', '#0922AC']
const CHART_MUTED = ['#EAECF0', '#D1D5DB', '#9AA0AB']
const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£', BRL: 'R$', CNY: '¥', HKD: 'HK$', AUD: 'A$', CAD: 'C$' }

function BarShape({ x = 0, y = 0, width = 0, height = 0, fill, background, isNeg, nullDown, _isEmpty }: { x?: number; y?: number; width?: number; height?: number; fill?: string; background?: { x?: number; y?: number; width?: number; height?: number }; isNeg?: boolean; nullDown?: boolean; _isEmpty?: boolean }) {
  if (_isEmpty) return <g />
  if (!isNeg && (!height || Math.abs(height) < 1)) {
    const bh = background?.height ?? 100
    const by = background?.y ?? 0
    const zeroY = y
    if (nullDown) {
      const negH = (by + bh) - zeroY
      const ph = Math.max(Math.min(35, Math.round(negH * 0.7)), 4)
      return <rect x={x + 1} y={zeroY} width={Math.max(width - 2, 0)} height={ph} rx={2} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="3 2" />
    }
    const positiveH = zeroY - by
    const ph = Math.max(Math.min(35, Math.round(positiveH * 0.7)), 4)
    return <rect x={x + 1} y={zeroY - ph} width={Math.max(width - 2, 0)} height={ph} rx={2} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="3 2" />
  }
  if (isNeg) {
    const top = height < 0 ? y + height : y
    const bot = height < 0 ? y : y + height
    const h = Math.max(bot - top, 1)
    const r = Math.min(3, h)
    return <path d={`M${x},${top} L${x},${bot - r} Q${x},${bot} ${x + r},${bot} L${x + width - r},${bot} Q${x + width},${bot} ${x + width},${bot - r} L${x + width},${top} Z`} fill={fill} />
  }
  const r = Math.min(3, height)
  return <path d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`} fill={fill} />
}

type FinancialRow = { fiscalYear: number; revenue: number | null; operatingIncome: number | null; netIncome: number | null; currency: string; revenueKrw: number | null; operatingIncomeKrw: number | null; netIncomeKrw: number | null }

function buildChartData(financials: FinancialRow[], useKrw: boolean) {
  const k = (v: number | null) => v != null ? v * 1000 : null
  const getVals = (d: FinancialRow) => useKrw
    ? [k(d.revenueKrw), k(d.operatingIncomeKrw), k(d.netIncomeKrw)] as const
    : [k(d.revenue), k(d.operatingIncome), k(d.netIncome)] as const

  const currency = financials[0]?.currency ?? 'USD'
  const sym = CURRENCY_SYMBOL[currency] ?? currency
  const allAbs = financials.flatMap(d => getVals(d)).filter((v): v is number => v != null).map(v => Math.abs(v))
  const maxAbs = allAbs.length ? Math.max(...allAbs) : 0

  let divisor: number, unitPrefix: string, unitSuffix: string
  if (useKrw) {
    unitPrefix = ''
    if (maxAbs >= 1_000_000_000_000) { divisor = 1_000_000_000_000; unitSuffix = '조원' }
    else if (maxAbs >= 100_000_000) { divisor = 100_000_000; unitSuffix = '억원' }
    else if (maxAbs >= 10_000) { divisor = 10_000; unitSuffix = '만원' }
    else { divisor = 1; unitSuffix = '원' }
  } else {
    unitPrefix = sym
    if (maxAbs >= 100_000_000) { divisor = 100_000_000; unitSuffix = '억' }
    else if (maxAbs >= 10_000) { divisor = 10_000; unitSuffix = '만' }
    else { divisor = 1; unitSuffix = '' }
  }

  // null → 0 (점선), 음수 → 실제 음수값 (0 기준 아래로)
  const toBar = (v: number | null): number => {
    if (v == null) return 0
    const s = Math.round(Math.sqrt(Math.abs(v) / divisor) * 100) / 100
    return v < 0 ? -s : s
  }
  const toLabel = (v: number | null): string | null => {
    if (v == null) return null
    const sign = v < 0 ? '-' : ''
    const abs = Math.abs(v)
    let n = abs / divisor
    let pfx = unitPrefix
    let sfx = unitSuffix
    if (Math.floor(n * 10) / 10 === 0) {
      if (useKrw) {
        if (divisor >= 100_000_000) { n = abs / 10_000; sfx = '만원' }
        else if (divisor >= 10_000) { n = abs; sfx = '원' }
      } else {
        if (divisor >= 100_000_000) { n = abs / 10_000; sfx = '만' }
        else if (divisor >= 10_000) { n = abs; sfx = '' }
      }
    }
    const num = n >= 10 ? Math.floor(n).toLocaleString() : Math.floor(n * 10) / 10
    return `${sign}${pfx}${num}${sfx}`
  }

  const sorted = [...financials].sort((a, b) => a.fiscalYear - b.fiscalYear)
  const rows = sorted.map(d => {
    const [rv, oi, ni] = getVals(d)
    const sales = toBar(rv), op = toBar(oi), net = toBar(ni)
    return {
      year: `${d.fiscalYear}년`, sales, op, net,
      salesLabel: toLabel(rv), opLabel: toLabel(oi), netLabel: toLabel(ni),
      salesIsNeg: rv != null && rv < 0,
      opIsNeg: oi != null && oi < 0,
      netIsNeg: ni != null && ni < 0,
      salesNullDown: rv == null && oi != null && oi < 0 && ni != null && ni < 0,
      opNullDown: oi == null && rv != null && rv < 0 && ni != null && ni < 0,
      netNullDown: ni == null && rv != null && rv < 0 && oi != null && oi < 0,
      _groupMax: Math.max(Math.abs(sales), Math.abs(op), Math.abs(net)),
      _isEmpty: false,
    }
  })

  const allBarVals = rows.flatMap(r => [r.sales, r.op, r.net])
  const domainMax = Math.max(...allBarVals.filter(v => v > 0), 0.01)
  const domainMin = Math.min(...allBarVals.filter(v => v < 0), 0)
  const chartMin = domainMin < 0 ? domainMin : 0
  const blank = { year: '', sales: 0, op: 0, net: 0, salesLabel: null, opLabel: null, netLabel: null, salesIsNeg: false, opIsNeg: false, netIsNeg: false, salesNullDown: false, opNullDown: false, netNullDown: false, _groupMax: 0, _domainMax: domainMax, _domainMin: chartMin, _isEmpty: true }
  const padded = rows.map(r => ({ ...r, _domainMax: domainMax, _domainMin: chartMin }))
  while (padded.length < 3) padded.unshift({ ...blank })
  return { rows: padded, domainMax, chartMin, unitPrefix, unitSuffix, sym }
}


function NewsScoreChart({ before, after, offerPrice, currentPrice }: { before: number; after: number; offerPrice: number | null; currentPrice: number | null }) {
  const pathRef = useRef<SVGPathElement>(null)
  const dotGroupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const path = pathRef.current
    const dotGroup = dotGroupRef.current
    if (!path || !dotGroup) return

    const l = path.getTotalLength()
    path.style.strokeDasharray = String(l)
    path.style.strokeDashoffset = String(l)
    path.style.transition = 'none'
    dotGroup.style.opacity = '0'
    dotGroup.style.transform = 'scale(0.82) translateY(6px)'
    dotGroup.style.transformBox = 'fill-box'
    dotGroup.style.transformOrigin = 'center center'
    dotGroup.style.transition = 'none'

    const raf = requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
      path.style.strokeDashoffset = '0'
      dotGroup.style.transition = [
        'opacity 0.25s ease 1s',
        'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.15) 1s',
      ].join(', ')
      dotGroup.style.opacity = '1'
      dotGroup.style.transform = 'scale(1) translateY(0px)'
    })

    return () => {
      cancelAnimationFrame(raf)
      path.style.transition = 'none'
      path.style.strokeDashoffset = String(l)
      dotGroup.style.transition = 'none'
      dotGroup.style.opacity = '0'
      dotGroup.style.transform = 'scale(0.82) translateY(6px)'
    }
  }, [])

  const W = 300, H = 120
  const padX = 40, padTop = 25, padBottom = 30
  const x1 = padX
  const x2 = W - padX
  const fullSpan = H - padBottom - padTop
  const diff = Math.abs(before - after)
  const span = diff >= 25 ? fullSpan : (diff / 25) * fullSpan
  const midY = (padTop + H - padBottom) / 2
  const goingDown = before >= after
  const y1 = goingDown ? midY - span / 2 : midY + span / 2
  const y2 = goingDown ? midY + span / 2 : midY - span / 2

  const gap = 15
  const points = [
    { x: x1 + gap,                  y: y1 },
    { x: x1 + (x2 - x1) * 0.35,   y: y1 + (y2 - y1) * 0.15 },
    { x: x1 + (x2 - x1) * 0.65,   y: y1 + (y2 - y1) * 0.85 },
    { x: x2 - gap,                  y: y2 },
  ]

  return (
    <svg viewBox={`0 -16 ${W} ${H + 55}`} className="w-full">
      <text x={x1} y={y1 - 18} textAnchor="middle" fill="#3A3D45" fontSize={13} fontWeight={600}>
        {before}점
      </text>
      <line
        x1={x1} y1={y1 + 12} x2={x1} y2={H - 20}
        stroke="#C8CBD2" strokeWidth="2.5" strokeDasharray="5 6" strokeLinecap="round"
      />

      <LinePath
        innerRef={pathRef}
        data={points}
        x={(d) => d.x}
        y={(d) => d.y}
        curve={curveNatural}
        stroke="#7C6FEC"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset="1000"
      />

      <circle cx={x1} cy={y1} r={5.5} fill="white" stroke="#7C6FEC" strokeWidth={4} />

      <g ref={dotGroupRef}>
        <circle cx={x2} cy={y2} r={5.5} fill="white" stroke="#7C6FEC" strokeWidth={4} />
        <rect
          x={x2 - 22}
          y={y2 - 36}
          width={44}
          height={21}
          rx={3}
          fill="#7C6FEC"
          fillOpacity={0.22}
          transform={`translate(${x2}, ${y2 - 25}) skewX(-10) translate(-${x2}, -${y2 - 25})`}
        />
        <text x={x2} y={y2 - 25} textAnchor="middle" dominantBaseline="middle" fill="#5344A8" fontSize={13} fontWeight={700}>
          {after}점
        </text>
      </g>

      <text x={x1} y={H - 3} textAnchor="middle" fill="#9AA0AB" fontSize={13}>상장 전</text>
      {offerPrice != null && (
        <text x={x1} y={H + 13} textAnchor="middle" fill="#9AA0AB" fontSize={11}>
          (${offerPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
        </text>
      )}

      <text x={x2} y={H - 3} textAnchor="middle" fill="#111827" fontSize={13} fontWeight={600}>상장 후</text>
      {currentPrice != null && (
        <text x={x2} y={H + 13} textAnchor="middle" fill="#111827" fontSize={11} fontWeight={600}>
          (${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
        </text>
      )}
    </svg>
  )
}


interface Props {
  ipoId: number
  ipo: IpoDetailItem
}

export function ClosedIpoDetailPage({ ipoId, ipo }: Props) {
  const navigate = useNavigate()
  const { mutate: toggleFav } = useToggleFavorite()
  const { data: newsData } = useIpoNews(ipoId)
  const { data: listData } = useIpoList({ status: 'CLOSED' })
  const { data: scoreData } = useIpoScore(ipoId)
  const score = scoreData?.data
  const { data: financialsData } = useIpoFinancials(ipoId)
  const listItem = listData?.data?.ipos?.find((i) => i.id === ipoId)
  const [showStickyInfo, setShowStickyInfo] = useState(false)
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const [showNewsList, setShowNewsList] = useState(() => sessionStorage.getItem(`ipo-news-open-${ipoId}`) === 'true')
  const [selectedChartIdx, setSelectedChartIdx] = useState(0)
  const [showKrw, setShowKrw] = useState(false)
  const originalCurrency = financialsData?.data?.[0]?.currency ?? null
  const { rows: chartRows, domainMax: chartDomainMax, chartMin: chartDomainMin, sym: chartSym } = useMemo(
    () => financialsData?.data?.length ? buildChartData(financialsData.data, showKrw) : { rows: [], domainMax: 1, chartMin: 0, unitPrefix: '', unitSuffix: '억원', sym: '' },
    [financialsData, showKrw]
  )
  const exchangeRate = useMemo(() => {
    if (!showKrw || !originalCurrency || originalCurrency === 'KRW' || !financialsData?.data) return null
    const d = financialsData.data.find(item => item.revenue != null && item.revenueKrw != null && item.revenue !== 0)
    if (!d) return null
    const rate = d.revenueKrw! / d.revenue!
    return rate >= 100 ? Math.round(rate).toLocaleString() : (Math.round(rate * 10) / 10).toString()
  }, [financialsData, showKrw, originalCurrency])
  const stockHeaderRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = stockHeaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyInfo(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const saved = sessionStorage.getItem(`ipo-scroll-${ipoId}`)
    if (saved) el.scrollTop = Number(saved)
    const onScroll = () => sessionStorage.setItem(`ipo-scroll-${ipoId}`, String(el.scrollTop))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (chartRows.length > 0) setSelectedChartIdx(chartRows.length - 1)
  }, [chartRows.length])

  const status = '청약종료' as const
  const abbr = ipo.ticker.slice(0, 2).toUpperCase()
  const avatarColor = generateLogoColor(ipo.ticker)
  const currentPrice = listItem?.currentPrice ?? null
  const priceChangePct = listItem?.priceChangePercent ?? null
  const isUp = (priceChangePct ?? 0) >= 0

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        centerContent={showStickyInfo ? (
          <div className="flex flex-col items-center" style={{ gap: 3, lineHeight: 1, maxWidth: 'calc(100vw - 140px)' }}>
            <span className="text-[13px] font-normal text-[#9AA0AB] leading-none truncate max-w-full">
              {ipo.companyName}
            </span>
            <div className="flex items-center gap-[5px] leading-none">
              {currentPrice != null && (
                <span className="text-[12px] font-bold text-[#111827]">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              {priceChangePct != null && (
                <span className={`text-[11px] font-medium ${isUp ? 'text-[#CA3D40]' : 'text-[#3B82F6]'}`}>
                  (상장가 대비 {isUp ? '+' : ''}{priceChangePct}%)
                </span>
              )}
            </div>
          </div>
        ) : undefined}
        rightAction={
          <button
            onPointerDown={() => toggleFav({ ipoId, isFavorite: ipo.isFavorite })}
            aria-label={ipo.isFavorite ? '관심 IPO 해제' : '관심 IPO 등록'}
            className="p-3 -mr-2"
          >
            <svg width="22" height="20" viewBox="-1 -0.5 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path
                d="M16.2503 2.40774C15.4111 0.899217 14.004 0 12.4854 0C10.2345 0 9.03662 1.52736 8.49986 2.50765C7.9631 1.52736 6.76523 0 4.51431 0C2.99575 0 1.5894 0.900036 0.749377 2.40774C-0.258193 4.21846 -0.249095 6.54102 0.77288 8.62036C2.26869 11.662 5.5939 14.3342 7.44301 15.6552C7.76446 15.8845 8.1314 16 8.49986 16C8.86832 16 9.23526 15.8845 9.55671 15.6552C11.4051 14.3342 14.731 11.662 16.2268 8.62036C17.2496 6.54102 17.2579 4.21846 16.2503 2.40774Z"
                fill={ipo.isFavorite ? '#CA3D40' : '#001936'}
                fillOpacity={ipo.isFavorite ? 1 : 0.31}
              />
            </svg>
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide overscroll-none flex flex-col">
        <section ref={stockHeaderRef} className="px-5 pt-4 pb-5 bg-white">
          <IpoStockHeader
            avatarText={abbr}
            avatarColor={avatarColor}
            logoUrl={ipo.logoUrl}
            name={ipo.companyName}
            ticker={ipo.ticker}
            status={status}
            statusClassName={getSubscriptionStatusBadgeClass(status)}
          />
        </section>

        <div className="h-[13px] bg-[#F6F6F9]" />

        <section className={`px-5 pt-5 pb-6 bg-white${!financialsData?.data?.length ? ' flex-1' : ''}`}>
          <div className="flex items-center gap-[6px] mb-4">
            <p className="text-[15px] font-bold text-[#111827]">News Score</p>
            <button
              onClick={() => setShowScoreInfo(true)}
              className="w-[18px] h-[18px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0"
              style={{ marginTop: '0.5px' }}
            >
              <span className="text-[11px] font-bold text-[#6B7280]">?</span>
            </button>
          </div>

          <NewsScoreChart
            before={score?.finalScore ?? 0}
            after={score?.postScore ?? score?.finalScore ?? 0}
            offerPrice={ipo.confirmedOfferPrice}
            currentPrice={currentPrice}
          />

          <div className="mt-2">
            <style>{`
              @keyframes moli-rise {
                from { transform: translateY(100%); }
                to   { transform: translateY(15%); }
              }
              @keyframes moli-float {
                0%, 100% { transform: translateY(15%); }
                50%       { transform: translateY(8%); }
              }
            `}</style>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#7C6FEC] flex items-end justify-center">
                <img
                  src="/icons/moli.png"
                  alt=""
                  className="w-10 h-10 object-contain"
                  style={{ animation: 'moli-rise 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards, moli-float 2.5s ease-in-out 0.9s infinite' }}
                />
              </div>
              <div className="relative bg-[#F0EFFE] rounded-[12px] px-3 py-[10px]" style={{ maxWidth: 'calc(100% - 54px)' }}>
                <div
                  className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '7px solid #F0EFFE',
                  }}
                />
                <p className="text-[13px] text-[#3A3D45] leading-[1.6]">{score?.reason ?? ''}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5 pb-1 bg-white mt-[13px]">
          <p className="text-[15px] font-bold text-[#111827] mb-3">SOLSOL한 뉴스 요약</p>
          <div className="bg-[#F6F6F9] rounded-[12px] px-4 py-[14px] mb-4 flex flex-col gap-2 mt-4">
            {(score?.summary ?? '').split(/(?<=\.)\s+/).filter(Boolean).map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[13px] text-[#7C6FEC] shrink-0">•</span>
                <p className="text-[13px] text-[#3A3D45] leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
          {(() => {
            const sources = [...new Set((newsData?.data ?? []).map((n) => n.source))].slice(0, 4)
            if (sources.length === 0) return null
            return (
              <button
                className="flex items-center gap-2 mb-4"
                onClick={() => setShowNewsList((v) => { const next = !v; sessionStorage.setItem(`ipo-news-open-${ipoId}`, String(next)); return next })}
              >
                <div className="flex -space-x-1.5">
                  {sources.map((src, i) => {
                    const logo = SOURCE_LOGO_MAP[src]
                    return logo ? (
                      <img
                        key={i}
                        src={logo}
                        alt={src}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white bg-[#9AA0AB] flex items-center justify-center text-[9px] font-bold text-white"
                      >
                        {src[0]}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[#9AA0AB]">핵심 뉴스만 골랐어요!</span>
                  <ChevronDown
                    size={14}
                    className={`text-[#9AA0AB] transition-transform ${showNewsList ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
            )
          })()}

          {showNewsList && (
            <div className="overflow-visible">
              {(newsData?.data ?? []).map((n) => (
                <button
                  key={n.id}
                  onClick={() => navigate(`/ipo/${ipoId}/news/${n.id}`, { state: { news: n } })}
                  className="block w-full text-left py-3 px-3 -mx-3 rounded-sm border-b border-[#F0F1F4] last:border-0 transition-all duration-200 active:transition-none active:scale-[0.97] active:bg-[#F2F3F5] select-none"
                >
                  <p className="text-[14px] font-semibold text-[#111827] leading-snug">{n.title}</p>
                  <p className="text-[12px] text-[#9AA0AB] mt-1">
                    {n.source} · {dayjs(n.publishedAt).format('MM.DD')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {financialsData?.data?.length ? <section className="px-5 pt-5 pb-7 bg-white mt-[13px]">
          <div className="flex items-start justify-between mb-8">
            <p className="text-[15px] font-bold text-[#111827]">실적 현황</p>
            {originalCurrency && originalCurrency !== 'KRW' && (
              <div className="flex flex-col items-end gap-[5px]">
                <div className="flex bg-[#E9E9E9] rounded-[6px] p-0.5">
                  {([originalCurrency, 'KRW'] as const).map((cur) => (
                    <button
                      key={cur}
                      onPointerDown={() => setShowKrw(cur === 'KRW')}
                      className={`px-[6px] py-[1px] rounded-[6px] text-[11px] transition-colors ${(cur === 'KRW') === showKrw ? 'bg-white text-black font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.15)]' : 'text-[#999EA4] font-medium'}`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
                <span className={`text-[10px] text-[#9AA0AB] ${showKrw && exchangeRate ? '' : 'invisible'}`}>
                  1{chartSym} ≈ {exchangeRate ?? ''}원
                </span>
              </div>
            )}
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={138}>
              <BarChart data={chartRows} barCategoryGap="25%" barGap={3} margin={{ top: 0, right: 0, bottom: 2, left: 0 }}>
                <YAxis domain={[chartDomainMin < 0 ? Math.min(chartDomainMin, -(chartDomainMax / 2)) : 0, chartDomainMax]} hide ticks={[chartDomainMax / 2, chartDomainMax]} />
                <XAxis hide dataKey="year" />
                <CartesianGrid vertical={false} stroke="#F0F1F4" strokeDasharray="" />
                <ReferenceLine y={0} stroke="#D1D5DB" strokeWidth={1} />
                <Bar dataKey="sales" isAnimationActive={false} shape={(p: any) => <BarShape {...p} isNeg={p.salesIsNeg} nullDown={p.salesNullDown} />}>
                  {chartRows.map((_, idx) => <Cell key={idx} fill={idx === selectedChartIdx ? CHART_COLORS[0] : CHART_MUTED[0]} />)}
                </Bar>
                <Bar dataKey="op" isAnimationActive={false} shape={(p: any) => <BarShape {...p} isNeg={p.opIsNeg} nullDown={p.opNullDown} />}>
                  {chartRows.map((_, idx) => <Cell key={idx} fill={idx === selectedChartIdx ? CHART_COLORS[1] : CHART_MUTED[1]} />)}
                </Bar>
                <Bar dataKey="net" isAnimationActive={false} shape={(p: any) => <BarShape {...p} isNeg={p.netIsNeg} nullDown={p.netNullDown} />}>
                  {chartRows.map((_, idx) => <Cell key={idx} fill={idx === selectedChartIdx ? CHART_COLORS[2] : CHART_MUTED[2]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex outline-none select-none" style={{ paddingBottom: 22 }}>
              {chartRows.map((row, idx) => (
                <div key={idx} className="flex-1 h-full outline-none" onPointerDown={row._isEmpty ? undefined : () => setSelectedChartIdx(idx)} />
              ))}
            </div>
            <div className="flex pointer-events-none">
              {chartRows.map((row, idx) => (
                <div key={idx} className="flex-1 flex justify-center pt-2">
                  {!row._isEmpty && (
                    <span style={{ fontSize: 11, fontWeight: idx === selectedChartIdx ? 700 : 400, color: idx === selectedChartIdx ? '#111827' : '#9AA0AB' }}>
                      {row.year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {(() => {
            const d = chartRows[selectedChartIdx] ?? chartRows[chartRows.length - 1]
            if (!d) return null
            return (
              <div className="flex mt-3 pl-4">
                {(['매출', '영업이익', '순이익'] as const).map((label, ci) => {
                  const displayLabel = [d.salesLabel, d.opLabel, d.netLabel][ci]
                  return (
                    <div key={label} className="flex flex-col gap-[4px] flex-1 min-w-0">
                      <div className="flex items-center gap-[5px]">
                        <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[ci] }} />
                        <span className="text-[11px] text-[#9AA0AB]">{label}</span>
                      </div>
                      <p className="text-[15px] font-bold text-[#111827] whitespace-nowrap">
                        <span key={selectedChartIdx} className="animate-value-in">
                          {displayLabel ?? '-'}
                        </span>
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </section> : null}
      </div>

      <div className="px-5 py-4 bg-white border-t border-[#F0F1F4] shrink-0">
        <button
          onClick={() => navigate('/securities')}
          className="w-full bg-[#1A2E5A] text-white py-4 rounded-[14px] font-semibold text-[16px]"
        >
          증권 탭 이동하기
        </button>
      </div>

      {showScoreInfo && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-20"
            onClick={() => setShowScoreInfo(false)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-[20px] z-30 px-5 pb-5">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <h2 className="text-[18px] font-bold text-[#111827] mb-2 mt-4">News Score란 무엇인가요?</h2>
            <p className="text-[14px] text-[#6B7280] leading-[1.7] mb-6">
              News Score는 AI가 상장 전후 뉴스를 분석해 시장 심리를 점수화한 지표예요. 점수가 높을수록 긍정적인 반응이, 낮을수록 부정적인 반응이 많았음을 의미해요.
            </p>
            <div className="bg-[#F6F6F9] rounded-[12px] px-4 pt-3 pb-4 mb-6">
              <p className="text-[13px] font-semibold text-[#111827] mb-2">점수 기준</p>
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#CA3D40]">70~100</span>
                  <span className="text-[12px] text-[#6B7280]">긍정 이슈</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#111827]">40~69</span>
                  <span className="text-[12px] text-[#6B7280]">중립 이슈</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#3B82F6]">0~39</span>
                  <span className="text-[12px] text-[#6B7280]">부정 이슈</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowScoreInfo(false)}
              className="w-full bg-[#7C6FEC] text-white py-4 rounded-[14px] font-semibold text-[16px] mt-2"
            >
              확인
            </button>
          </div>
        </>
      )}
    </div>
  )
}
