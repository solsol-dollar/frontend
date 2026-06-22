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
import { useIpoDetail, useToggleFavorite } from '../hooks/useIpo'
import { generateLogoColor } from '../utils/ipoUtils'

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  UPCOMING: '청약예정',
  OPEN: '청약가능',
  CLOSED: '청약종료',
}

export function IpoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const ipoId = Number(id)

  const { data, isLoading } = useIpoDetail(ipoId)
  const { mutate: toggleFav } = useToggleFavorite()

  if (isLoading || !data?.data) {
    return <div className="page-content" />
  }

  const ipo = data.data
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
            <span className="text-xs text-text-tertiary">준비 중</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['최근 매출액', '영업이익', '순이익'] as const).map((label) => (
              <div key={label} className="bg-[#F6F6F9] rounded-xl p-3 flex flex-col items-center">
                <p className="text-xs text-text-secondary mb-2 text-center">{label}</p>
                <p className="text-sm font-bold text-text-primary">-</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-6 bg-white mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-text-primary">News Score</span>
            <span className="text-base font-bold text-text-primary">
              -<span className="text-text-tertiary font-normal text-sm">/100</span>
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">준비 중입니다.</p>
          <p className="text-sm font-bold text-text-primary mb-1">관련 뉴스</p>
          <div className={cn('text-sm text-text-tertiary py-4 text-center')}>뉴스 데이터 준비 중</div>
        </section>
      </div>

      <div className="px-5 py-4 bg-white border-t border-border shrink-0">
        <button
          onClick={() => navigate(`/ipo/${ipoId}/subscribe`)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
        >
          청약신청
        </button>
      </div>
    </div>
  )
}
