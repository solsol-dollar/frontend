import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import cardHistoryImg from '@/assets/card/card_history.svg'
import coinImg from '@/assets/card/coin.svg'
import chalkLineImg from '@/assets/card/line.png'
import linoImg from '@/assets/card/lino.png'
import { useCardSummary, type CardSummary } from '../hooks/useCardSummary'
import { useCardCategoryTransactions } from '../hooks/useCardCategoryTransactions'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { Header } from '@/components/common/Header'
import { ChevronDown } from 'lucide-react'

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ── 오각형 레이더 ── */
const RADAR_AXES = ['여행', '쇼핑', '구독', '기타', '컨텐츠']

function SpendingRadar({ byCategory, selectedCategory, onSelectCategory }: { byCategory: CardSummary['byCategory'], selectedCategory: string | null, onSelectCategory: (c: string | null) => void }) {
  const { ref, inView } = useInView(0.4)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView) { setProgress(0); return }
    let startTime: number | null = null
    const duration = 900
    let raf: number
    const tick = (ts: number) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      setProgress(1 - Math.pow(1 - p, 2))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView])

  const N = 5
  const cx = 160, cy = 165, r = 110
  const values = RADAR_AXES.map(l => byCategory.find(c => c.category === l)?.amount ?? 0)
  const maxVal = Math.max(...values, 1)
  const norm = values.map(v => (v / maxVal) * progress)

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N
  const pt = (i: number, t: number) => ({
    x: cx + t * r * Math.cos(angle(i)),
    y: cy + t * r * Math.sin(angle(i)),
  })
  const gridPoly = (t: number) =>
    Array.from({ length: N }, (_, i) => pt(i, t)).map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div ref={ref} className="transition-transform duration-500 ease-out" style={{ transform: selectedCategory ? 'scale(0.75) translateY(-5px)' : 'scale(1) translateY(0)' }}>
      <svg width="320" height="340" viewBox="0 0 320 340" className="mx-auto" 
        onClick={() => selectedCategory && onSelectCategory(null)}
        style={{ cursor: selectedCategory ? 'pointer' : 'default', overflow: 'visible' }}>
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="dataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.5" />
          </linearGradient>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 배경 원 */}
        <circle cx={cx} cy={cy} r={r * 1.15} fill="url(#radarBg)" 
          onClick={() => selectedCategory && onSelectCategory(null)}
          className={selectedCategory ? "cursor-pointer" : ""}
        />

        {/* 격자 — 파스텔 톤 */}
        {([
          { t: 1/3, fill: 'rgba(255,182,193,0.13)', stroke: 'rgba(255,182,193,0.45)' },
          { t: 2/3, fill: 'rgba(200,170,255,0.12)', stroke: 'rgba(200,170,255,0.45)' },
          { t: 1,   fill: 'rgba(134,239,172,0.09)', stroke: 'rgba(134,239,172,0.40)' },
        ] as const).map(({ t, fill, stroke }, li) => (
          <polygon key={li} points={gridPoly(t)} fill={fill} stroke={stroke}
            strokeDasharray="5 3" strokeWidth="1.5" strokeLinejoin="round" />
        ))}

        {/* 축선 */}
        {Array.from({ length: N }, (_, i) => {
          const p = pt(i, 1)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" strokeWidth="1" />
        })}

        {/* 데이터 폴리곤 */}
        <polygon
          points={norm.map((v, i) => { const p = pt(i, v); return `${p.x},${p.y}` }).join(' ')}
          fill="url(#dataGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinejoin="round"
          onClick={() => selectedCategory && onSelectCategory(null)}
          className={selectedCategory ? "cursor-pointer" : ""}
        />

        {/* 꼭짓점 — 글로우 효과 */}
        {norm.map((v, i) => {
          const p = pt(i, v)
          return (
            <g key={i} filter="url(#dotGlow)">
              <circle cx={p.x} cy={p.y} r="10" fill="#2dd4bf" opacity="0.4" />
              <circle cx={p.x} cy={p.y} r="7" fill="#34d399" stroke="white" strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="2.5" fill="white" />
            </g>
          )
        })}

        {/* 라벨 */}
        {RADAR_AXES.map((label, i) => {
          const p = pt(i, 1.35)
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fontSize={selectedCategory ? "18" : "15"} fontWeight={selectedCategory === label ? "800" : "700"} 
              fill={selectedCategory && selectedCategory !== label ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.88)"} 
              fontFamily="sans-serif"
              cursor="pointer"
              onClick={(e) => { e.stopPropagation(); onSelectCategory(selectedCategory === label ? null : label); }}>
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

/* ── 계산기 (카운트업) ── */
function Calculator({ value }: { value: number }) {
  const { ref, inView } = useInView(0.5)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!inView || !value) { setDisplayed(0); return }
    let startTime: number | null = null
    const duration = 400
    let raf: number
    const tick = (ts: number) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(eased * value * 100) / 100)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <div ref={ref} className="rounded-2xl p-4" style={{ background: '#FA9FAE', boxShadow: '4px 6px 0 rgba(0,0,0,0.18)', width: 224 }}>
      <div className="rounded-lg mb-3 relative overflow-hidden" style={{ background: '#A8233C', height: 68 }}>
        {(() => {
          const formatted = displayed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          const placeholder = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\d/g, '0')
          const fontSize = value >= 10000 ? 16 : value >= 1000 ? 20 : 28
          const sharedStyle: React.CSSProperties = {
            right: 16, top: '50%', transform: 'translateY(-50%)',
            fontFamily: "'Orbitron', monospace", letterSpacing: '0.05em', fontSize,
          }
          return <>
            <span className="absolute font-bold select-none pointer-events-none"
              style={{ ...sharedStyle, color: 'rgba(255,220,220,0.22)' }}>
              {placeholder}
            </span>
            <span className="absolute font-bold" style={{ ...sharedStyle, color: '#fff0f2' }}>
              {formatted}
            </span>
          </>
        })()}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {['+', '-', '×', '='].map((op) => (
          <div key={op} className="rounded-lg py-4 text-center text-base font-bold"
            style={{ background: op === '=' ? '#EEB920' : '#DD5567', color: op === '=' ? '#7a5800' : 'white' }}>
            {op}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 동전 (낙하 애니메이션) ── */
function CoinStack({ count = 11 }: { count?: number }) {
  const { ref, inView } = useInView(0.3)
  return (
    <div ref={ref} className="flex justify-center">
      <style>{`
        @keyframes coinDrop {
          from { transform: translateY(-28px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src={coinImg}
          alt=""
          className="w-12 h-12 flex-shrink-0 mt-16"
          style={{
            marginLeft: i === 0 ? 0 : -26,
            opacity: inView ? undefined : 0,
            animation: inView ? `coinDrop 0.45s ease-out forwards` : 'none',
            animationDelay: inView ? `${i * 0.06}s` : '0s',
          }}
        />
      ))}
    </div>
  )
}

/* ── 분필 구분선 ── */
function ChalkLine() {
  return (
    <img src={chalkLineImg} alt="" className="w-full my-6" />
  )
}

/* ── 리노 말풍선 ── */
function LinoBubble() {
  const { ref, inView } = useInView(0.3)
  return (
    <div ref={ref} className="mt-16">
      <style>{`
        @keyframes lino-rise {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(15%);  opacity: 1; }
        }
        @keyframes bubble-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#98CBFE] flex items-end justify-center">
          <img
            src={linoImg}
            alt=""
            className="w-10 h-10 object-contain"
            style={inView
              ? { animation: 'lino-rise 0.6s 0.5s cubic-bezier(0.175,0.885,0.32,1.15) both' }
              : { transform: 'translateY(100%)', opacity: 0 }}
          />
        </div>
        <div
          className="relative bg-[#c5ede6] rounded-[12px] px-3 py-[10px]"
          style={{ maxWidth: 'calc(100% - 54px)' }}
        >
          <div
            className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '7px solid #c5ede6',
            }}
          />
          <p className="text-[15px] text-[#2a6b5e] leading-[1.6] break-keep">
            한화 환전 없이 달러로 직접 결제해 절약한 금액이에요
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── 스켈레톤 ── */
function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl ${className ?? ''}`}
      style={{ background: 'rgba(255,255,255,0.12)', animation: 'skPulse 1.4s ease-in-out infinite', ...style }}
    />
  )
}
function SkLight({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl ${className ?? ''}`}
      style={{ background: 'rgba(0,0,0,0.07)', animation: 'skPulse 1.4s ease-in-out infinite', ...style }}
    />
  )
}

/* ── 영수증 ── */
function Receipt({ amount, date, merchant }: { amount: number; date: string; merchant: string }) {
  return (
    <div className="relative w-full">
      <svg viewBox="0 0 320 12" className="block w-full" style={{ marginBottom: -1 }}>
        <path fill="#ffffff" d="M0,12 Q8,0 16,12 Q24,0 32,12 Q40,0 48,12 Q56,0 64,12 Q72,0 80,12 Q88,0 96,12 Q104,0 112,12 Q120,0 128,12 Q136,0 144,12 Q152,0 160,12 Q168,0 176,12 Q184,0 192,12 Q200,0 208,12 Q216,0 224,12 Q232,0 240,12 Q248,0 256,12 Q264,0 272,12 Q280,0 288,12 Q296,0 304,12 Q312,0 320,12 L320,0 L0,0 Z" />
      </svg>
      <div className="bg-white px-6 pt-6 pb-8" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-bold tracking-widest" style={{ color: '#aaa' }}>PRICE</span>
          <span className="text-3xl font-bold" style={{ background: 'linear-gradient(to top, #c8ffc8 35%, transparent 35%)', padding: '0 4px' }}>
            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-5">
          <span className="text-xs font-bold tracking-widest" style={{ color: '#aaa' }}>DATE</span>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <hr className="border-gray-100 mb-5" />
        <p className="text-sm font-black text-center leading-relaxed break-all">{merchant}</p>
      </div>
      <svg viewBox="0 0 320 12" className="block w-full" style={{ marginTop: -1 }}>
        <path fill="#ffffff" d="M0,0 Q8,12 16,0 Q24,12 32,0 Q40,12 48,0 Q56,12 64,0 Q72,12 80,0 Q88,12 96,0 Q104,12 112,0 Q120,12 128,0 Q136,12 144,0 Q152,12 160,0 Q168,12 176,0 Q184,12 192,0 Q200,12 208,0 Q216,12 224,0 Q232,12 240,0 Q248,12 256,0 Q264,12 272,0 Q280,12 288,0 Q296,12 304,0 Q312,12 320,0 L320,12 L0,12 Z" />
      </svg>
    </div>
  )
}

const NAVY = 'linear-gradient(180deg, #2c3e6b 0%, #2a4a6a 70%, #1f4a5c 100%)'
const NAVY2 = '#1f4a5c'
const MINT = '#f0faf4'

function ProgressBar({ active }: { active: number }) {
  return (
    <div className="w-full overflow-hidden" style={{ height: 3, background: 'rgba(0,0,0,0.08)' }}>
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${((active + 1) / 6) * 100}%`, background: '#2dd4bf' }}
      />
    </div>
  )
}

/* ── 페이지 ── */
export function CardHistoryPage() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [activeSection, setActiveSection] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const navigate = useNavigate()
  const { data: homeAssets } = useHomeAssets()
  const { data, isLoading } = useCardSummary(year, month)
  const { data: categoryTx } = useCardCategoryTransactions(year, month, selectedCategory)

  const totalAmount = data?.totalAmount ?? 0
  const savedAmountKrw = data?.fxSavings.savingsKrw ?? 0
  const topSpend = data?.topSpend
  const topDate = topSpend ? new Date(topSpend.transactedAt) : null

  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  useEffect(() => {
    const observers = sectionRefs.map((ref, i) => {
      if (!ref.current) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(i) },
        { threshold: 0.5 }
      )
      obs.observe(ref.current)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  const snap: React.CSSProperties = {
    scrollSnapAlign: 'start',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '8vh',
  }

  return (
    <div className="mobile-container flex flex-col h-screen" style={{ background: MINT }}>
      <style>{`
        @keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1f4a5c; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0 bg-white" style={{ zIndex: 50 }}>
        <Header showBack showNotification={false} showMypage={false} />
        <ProgressBar active={activeSection} />
      </div>
      

      {/* 스크롤 스냅 컨테이너 */}
      <div className="flex-1 overflow-y-scroll" style={{ scrollSnapType: 'y mandatory' }}>

        {/* ── 1: Hero ── */}
        <div ref={sectionRefs[0]} className="bg-white px-6 text-center relative" style={{ ...snap }}>
          <div>
            <p className="text-base font-medium text-gray-700">체인지업 카드로 결제한</p>
            <p className="flex items-center justify-center gap-2 text-2xl font-extrabold text-gray-900 mt-1.5">
              <span className="inline-flex items-center justify-center text-white text-xl font-black rounded-lg" style={{ width: 38, height: 38, background: '#222', flexShrink: 0 }}>
                {month}
              </span>
              월 소비 리포트
            </p>
            <div className="mt-10 flex justify-center">
              <img src={cardHistoryImg} alt="card history illustration" className="w-72 h-auto" />
            </div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center animate-bounce opacity-60 pointer-events-none w-full">
            <span className="text-[15px] font-extrabold text-text-secondary mb-1 tracking-tight whitespace-nowrap">아래로 넘겨보세요</span>
            <ChevronDown size={32} className="text-text-secondary" />
          </div>
        </div>

        {/* ── 2: 총 지출 + 계산기 ── */}
        <div ref={sectionRefs[1]} className="px-6" style={{ ...snap, background: NAVY }}>
          <div>
            <p className="text-[22px] font-medium leading-relaxed text-white">
              이번 달 체인지업 카드로<br />소비한 금액은 ?
            </p>
            <div className="flex justify-center mt-10">
              {isLoading
                ? <Sk style={{ width: 232, height: 280, borderRadius: 16 }} />
                : <Calculator value={totalAmount} />
              }
            </div>
          </div>
        </div>

        {/* ── 3: 레이더 차트 ── */}
        <div ref={sectionRefs[2]} className="px-6" style={{ ...snap, background: NAVY2 }}>
          <div className="flex flex-col h-full justify-center">
            <div className={`transition-all duration-300 ${selectedCategory ? 'mb-0 mt-6' : 'mb-8'}`}>
              <p className={`font-medium transition-all duration-500 ${selectedCategory ? 'text-[16px]' : 'text-[19px]'}`} style={{ color: '#ffffffcc' }}>어떤 곳에서 가장 많이 사용했을까?</p>
              <div className={`transition-all duration-300 overflow-hidden ${selectedCategory ? 'max-h-0 opacity-0' : 'max-h-[30px] opacity-100 mt-1.5'}`}>
                <p className="text-[13px] font-medium" style={{ color: '#ffffff88' }}>카테고리를 클릭하면 사용내역을 보여드려요</p>
              </div>
            </div>
            {isLoading
              ? <Sk className="mx-auto" style={{ width: 280, height: 280, borderRadius: '50%' }} />
              : data?.byCategory && data.byCategory.length > 0 && <SpendingRadar byCategory={data.byCategory} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            }
            
            <div className={`transition-all duration-500 ease-out overflow-hidden flex flex-col ${selectedCategory ? 'flex-1 max-h-[65dvh] opacity-100 mb-2 -mt-4' : 'max-h-0 opacity-0 mb-0'}`}>
              <div className="bg-white/10 rounded-3xl p-5 overflow-y-auto flex-1 shadow-inner backdrop-blur-md custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-[15px]">{selectedCategory}</h3>
                    <span className="text-white/80 text-[14px] font-semibold">총 ${(data?.byCategory.find(c => c.category === selectedCategory)?.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-white/70 text-[15px] font-medium">{categoryTx?.length ?? 0}건</p>
                </div>
                {categoryTx?.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3.5 border-b border-white/10 last:border-0">
                    <div>
                      <p className="text-[17px] font-bold text-white">{tx.merchantName}</p>
                      <p className="text-[14px] text-white/60 mt-1">{new Date(tx.transactedAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className="text-[19px] font-bold text-white">
                      {tx.currency === 'USD' ? '$' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: tx.currency === 'USD' ? 2 : 0 })}
                      {tx.currency === 'KRW' ? '원' : ''}
                    </p>
                  </div>
                ))}
                {!categoryTx?.length && <p className="text-center text-white/60 py-8 text-sm">결제 내역이 없습니다.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4: 절약 금액 + 동전 ── */}
        <div ref={sectionRefs[3]} className="px-6 text-center" style={{ ...snap, background: MINT }}>
          <div className="w-full">
            <p className="text-lg font-normal text-gray-800">
              이번 달 소비에서 <strong className="font-bold">아낀 금액</strong>은
            </p>
            {isLoading
              ? <SkLight className="mt-3 mx-auto" style={{ height: 32, width: 160 }} />
              : <p className="text-2xl font-black mt-3" style={{ textDecoration: 'underline', textDecorationColor: '#7dd8c0', textUnderlineOffset: 4 }}>
                  총 {savedAmountKrw.toLocaleString('ko-KR')}원
                </p>
            }
            <div className="mt-8"><CoinStack /></div>
            <ChalkLine />
            <LinoBubble />
          </div>
        </div>

        {/* ── 5: 최대 지출 영수증 ── */}
        <div ref={sectionRefs[4]} className="px-6" style={{ ...snap, background: MINT }}>
          <div className="w-full">
            <p className="text-center text-lg font-normal text-gray-900 mb-7">
              이번 달 <strong className="font-bold">가장 큰 소비</strong>는
            </p>
            {isLoading
              ? <SkLight style={{ height: 200, borderRadius: 16 }} />
              : topSpend && (
                <>
                  <Receipt
                    amount={topSpend.amount}
                    date={topDate ? `${topDate.getFullYear()}.${String(topDate.getMonth() + 1).padStart(2, '0')}.${String(topDate.getDate()).padStart(2, '0')}` : ''}
                    merchant={topSpend.merchantName}
                  />
                  <div className="text-center mt-8 text-sm leading-relaxed" style={{ color: '#666' }}>
                    {topDate && `${topDate.getFullYear()}년 ${String(topDate.getMonth() + 1).padStart(2, '0')}월 ${String(topDate.getDate()).padStart(2, '0')}일에`}
                    <br />
                    {topSpend.merchantName}에서
                    <br />
                    <strong className="text-lg font-black" style={{ color: '#222', background: 'linear-gradient(to top, #c8ffc8 35%, transparent 35%)', padding: '0 2px' }}>
                      ${topSpend.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>{' '}
                    결제했어요
                  </div>
                </>
              )
            }
          </div>
        </div>

        {/* ── 6: 완료 페이지 ── */}
        <div ref={sectionRefs[5]} className="px-6 flex flex-col items-center justify-center text-center" style={{ ...snap, background: MINT }}>
          <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              이번 달 소비 분석 완료!
            </h2>
            <p className="text-gray-600 mb-12 leading-relaxed text-lg">
              매달 1일 이전 달의<br />소비 리포트를 보내드려요!
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[280px] mx-auto mt-6">
              <button 
                className="bg-[#1f4a5c] text-white text-[16px] font-semibold py-[16px] px-6 rounded-[18px] shadow-sm active:scale-[0.97] transition-all"
                onClick={() => {
                  const depositAccount = homeAssets?.accounts.find(a => a.accountType === 'DEPOSIT')
                  if (depositAccount) {
                    navigate('/home/transfer/history', { 
                      state: {
                        accountIds: [depositAccount.accountId],
                        accountName: depositAccount.accountName,
                        accountNumber: depositAccount.accountNumberMasked,
                        accountType: depositAccount.accountType,
                        balance: depositAccount.balance,
                        initialFilter: '체크카드'
                      }
                    })
                  }
                }}
              >
                카드 사용 내역 보러가기
              </button>
              <button 
                className="bg-white text-[#1f4a5c] text-[16px] font-semibold py-[16px] px-6 rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-[0.97] transition-all"
                onClick={() => alert('알림이 설정되었습니다.')}
              >
                매달 리포트 알림 받기
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
