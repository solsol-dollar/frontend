import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'

const parseMilestoneDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('.').map(Number)
  return new Date(year, month - 1, day)
}

const today = new Date()
today.setHours(0, 0, 0, 0)

const MOCK_IPO_MILESTONES = [
  { label: '청약시작일', date: '2026.06.24' },
  { label: '청약마감일', date: '2026.09.04' },
  { label: '환불(예정)일', date: '2026.09.05' },
  { label: '상장(예정)일', date: '2026.09.06' },
]

const subscriptionCloseDate = parseMilestoneDate(
  MOCK_IPO_MILESTONES.find((m) => m.label === '청약마감일')!.date,
)
const diffDays = Math.ceil(
  (subscriptionCloseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
)

const MOCK_IPO = {
  id: 1,
  ticker: 'CRWV',
  name: 'CoreWeave',
  abbr: 'CR',
  color: '#FF6830',
  status: diffDays >= 0 ? '청약가능' : '청약마감',
  dday: diffDays >= 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`,
  offeringPrice: 'USD 20.00',
  offeringShares: '10,000,000 주',
  milestones: MOCK_IPO_MILESTONES.map((m) => ({
    ...m,
    active: today >= parseMilestoneDate(m.date),
  })),
  performance: {
    asOf: '2025.12',
    stats: [
      { label: '최근 매출액', value: '333조', change: '+10.88%', positive: true },
      { label: '영업이익', value: '43조', change: '+33.23%', positive: true },
      { label: '순이익', value: '45조', change: '+31.22%', positive: true },
    ],
  },
  newsScore: 62,
  newsSummary:
    'GPU 인프라 수요 급증 중이나, 매출 대비 부채 비율이 높아 재무 안정성 리스크가 존재합니다.',
  news: [
    { title: 'CoreWeave, NVIDIA와 $10B GPU 계약 체결', source: 'Reuters', date: '06.09' },
    { title: 'CoreWeave, NVIDIA와 $10B GPU 계약 체결', source: 'Reuters', date: '06.09' },
  ],
}

export function IpoDetailPage() {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={
          <button onClick={() => setLiked((v) => !v)} aria-label="관심 종목" aria-pressed={liked}>
            <Heart
              size={22}
              className={liked ? 'text-red-500 fill-red-500' : 'text-text-tertiary'}
            />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">

        <section className="px-5 py-6 bg-white">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                style={{ backgroundColor: MOCK_IPO.color }}
              >
                {MOCK_IPO.abbr}
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">{MOCK_IPO.name}</h1>
                <p className="text-xs text-text-tertiary mt-0.5">{MOCK_IPO.ticker}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs border border-primary text-primary rounded px-2 py-0.5">
                {MOCK_IPO.status}
              </span>
              <span className="text-sm font-bold text-primary">{MOCK_IPO.dday}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-sm text-text-secondary w-24 flex-shrink-0">공모(예정)가</span>
              <span className="text-sm font-semibold text-text-primary">{MOCK_IPO.offeringPrice}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-text-secondary w-24 flex-shrink-0">공모주식수</span>
              <span className="text-sm font-semibold text-text-primary">{MOCK_IPO.offeringShares}</span>
            </div>

            <div className="flex items-start">
              <span className="text-sm text-text-secondary w-24 flex-shrink-0 pt-0.5">청약일정</span>
              <div className="flex-1">
                {MOCK_IPO.milestones.map((m, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5',
                          m.active ? 'bg-primary' : 'border-2 border-border bg-white',
                        )}
                      />
                      {i < MOCK_IPO.milestones.length - 1 && (
                        <div
                          className={cn(
                            'w-px flex-1 mt-1',
                            m.active && MOCK_IPO.milestones[i + 1].active
                              ? 'bg-primary'
                              : 'bg-[#C8CAD0]',
                          )}
                        />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm pb-4 leading-5',
                        m.active ? 'font-semibold text-text-primary' : 'text-text-tertiary',
                      )}
                    >
                      {m.date} {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-text-tertiary text-right mt-3">
            ※ 일정은 사전 고지없이 변경될 수 있습니다.
          </p>
        </section>

        <section className="px-5 py-6 bg-white mt-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-bold text-text-primary">실적현황</span>
            <span className="text-xs text-text-tertiary">{MOCK_IPO.performance.asOf} 기준</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MOCK_IPO.performance.stats.map((stat) => (
              <div key={stat.label} className="bg-[#F6F6F9] rounded-xl p-3 flex flex-col items-center">
                <p className="text-xs text-text-secondary mb-2 text-center">{stat.label}</p>
                <p className="text-sm font-bold text-text-primary">{stat.value}</p>
                <p className={cn('text-xs font-medium mt-1', stat.positive ? 'text-up' : 'text-down')}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-6 bg-white mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-text-primary">News Score</span>
            <span className="text-base font-bold text-text-primary">
              {MOCK_IPO.newsScore}
              <span className="text-text-tertiary font-normal text-sm">/100</span>
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full" style={{ width: `${MOCK_IPO.newsScore}%` }} />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">{MOCK_IPO.newsSummary}</p>

          <p className="text-sm font-bold text-text-primary mb-1">관련 뉴스</p>
          <div>
            {MOCK_IPO.news.map((n, i) => (
              <div key={i} className="py-3 border-b border-border last:border-0">
                <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                <p className="text-xs text-text-tertiary mt-1">{n.source} · {n.date}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <div className="px-5 py-4 bg-white border-t border-border shrink-0">
        <button
          onClick={() => navigate(`/ipo/${MOCK_IPO.id}/subscribe`)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
        >
          청약신청
        </button>
      </div>
    </div>
  )
}
