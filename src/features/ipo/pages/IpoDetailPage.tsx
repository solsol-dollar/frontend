import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'
import { IpoStockHeader } from '@/features/ipo/components/IpoStockHeader'
import { IpoOfferingInfo } from '@/features/ipo/components/IpoOfferingInfo'
import {
  getSubscriptionDday,
  getSubscriptionStatus,
  getSubscriptionStatusBadgeClass,
  getSubscriptionStatusTextClass,
} from '@/features/ipo/utils/subscriptionStatus'

const MOCK_IPO_MILESTONES = [
  { label: '청약시작일', date: '2026.06.24' },
  { label: '청약마감일', date: '2026.09.04' },
  { label: '환불(예정)일', date: '2026.09.05' },
  { label: '상장(예정)일', date: '2026.09.06' },
]

const MOCK_IPO = {
  id: 1,
  ticker: 'CRWV',
  name: 'CoreWeave',
  abbr: 'CR',
  color: '#FF6830',
  status: getSubscriptionStatus(MOCK_IPO_MILESTONES),
  dday: getSubscriptionDday(MOCK_IPO_MILESTONES),
  offeringPrice: 'USD 20.00',
  offeringShares: '10,000,000 주',
  milestones: MOCK_IPO_MILESTONES,
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
  const { id } = useParams()
  const [liked, setLiked] = useState(false)

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={
          <button onClick={() => setLiked((v) => !v)} aria-label="관심 종목" aria-pressed={liked} className="p-1">
            <Heart
              size={22}
              className={liked ? 'text-heart fill-heart' : 'text-text-tertiary'}
            />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">

        <section className="px-5 py-6 bg-white">
          <div className="mb-7">
            <IpoStockHeader
              avatarText={MOCK_IPO.abbr}
              avatarColor={MOCK_IPO.color}
              name={MOCK_IPO.name}
              ticker={MOCK_IPO.ticker}
              status={MOCK_IPO.status}
              statusClassName={getSubscriptionStatusBadgeClass(MOCK_IPO.status)}
              secondaryText={MOCK_IPO.dday}
              secondaryClassName={getSubscriptionStatusTextClass(MOCK_IPO.status)}
            />
          </div>

          <div className="h-2 bg-surface-bg -mx-5 mb-4" />

          <IpoOfferingInfo
            offeringPrice={MOCK_IPO.offeringPrice}
            offeringShares={MOCK_IPO.offeringShares}
            milestones={MOCK_IPO.milestones}
            footnote="※ 일정은 사전 고지없이 변경될 수 있습니다."
          />
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
          onClick={() => navigate(`/ipo/${id}/subscribe`)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
        >
          청약신청
        </button>
      </div>
    </div>
  )
}
