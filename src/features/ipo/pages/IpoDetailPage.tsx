import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import dayjs from 'dayjs'
import { Header } from '@/components/common/Header'
import { IpoStockHeader } from '@/features/ipo/components/IpoStockHeader'
import { IpoOfferingInfo } from '@/features/ipo/components/IpoOfferingInfo'
import {
  getSubscriptionStatusBadgeClass,
  type SubscriptionStatus,
} from '@/features/ipo/utils/subscriptionStatus'
import { useIpoDetail, useToggleFavorite, useIpoNews, useIpoScore } from '@/features/ipo/hooks/useIpo'
import { useSubscriptionList } from '@/features/ipo/hooks/useSubscriptions'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'
import { ClosedIpoDetailPage } from '@/features/ipo/pages/ClosedIpoDetailPage'

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

const MOCK_CHART_DATA = [
  { label: '25년 6월',  sub: null,    sales: 35, op: 12, net: 9  },
  { label: '25년 9월',  sub: null,    sales: 48, op: 18, net: 14 },
  { label: '25년 12월', sub: null,    sales: 62, op: 26, net: 21 },
  { label: '26년 3월',  sub: null,    sales: 90, op: 55, net: 45, highlight: true },
  { label: '26년 6월',  sub: '(추정)', sales: 95, op: 58, net: 47, dim: true },
]

const MOCK_LEGEND = [
  { label: '매출',    value: '133조원', color: '#D1D5DB' },
  { label: '영업이익', value: '57조원',  color: '#22C55E' },
  { label: '순이익',  value: '47조원',  color: '#6B7280' },
]

function BarChart({ data }: { data: typeof MOCK_CHART_DATA }) {
  const maxVal = 100
  const barW = 12, gap = 2, groupGap = 16
  const chartH = 90
  const groupW = barW * 3 + gap * 2
  const pl = 8
  const totalW = pl + data.length * (groupW + groupGap) - groupGap + pl

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + 36}`} className="w-full">
      {data.map((g, gi) => {
        const gx = pl + gi * (groupW + groupGap)
        const bars = [g.sales, g.op, g.net]
        const colors = g.dim
          ? ['#E5E7EB', '#86EFAC', '#9CA3AF']
          : ['#D1D5DB', '#22C55E', '#6B7280']
        return (
          <g key={gi}>
            {bars.map((v, vi) => {
              const bh = Math.max((v / maxVal) * chartH, 2)
              return (
                <rect
                  key={vi}
                  x={gx + vi * (barW + gap)}
                  y={chartH - bh}
                  width={barW}
                  height={bh}
                  rx={3}
                  fill={colors[vi]}
                  opacity={g.dim ? 0.65 : 1}
                />
              )
            })}
            <text x={gx + groupW / 2} y={chartH + 13} textAnchor="middle" fill="#9AA0AB" fontSize={9}>
              {g.label}
            </text>
            {g.sub && (
              <text x={gx + groupW / 2} y={chartH + 24} textAnchor="middle" fill="#9AA0AB" fontSize={9}>
                {g.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function NewsScoreGauge({ score }: { score: number }) {
  const size = 160
  const cx = 80, cy = 80, r = 60, sw = 13
  const circumference = 2 * Math.PI * r
  const filledLength = circumference * (score / 100)
  const [ready, setReady] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    let id1: number, id2: number, raf: number
    const duration = 1200
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        setReady(true)
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplayScore(Math.round(eased * score))
          if (t < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      })
    })
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); cancelAnimationFrame(raf) }
  }, [score])

  const getMessage = (s: number) => {
    if (s >= 70) return '긍정적인 흐름이에요!'
    if (s >= 40) return '중립적인 상황이에요'
    return '부정적인 반응이 있어요'
  }

  return (
    <div className="flex justify-center mt-6 mb-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="gauge-gradient" x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B4ABFF" />
              <stop offset="100%" stopColor="#5B4FE8" />
            </linearGradient>
          </defs>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke="#EAECF0" strokeWidth={sw}
          />
          {score > 0 && (
            <circle
              cx={cx} cy={cy} r={r}
              fill="none" stroke="url(#gauge-gradient)" strokeWidth={sw}
              strokeDasharray={circumference}
              strokeDashoffset={ready ? circumference - filledLength : circumference}
              strokeLinecap="round"
              transform={`rotate(-90, ${cx}, ${cy})`}
              style={{ transition: ready ? 'stroke-dashoffset 1.2s ease-out' : 'none' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <p className="text-[11px] text-[#6B7280]">{getMessage(score)}</p>
          <p className="text-[24px] font-bold text-[#535965]">{displayScore}점</p>
        </div>
      </div>
    </div>
  )
}

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  UPCOMING: '청약예정',
  OPEN: '청약가능',
  CLOSED: '청약종료',
}

export function IpoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const ipoId = Number(id)

  const [showScoreInfo, setShowScoreInfo] = useState(false)
  const [showNewsList, setShowNewsList] = useState(() => sessionStorage.getItem(`ipo-news-open-${ipoId}`) === 'true')
  const [_period, setPeriod] = useState<'분기' | '반기' | '연간'>('분기')
  const [showStickyInfo, setShowStickyInfo] = useState(false)
  const stockHeaderRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = stockHeaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyInfo(!entry.isIntersecting),
      { threshold: 0 },
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


  const { data, isLoading, isError } = useIpoDetail(ipoId)
  const { mutate: toggleFav } = useToggleFavorite()
  const { data: newsData } = useIpoNews(ipoId)
  const { data: scoreData } = useIpoScore(ipoId)
  const score = scoreData?.data
  const { data: subscriptionListData } = useSubscriptionList({ ipoId })
  const alreadySubscribed = (subscriptionListData?.data.subscriptions ?? []).some(
    (s) => s.subscriptionStatus !== 'CANCELLED',
  )

  if (isLoading) {
    return <div className="page-content" />
  }

  if (isNaN(ipoId) || isError || !data?.data) {
    return (
      <div className="mobile-container flex flex-col h-screen">
        <Header showBack showNotification={false} showMypage={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-text-secondary">종목 정보를 불러올 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="text-sm text-primary font-semibold">
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  const ipo = data.data

  if (ipo.ipoStatus === 'CLOSED') {
    return <ClosedIpoDetailPage ipoId={ipoId} ipo={ipo} />
  }

  const status = STATUS_MAP[ipo.ipoStatus] ?? '청약종료'
  const abbr = ipo.ticker.slice(0, 2).toUpperCase()
  const avatarColor = generateLogoColor(ipo.ticker)

  const priceDisplay =
    ipo.confirmedOfferPrice != null
      ? `USD ${ipo.confirmedOfferPrice.toFixed(2)}`
      : [ipo.offerPriceMin, ipo.offerPriceMax]
          .filter((p): p is number => p != null)
          .map((p) => `USD ${p.toFixed(2)}`)
          .join(' ~ ') || '미정'

  const sharesDisplay =
    ipo.numberOfShares != null ? `${ipo.numberOfShares.toLocaleString()} 주` : undefined

  const milestones = [
    { label: '청약시작일', date: ipo.subscriptionStartDate },
    { label: '청약마감일', date: ipo.subscriptionEndDate },
    { label: '상장(예정)일', date: ipo.listingDate },
    ipo.refundDate ? { label: '환불(예정)일', date: ipo.refundDate } : null,
  ]
    .filter((m): m is { label: string; date: string } => m != null && !!m.date)
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .map((m) => ({ ...m, date: dayjs(m.date).format('YYYY.MM.DD') }))

  const ddayTarget =
    status === '청약예정'
      ? (ipo.subscriptionStartDate ?? ipo.listingDate ?? null)
      : ipo.subscriptionEndDate
  const ddayDiff = ddayTarget ? dayjs(ddayTarget).startOf('day').diff(dayjs().startOf('day'), 'day') : null
  const dday =
    status === '청약종료' || ddayDiff === null
      ? ''
      : ddayDiff === 0
        ? 'D-Day'
        : ddayDiff > 0
          ? `D-${ddayDiff}`
          : `D+${Math.abs(ddayDiff)}`

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
            {ipo.confirmedOfferPrice != null && (
              <span className="text-[12px] font-bold text-[#111827] leading-none">
                ${ipo.confirmedOfferPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <section ref={stockHeaderRef} className="px-5 pt-4 pb-5 bg-white">
          <IpoStockHeader
            avatarText={abbr}
            avatarColor={avatarColor}
            logoUrl={ipo.logoUrl}
            name={ipo.companyName}
            ticker={ipo.ticker}
            status={status}
            statusClassName={getSubscriptionStatusBadgeClass(status)}
            secondaryText={dday || undefined}
            secondaryClassName={dday ? (status === '청약예정' ? 'text-[#3045BB]' : 'text-[#CA3D40]') : undefined}
          />
        </section>

        <section className="pl-[33px] pr-5 pt-[29px] pb-5 bg-white mt-[13px]">
          <IpoOfferingInfo
            offeringPrice={priceDisplay}
            offeringShares={sharesDisplay}
            milestones={milestones}
            footnote="※ 일정은 사전 고지없이 변경될 수 있습니다."
          />
        </section>

        <section className="px-5 pt-5 pb-6 bg-white mt-[13px]">
          <div className="flex items-center gap-1.5 mb-4">
            <p className="text-[15px] font-bold text-[#111827]">News Score</p>
            <button
              onClick={() => setShowScoreInfo(true)}
              className="w-[18px] h-[18px] rounded-full bg-[#E5E7EB] flex items-center justify-center text-[11px] font-bold text-[#6B7280]"
              style={{ marginTop: '0.5px' }}
            >
              ?
            </button>
          </div>

          <NewsScoreGauge score={score?.finalScore ?? 0} />

          <div className="mt-4">
            <style>{`
              @keyframes moli-rise-detail {
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
                  style={{ animation: 'moli-rise-detail 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards, moli-float 2.5s ease-in-out 0.9s infinite' }}
                />
              </div>
              <div className="relative flex-1 bg-[#F0EFFE] rounded-[12px] px-3 py-[10px]">
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
                className="flex items-center gap-2 mb-4 mt-3"
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
                <div className="flex items-center gap-0.5">
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

        <section className="px-5 pt-5 pb-4 bg-white mt-[13px]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-bold text-[#111827]">실적 현황</p>
            <button
              onClick={() => setPeriod((p) => p === '분기' ? '반기' : p === '반기' ? '연간' : '분기')}
              className="flex items-center gap-[3px] text-[13px] text-[#9AA0AB]"
            >
              분기 <ChevronDown size={14} />
            </button>
          </div>
          <BarChart data={MOCK_CHART_DATA} />
          <div className="flex gap-5 mt-3">
            {MOCK_LEGEND.map((l) => (
              <div key={l.label} className="flex flex-col gap-[4px]">
                <div className="flex items-center gap-[5px]">
                  <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[11px] text-[#9AA0AB]">{l.label}</span>
                </div>
                <p className="text-[15px] font-bold text-[#111827]">{l.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="px-5 py-4 bg-white border-t border-border shrink-0">
        {status === '청약종료' ? (
          <button
            onClick={() => navigate(`/securities/stocks/${id}`, { state: { tab: '호가' } })}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
          >
            주식 구매하기
          </button>
        ) : (
          <button
            onClick={() => navigate(`/ipo/${ipoId}/subscribe`)}
            disabled={status === '청약예정' || alreadySubscribed}
            className="w-full bg-primary disabled:bg-border disabled:text-text-tertiary text-white py-4 rounded-xl font-semibold text-base"
          >
            {alreadySubscribed ? '청약신청 완료' : '청약신청'}
          </button>
        )}
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
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-[#111827] mb-2">유의사항</p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  <span className="text-[12px] text-[#9AA0AB] shrink-0">•</span>
                  <p className="text-[12px] text-[#9AA0AB] leading-[1.6]">본 콘텐츠는 생성형 AI를 통해 투자정보를 요약한 것으로, 내용에 오류가 있을 수 있으며, 당사의 투자의견과 관계가 없습니다.</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[12px] text-[#9AA0AB] shrink-0">•</span>
                  <p className="text-[12px] text-[#9AA0AB] leading-[1.6]">본 콘텐츠는 단순 참고자료로 주식에 대한 투자의견 제시 및 투자를 권유하는 것이 아니며, 이를 활용한 투자의 책임은 투자자 본인에게 있습니다.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowScoreInfo(false)}
              className="w-full bg-[#7C6FEC] text-white py-3 rounded-[14px] font-semibold text-[16px]"
            >
              확인
            </button>
          </div>
        </>
      )}
    </div>
  )
}
