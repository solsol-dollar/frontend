import { useNavigate } from 'react-router-dom'
import { Heart, ChevronRight } from 'lucide-react'
import { Header } from '@/components/common/Header'

const MOCK_IPO = {
  id: 1, ticker: 'CRWV', name: 'CoreWeave', color: '#FF6830', dday: 'D-3',
  priceRange: 'USD 20,000',
  milestones: [
    { label: '청약시작', date: '2026.06.02' },
    { label: '청약마감', date: '2026.06.14', active: true },
    { label: '청약대금납부', date: '2026.06.20' },
    { label: '상장/환불예정일', date: '2026.06.28' },
  ],
  availableAmount: '$2,084,455',
  trend: true,
  comparison: [
    { label: 'SOLSOL달러', amount: '$10,980,000', highlight: true },
    { label: '타사 MTS', amount: '$10,980,000', highlight: false },
  ],
  newsScore: 62,
  news: [
    'CoreWeave, NASDAQ 최대 IPO 예정',
    'CoreWeave, NASDAQ 최대 IPO 예정',
  ],
}

export function IpoDetailPage() {
  const navigate = useNavigate()
  const ipo = MOCK_IPO

  return (
    <div className="page-content">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={<Heart size={22} className="text-text-tertiary" />}
      />

      {/* 종목 헤더 */}
      <section className="px-4 pt-4 pb-6 bg-white">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold"
            style={{ backgroundColor: ipo.color }}
          >
            {ipo.ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{ipo.name}</h1>
              <span className="text-sm text-up font-semibold">{ipo.dday}</span>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">청약가능금액: {ipo.priceRange}</p>
          </div>
        </div>

        {/* 타임라인 마일스톤 */}
        <div className="mt-6 flex items-center relative">
          <div className="absolute left-0 right-0 top-2.5 h-0.5 bg-border" />
          {ipo.milestones.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              <div className={`w-5 h-5 rounded-full border-2 z-10 ${m.active ? 'bg-primary border-primary' : 'bg-white border-border'}`} />
              <p className={`text-[10px] mt-1 text-center font-medium ${m.active ? 'text-primary' : 'text-text-tertiary'}`}>{m.label}</p>
              <p className="text-[10px] text-text-tertiary text-center">{m.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 청약 가능 금액 */}
      <section className="px-4 py-5 bg-white mt-2">
        <p className="text-sm text-text-secondary">청약가능금액</p>
        <p className="text-2xl font-bold text-text-primary mt-1">
          {ipo.availableAmount}
          <span className="text-sm font-normal text-text-tertiary ml-1">이 금액 한도로 가능해요</span>
        </p>
        {ipo.trend && (
          <p className="text-xs text-up mt-2 font-medium">이 종목 지금 트렌드예요 ↑</p>
        )}

        {/* 비교 표 */}
        <div className="mt-4 rounded-xl overflow-hidden border border-border">
          <div className="grid grid-cols-3 bg-surface text-xs text-text-secondary p-3">
            <span>구분</span>
            <span className="text-center text-primary font-semibold">SOL SOL달러</span>
            <span className="text-center">타사 MTS</span>
          </div>
          {[
            { label: 'Cost Fee', solsol: '$10,980', other: '$10,980' },
            { label: 'USD 환전', solsol: '0원', other: '$10,980' },
            { label: 'USD 20.00', solsol: '$10,980', other: '$10,980' },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-3 text-xs p-3 border-t border-border">
              <span className="text-text-secondary">{row.label}</span>
              <span className="text-center font-semibold text-primary">{row.solsol}</span>
              <span className="text-center text-text-secondary">{row.other}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 청약 금액 입력 */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">청약신청금액</span>
          <span className="text-sm font-bold text-text-primary">USD 20,000</span>
        </div>
      </section>

      {/* News Score */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-bold text-text-primary">News Score</span>
          <span className="text-base font-bold text-text-primary">
            {ipo.newsScore}<span className="text-text-tertiary text-sm">/100</span>
          </span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${ipo.newsScore}%` }} />
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-text-primary">관련 뉴스</p>
          {ipo.news.map((n, i) => (
            <button key={i} className="w-full flex items-center justify-between text-left py-2 border-b border-border last:border-0">
              <span className="text-sm text-text-secondary">{n}</span>
              <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* 청약하기 CTA */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate(`/ipo/${ipo.id}/subscribe`)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
        >
          청약하기
        </button>
      </div>
    </div>
  )
}
