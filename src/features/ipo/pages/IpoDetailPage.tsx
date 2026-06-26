import { useParams, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { Header } from '@/components/common/Header'
import { IpoStockHeader } from '@/features/ipo/components/IpoStockHeader'
import { IpoOfferingInfo } from '@/features/ipo/components/IpoOfferingInfo'
import {
  getSubscriptionStatusBadgeClass,
  getSubscriptionStatusTextClass,
  type SubscriptionStatus,
} from '@/features/ipo/utils/subscriptionStatus'
import { useIpoDetail, useToggleFavorite, useIpoNews } from '@/features/ipo/hooks/useIpo'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'
import { ClosedIpoDetailPage } from '@/features/ipo/pages/ClosedIpoDetailPage'

const MOCK_PERFORMANCE = [
  { label: '최근 매출액', value: '333조', change: '+10.88%', positive: true },
  { label: '영업이익', value: '43조', change: '+33.23%', positive: true },
  { label: '순이익', value: '45조', change: '+31.22%', positive: true },
]

const MOCK_NEWS_SCORE = 62
const MOCK_NEWS_SUMMARY =
  'GPU 인프라 수요 급증 중이나, 매출 대비 부채 비율이 높아 재무 안정성 리스크가 존재합니다.'

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  UPCOMING: '청약예정',
  OPEN: '청약가능',
  CLOSED: '청약종료',
}

export function IpoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const ipoId = Number(id)

  const { data, isLoading, isError } = useIpoDetail(ipoId)
  const { mutate: toggleFav } = useToggleFavorite()
  const { data: newsData } = useIpoNews(ipoId)

  if (isLoading) {
    return <div className="page-content" />
  }

  if (isNaN(ipoId) || isError || !data?.data) {
    return (
      <div className="mobile-container flex flex-col h-screen">
        <Header showBack showNotification={false} showMypage={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-text-secondary">종목 정보를 불러올 수 없습니다.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary font-semibold"
          >
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
    ipo.refundDate ? { label: '환불(예정)일', date: ipo.refundDate } : null,
    { label: '상장(예정)일', date: ipo.listingDate },
  ]
    .filter((m): m is { label: string; date: string } => m != null && !!m.date)
    .map((m) => ({ ...m, date: dayjs(m.date).format('YYYY.MM.DD') }))

  const ddayTarget =
    status === '청약예정' ? ipo.subscriptionStartDate : ipo.subscriptionEndDate
  const ddayDiff = dayjs(ddayTarget).startOf('day').diff(dayjs().startOf('day'), 'day')
  const dday =
    status === '청약종료'
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
        rightAction={
          <button
            onClick={() => toggleFav({ ipoId, isFavorite: ipo.isFavorite })}
            aria-label={ipo.isFavorite ? '관심 IPO 해제' : '관심 IPO 등록'}
            className="p-1"
          >
            <Heart
              size={22}
              className={ipo.isFavorite ? 'text-[#CA3D40] fill-[#CA3D40]' : 'text-text-tertiary'}
            />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <section className="px-5 py-6 bg-white">
          <div className="mb-7">
            <IpoStockHeader
              avatarText={abbr}
              avatarColor={avatarColor}
              logoUrl={ipo.logoUrl}
              name={ipo.companyName}
              ticker={ipo.ticker}
              status={status}
              statusClassName={getSubscriptionStatusBadgeClass(status)}
              secondaryText={dday || undefined}
              secondaryClassName={dday ? getSubscriptionStatusTextClass(status) : undefined}
            />
          </div>

          <div className="h-2 bg-surface-bg -mx-5 mb-4" />

          <IpoOfferingInfo
            offeringPrice={priceDisplay}
            offeringShares={sharesDisplay}
            milestones={milestones}
            footnote="※ 일정은 사전 고지없이 변경될 수 있습니다."
          />
        </section>

        <section className="px-5 py-6 bg-white mt-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-bold text-text-primary">실적현황</span>
            <span className="text-xs text-text-tertiary">2025.12 기준</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MOCK_PERFORMANCE.map((stat) => (
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
              {MOCK_NEWS_SCORE}<span className="text-text-tertiary font-normal text-sm">/100</span>
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full" style={{ width: `${MOCK_NEWS_SCORE}%` }} />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">{MOCK_NEWS_SUMMARY}</p>
          <p className="text-sm font-bold text-text-primary mb-1">관련 뉴스</p>
          <div>
            {(newsData?.data ?? []).map((n) => (
              <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="block py-3 border-b border-border last:border-0">
                <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                <p className="text-xs text-text-tertiary mt-1">{n.source} · {dayjs(n.publishedAt).format('YYYY.MM.DD')}</p>
              </a>
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
            disabled={status === '청약예정'}
            className="w-full bg-primary disabled:bg-border disabled:text-text-tertiary text-white py-4 rounded-xl font-semibold text-base"
          >
            청약신청
          </button>
        )}
      </div>
    </div>
  )
}
