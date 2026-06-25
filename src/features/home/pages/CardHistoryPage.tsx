import { useNavigate } from 'react-router-dom'
import cardHistoryImg from '@/assets/card/card_history.svg'
import coinImg from '@/assets/card/coin.svg'

const MOCK = {
  month: 3,
  cardName: '체인지업 체크 카드',
  totalSpending: 808399,
  dailyAvg: 2078,
  savedAmount: 28509,
  biggest: {
    amount: 398764,
    date: '2024.01.03',
    merchant: 'DONQUIJOTE FUKUOKATENJ 092-737-6',
  },
}

function TornEdge({ topColor, bottomColor }: { topColor: string; bottomColor: string }) {
  return (
    <div style={{ background: bottomColor, lineHeight: 0 }}>
      <svg viewBox="0 0 390 28" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
        <path
          fill={topColor}
          d="M0,0 Q32,22 65,14 Q98,6 130,18 Q162,28 195,10 Q228,0 260,16 Q292,26 325,10 Q358,0 390,14 L390,0 Z"
        />
      </svg>
    </div>
  )
}

function Calculator({ value }: { value: number }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#e8788a', boxShadow: '4px 6px 0 rgba(0,0,0,0.18)', width: 200 }}
    >
      <div className="rounded-lg mb-3 relative overflow-hidden" style={{ background: '#8b1a2b', height: 56 }}>
        <span
          className="absolute text-3xl font-bold select-none pointer-events-none"
          style={{ right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,210,180,0.13)', fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em' }}
        >
          000000
        </span>
        <span
          className="absolute text-3xl font-bold"
          style={{ right: 16, top: '50%', transform: 'translateY(-50%)', color: '#ffd7b5', fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em' }}
        >
          {value}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {['+', '-', '×', '='].map((op) => (
          <div
            key={op}
            className="rounded-lg py-2.5 text-center text-base font-bold text-white"
            style={{ background: op === '=' ? '#f9a825' : '#c0546a' }}
          >
            {op}
          </div>
        ))}
      </div>
    </div>
  )
}

function CoinStack({ count = 11 }: { count?: number }) {
  return (
    <div className="flex justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src={coinImg}
          alt=""
          className="w-12 h-12 flex-shrink-0"
          style={{ marginLeft: i === 0 ? 0 : -26 }}
        />
      ))}
    </div>
  )
}

function Receipt({ amount, date, merchant }: { amount: number; date: string; merchant: string }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 320 }}>
      {/* 찢긴 윗 가장자리 */}
      <svg viewBox="0 0 320 12" className="block w-full" style={{ marginBottom: -1 }}>
        <path
          fill="#ffffff"
          d="M0,12 Q8,0 16,12 Q24,0 32,12 Q40,0 48,12 Q56,0 64,12 Q72,0 80,12 Q88,0 96,12 Q104,0 112,12 Q120,0 128,12 Q136,0 144,12 Q152,0 160,12 Q168,0 176,12 Q184,0 192,12 Q200,0 208,12 Q216,0 224,12 Q232,0 240,12 Q248,0 256,12 Q264,0 272,12 Q280,0 288,12 Q296,0 304,12 Q312,0 320,12 L320,0 L0,0 Z"
        />
      </svg>

      <div className="bg-white px-6 pt-6 pb-8" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-bold tracking-widest" style={{ color: '#aaa' }}>PRICE</span>
          <span
            className="text-3xl font-black"
            style={{ background: 'linear-gradient(to top, #c8ffc8 35%, transparent 35%)', padding: '0 4px' }}
          >
            {amount.toLocaleString('ko-KR')}원
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-5">
          <span className="text-xs font-bold tracking-widest" style={{ color: '#aaa' }}>DATE</span>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <hr className="border-gray-100 mb-5" />
        <p className="text-sm font-black text-center leading-relaxed break-all">{merchant}</p>
      </div>

      {/* 찢긴 아랫 가장자리 */}
      <svg viewBox="0 0 320 12" className="block w-full" style={{ marginTop: -1 }}>
        <path
          fill="#ffffff"
          d="M0,0 Q8,12 16,0 Q24,12 32,0 Q40,12 48,0 Q56,12 64,0 Q72,12 80,0 Q88,12 96,0 Q104,12 112,0 Q120,12 128,0 Q136,12 144,0 Q152,12 160,0 Q168,12 176,0 Q184,12 192,0 Q200,12 208,0 Q216,12 224,0 Q232,12 240,0 Q248,12 256,0 Q264,12 272,0 Q280,12 288,0 Q296,12 304,0 Q312,12 320,0 L320,12 L0,12 Z"
        />
      </svg>
    </div>
  )
}

export function CardHistoryPage() {
  const navigate = useNavigate()
  const { month, cardName, totalSpending, dailyAvg, savedAmount, biggest } = MOCK

  const [year, mon, day] = biggest.date.split('.').map(Number)

  return (
    <div className="mobile-container flex flex-col h-screen" style={{ background: '#f7f7f5' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white flex-shrink-0 z-50">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-2xl leading-none">‹</button>
          <span className="text-sm font-medium">여행로그 요약</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex flex-col items-end gap-1 cursor-pointer">
            <div className="w-5 h-0.5 bg-gray-800 rounded" />
            <div className="w-4 h-0.5 bg-gray-800 rounded" />
            <div className="w-5 h-0.5 bg-gray-800 rounded" />
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5">전체</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

      {/* ──── SECTION 1: Hero ──── */}
      <div className="bg-white px-5 pt-6 pb-12 text-center">
        <p className="text-base font-medium text-gray-700">{cardName}로 결제한</p>
        <p className="flex items-center justify-center gap-2 text-2xl font-extrabold text-gray-900 mt-1.5">
          <span
            className="inline-flex items-center justify-center text-white text-xl font-black rounded-lg"
            style={{ width: 38, height: 38, background: '#222', flexShrink: 0 }}
          >
            {month}
          </span>
          월 소비 리포트
        </p>

        <div className="mt-8 flex justify-center">
          <img src={cardHistoryImg} alt="card history illustration" className="w-72 h-auto" />
        </div>
      </div>

      {/* ──── SECTION 2: 지출 (다크 네이비) ──── */}
      <TornEdge topColor="#ffffff" bottomColor="#2c3e6b" />
      <div className="px-6 pb-16" style={{ background: '#2c3e6b' }}>
        <p className="text-[19px] font-medium leading-relaxed" style={{ color: '#ffffffcc' }}>
          이번 달 체인지업 카드로<br />소비한 금액은
        </p>
        <p
          className="text-3xl font-black mt-1 inline-block"
          style={{
            background: 'linear-gradient(to top, rgba(138,96,255,0.45) 40%, transparent 40%)',
            padding: '0 4px',
            color: '#fff',
          }}
        >
          총 {totalSpending.toLocaleString('ko-KR')}원
        </p>

        <div className="relative mt-10" style={{ height: 220 }}>
          <div
            className="absolute z-10 text-sm font-medium text-white px-5 py-2 rounded-md"
            style={{ background: '#b59a6a', top: 0, left: 0 }}
          >
            하루평균
          </div>
          <div
            className="absolute"
            style={{ right: -24, bottom: 0, transform: 'rotate(-12deg) scale(1.15)', transformOrigin: 'bottom right' }}
          >
            <Calculator value={dailyAvg} />
          </div>
        </div>
      </div>

      {/* ──── SECTION 3: 절약 (민트) ──── */}
      <TornEdge topColor="#2c3e6b" bottomColor="#f0faf4" />
      <div className="px-6 pt-6 pb-8 text-center" style={{ background: '#f0faf4' }}>
        <CoinStack />

        <div
          className="my-5 mx-auto h-0.5 rounded"
          style={{ width: '80%', background: 'linear-gradient(90deg, transparent, #7dd8c0, transparent)' }}
        />

        <p className="text-lg font-medium text-gray-800">
          이번 달 소비에서 <strong className="font-black">아낀 금액</strong>은
        </p>
        <p
          className="text-2xl font-black mt-1"
          style={{
            textDecoration: 'underline',
            textDecorationColor: '#7dd8c0',
            textUnderlineOffset: 4,
          }}
        >
          총 {savedAmount.toLocaleString('ko-KR')}원
        </p>
      </div>

      {/* ──── SECTION 4: 최대 지출 ──── */}
      <div className="px-6 pb-20" style={{ background: '#f0faf4' }}>
        <p className="text-center text-[19px] font-bold text-gray-900 mb-7">
          이번 달 <strong>가장 큰 소비</strong>는
        </p>

        <Receipt amount={biggest.amount} date={biggest.date} merchant={biggest.merchant} />

        <div className="text-center mt-8 text-sm leading-relaxed" style={{ color: '#666' }}>
          {year}년 {String(mon).padStart(2, '0')}월 {String(day).padStart(2, '0')}일에
          <br />
          {biggest.merchant}에서
          <br />
          <strong
            className="text-lg font-black"
            style={{
              color: '#222',
              background: 'linear-gradient(to top, #c8ffc8 35%, transparent 35%)',
              padding: '0 2px',
            }}
          >
            {biggest.amount.toLocaleString('ko-KR')}원
          </strong>{' '}
          결제했어요
        </div>
      </div>

      </div>
    </div>
  )
}
