import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { Header } from '@/components/common/Header'
import { useIpoDetail, useToggleFavorite } from '../hooks/useIpo'
import { generateLogoColor } from '../utils/ipoUtils'

export function IpoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const ipoId = Number(id)

  const { data, isLoading } = useIpoDetail(ipoId)
  const { mutate: toggleFav } = useToggleFavorite()
  const [logoError, setLogoError] = useState(false)

  if (isLoading || !data?.data) {
    return <div className="page-content" />
  }

  const ipo = data.data
  const today = dayjs()
  const fallbackColor = generateLogoColor(ipo.ticker)
  const abbr = ipo.ticker.slice(0, 2)

  const dday = (() => {
    const diff = dayjs(ipo.subscriptionEndDate).startOf('day').diff(today.startOf('day'), 'day')
    if (diff < 0) return ''
    if (diff === 0) return 'D-Day'
    return `D-${diff}`
  })()

  const priceDisplay = ipo.confirmedOfferPrice != null
    ? `USD ${ipo.confirmedOfferPrice.toFixed(2)}`
    : [ipo.offerPriceMin, ipo.offerPriceMax]
        .filter((p): p is number => p != null)
        .map((p) => `USD ${p.toFixed(2)}`)
        .join(' ~ ') || '미정'

  const milestones = [
    { label: '청약시작', date: ipo.subscriptionStartDate },
    { label: '청약마감', date: ipo.subscriptionEndDate },
    { label: '청약대금납부', date: ipo.depositDate },
    { label: '상장/환불예정일', date: ipo.listingDate },
  ].filter((m): m is { label: string; date: string } => !!m.date)

  const activeMilestoneIdx = milestones.findIndex(
    (m) => !dayjs(m.date).isBefore(today, 'day'),
  )

  return (
    <div className="page-content">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={
          <button
            aria-label={ipo.isFavorite ? '관심 IPO 해제' : '관심 IPO 등록'}
            onClick={() => toggleFav({ ipoId, isFavorite: ipo.isFavorite })}
          >
            <Heart
              size={22}
              className={ipo.isFavorite ? 'text-[#CA3D40] fill-[#CA3D40]' : 'text-text-tertiary'}
            />
          </button>
        }
      />

      {/* 종목 헤더 */}
      <section className="px-4 pt-4 pb-6 bg-white">
        <div className="flex items-center gap-3">
          {ipo.logoUrl && !logoError ? (
            <img src={ipo.logoUrl} alt={ipo.companyName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" onError={() => setLogoError(true)} />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
              style={{ backgroundColor: fallbackColor }}
            >
              {abbr}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{ipo.companyName}</h1>
              {dday && <span className="text-sm text-up font-semibold">{dday}</span>}
            </div>
            <p className="text-sm text-text-secondary mt-0.5">공모(예정)가: {priceDisplay}</p>
          </div>
        </div>

        {/* 타임라인 마일스톤 */}
        <div className="mt-6 flex items-center relative">
          <div className="absolute left-0 right-0 top-2.5 h-0.5 bg-border" />
          {milestones.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              <div className={`w-5 h-5 rounded-full border-2 z-10 ${i === activeMilestoneIdx ? 'bg-primary border-primary' : 'bg-white border-border'}`} />
              <p className={`text-[10px] mt-1 text-center font-medium ${i === activeMilestoneIdx ? 'text-primary' : 'text-text-tertiary'}`}>{m.label}</p>
              <p className="text-[10px] text-text-tertiary text-center">{dayjs(m.date).format('YYYY.MM.DD')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 청약 가능 금액 */}
      <section className="px-4 py-5 bg-white mt-2">
        <p className="text-sm text-text-secondary">최소 청약 금액</p>
        <p className="text-2xl font-bold text-text-primary mt-1">
          {ipo.minimumSubscriptionAmount != null
            ? `USD ${ipo.minimumSubscriptionAmount.toFixed(2)}`
            : '미정'}
          <span className="text-sm font-normal text-text-tertiary ml-1">이 금액 한도로 가능해요</span>
        </p>

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
          <span className="text-sm font-bold text-text-primary">
            {priceDisplay}
          </span>
        </div>
      </section>

      {/* News Score — 추후 API 연동 예정 */}
      <section className="px-4 py-5 bg-white mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-bold text-text-primary">News Score</span>
          <span className="text-base font-bold text-text-primary">
            62<span className="text-text-tertiary text-sm">/100</span>
          </span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '62%' }} />
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-text-primary">관련 뉴스</p>
          {[`${ipo.companyName}, IPO 예정`, `${ipo.companyName}, 시장 반응 주목`].map((n, i) => (
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
          onClick={() => navigate(`/ipo/${ipoId}/subscribe`)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
        >
          청약하기
        </button>
      </div>
    </div>
  )
}
