import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import dayjs from 'dayjs'
import { LinePath } from '@visx/shape'
import { curveNatural } from '@visx/curve'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { Header } from '@/components/common/Header'
import { IpoStockHeader } from '@/features/ipo/components/IpoStockHeader'
import { getSubscriptionStatusBadgeClass } from '@/features/ipo/utils/subscriptionStatus'
import { useToggleFavorite, useIpoNews, useIpoList, useIpoScore } from '@/features/ipo/hooks/useIpo'
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

const _RAW = [
  { year: '2024년',       sales: 80,  op: 30, net: 25 },
  { year: '2025년',       sales: 105, op: 43, net: 35 },
  { year: '2026년(추정)', sales: 0,   op: 57, net: 47 },
]
const _DOMAIN_MAX = Math.max(..._RAW.flatMap(d => [d.sales, d.op, d.net]))
const MOCK_CHART_DATA = _RAW.map(d => ({
  ...d,
  _groupMax: Math.max(...[d.sales, d.op, d.net].filter(v => v > 0), 0),
}))

const CHART_COLORS = ['#C5D1F5', '#5B7BE5', '#0922AC']
const CHART_MUTED = ['#EAECF0', '#D1D5DB', '#9AA0AB']

function BarShape({ x = 0, y = 0, width = 0, height = 0, fill, background, _groupMax }: { x?: number; y?: number; width?: number; height?: number; fill?: string; background?: { height: number }; _groupMax?: number }) {
  if (!height || height <= 0) {
    const ph = _groupMax ? Math.round((_groupMax / _DOMAIN_MAX) * (background?.height ?? 100)) : 45
    return <rect x={x + 1} y={y - ph} width={Math.max(width - 2, 0)} height={ph} rx={2} fill="#F3F4F6" stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="3 2" />
  }
  const r = Math.min(3, height)
  return <path d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`} fill={fill} />
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
  const listItem = listData?.data?.ipos?.find((i) => i.id === ipoId)
  const [showStickyInfo, setShowStickyInfo] = useState(false)
  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const [showNewsList, setShowNewsList] = useState(() => sessionStorage.getItem(`ipo-news-open-${ipoId}`) === 'true')
  const [selectedChartIdx, setSelectedChartIdx] = useState(MOCK_CHART_DATA.length - 1)
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
            onClick={() => toggleFav({ ipoId, isFavorite: ipo.isFavorite })}
            aria-label={ipo.isFavorite ? '관심 IPO 해제' : '관심 IPO 등록'}
            className="p-1"
          >
            <svg width="19" height="17" viewBox="-1 -0.5 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path
                d="M16.2503 2.40774C15.4111 0.899217 14.004 0 12.4854 0C10.2345 0 9.03662 1.52736 8.49986 2.50765C7.9631 1.52736 6.76523 0 4.51431 0C2.99575 0 1.5894 0.900036 0.749377 2.40774C-0.258193 4.21846 -0.249095 6.54102 0.77288 8.62036C2.26869 11.662 5.5939 14.3342 7.44301 15.6552C7.76446 15.8845 8.1314 16 8.49986 16C8.86832 16 9.23526 15.8845 9.55671 15.6552C11.4051 14.3342 14.731 11.662 16.2268 8.62036C17.2496 6.54102 17.2579 4.21846 16.2503 2.40774Z"
                fill={ipo.isFavorite ? '#CA3D40' : '#001936'}
                fillOpacity={ipo.isFavorite ? 1 : 0.31}
              />
            </svg>
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide overscroll-none">
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

        <section className="px-5 pt-5 pb-6 bg-white">
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
            after={score?.finalScore ?? 0}
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

        <section className="px-5 pt-5 pb-7 bg-white mt-[13px]">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[15px] font-bold text-[#111827]">실적 현황</p>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={MOCK_CHART_DATA} barCategoryGap="25%" barGap={3}>
                <YAxis domain={[0, _DOMAIN_MAX]} hide />
                <CartesianGrid vertical={false} stroke="#F0F1F4" strokeDasharray="" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={(props: { x: string | number; y: string | number; payload: { value: string }; index: number }) => (
                  <text x={props.x} y={Number(props.y) + 10} textAnchor="middle" fontSize={11} fontWeight={props.index === selectedChartIdx ? 700 : 400} fill={props.index === selectedChartIdx ? '#111827' : '#9AA0AB'}>
                    {props.payload.value}
                  </text>
                )} />
                <Bar dataKey="sales" shape={(p: any) => <BarShape {...p} />}>
                  {MOCK_CHART_DATA.map((_, idx) => <Cell key={idx} fill={idx === selectedChartIdx ? CHART_COLORS[0] : CHART_MUTED[0]} />)}
                </Bar>
                <Bar dataKey="op" shape={(p: any) => <BarShape {...p} />}>
                  {MOCK_CHART_DATA.map((_, idx) => <Cell key={idx} fill={idx === selectedChartIdx ? CHART_COLORS[1] : CHART_MUTED[1]} />)}
                </Bar>
                <Bar dataKey="net" shape={(p: any) => <BarShape {...p} />}>
                  {MOCK_CHART_DATA.map((_, idx) => <Cell key={idx} fill={idx === selectedChartIdx ? CHART_COLORS[2] : CHART_MUTED[2]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex" style={{ paddingBottom: 22 }}>
              {MOCK_CHART_DATA.map((_, idx) => (
                <div key={idx} className="flex-1 h-full" onPointerDown={() => setSelectedChartIdx(idx)} />
              ))}
            </div>
          </div>
          {(() => {
            const d = MOCK_CHART_DATA[selectedChartIdx]
            return (
              <div className="flex gap-14 mt-3 pl-4">
                {([['매출', d.sales, 0], ['영업이익', d.op, 1], ['순이익', d.net, 2]] as const).map(([label, value, ci]) => (
                  <div key={label} className="flex flex-col gap-[4px]">
                    <div className="flex items-center gap-[5px]">
                      <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: CHART_COLORS[ci] }} />
                      <span className="text-[11px] text-[#9AA0AB]">{label}</span>
                    </div>
                    <p className="text-[15px] font-bold text-[#111827]">
                      <span key={selectedChartIdx} className="animate-value-in">{value || '-'}</span>
                      {!!value && '조원'}
                    </p>
                  </div>
                ))}
              </div>
            )
          })()}
        </section>
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
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[20px] z-30 px-5 pb-5">
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
              className="w-full bg-[#7C6FEC] text-white py-3 rounded-[14px] font-semibold text-[16px] mt-2"
            >
              확인
            </button>
          </div>
        </>
      )}
    </div>
  )
}
