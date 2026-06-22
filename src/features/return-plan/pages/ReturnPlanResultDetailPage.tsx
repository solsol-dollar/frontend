import { useParams } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import solBankIcon from '@/assets/common/shinhan-bank.svg'
import { DonutGauge } from '../components/DonutGauge'
import { ZONE_COLORS } from '../constants'
import { useReturnPlanDetail } from '../hooks/useReturnPlanDetail'
import { useSubscriptionResultDetail } from '@/features/ipo/hooks/useSubscriptionResultDetail'
import { allocationItemsToSplits } from '../utils/allocationMapper'

const ACCOUNTS = [
  { id: 'cma', name: '신한투자증권 CMA 계좌', desc: '다음 IPO 대기금 · ETF 투자', legendLines: ['신한투자증권', 'CMA 계좌'] },
  { id: 'valueup', name: '신한 Value-up 외화적립예금', desc: '연 3.2% · 3개월 이상', legendLines: ['신한 Value-up', '외화적립예금'] },
  { id: 'chainup', name: '신한 외화 체인지업 예금', desc: '체크카드로 해외소비 시 간편추가', legendLines: ['신한 외화', '체인지업 예금'] },
] as const

const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

export function ReturnPlanResultDetailPage() {
  const { id } = useParams()
  const returnPlanId = Number(id)
  const { data: plan } = useReturnPlanDetail(returnPlanId)
  const { data: allocationResult } = useSubscriptionResultDetail(plan?.subscriptionId ?? NaN)

  const refundAmount = plan?.totalRefundAmount ?? 0
  const [a, b] = plan ? allocationItemsToSplits(plan.allocations) : [0, 0]
  const ratios: [number, number, number] = [a, b - a, 100 - b]
  const amountOf = (ratio: number) => (refundAmount * ratio) / 100

  return (
    <div className="mobile-container flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header showBack title="리턴 결과 상세보기" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-6 bg-white">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-300 flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-text-primary">{plan?.sourceCompanyName ?? '불러오는 중...'}</p>
              <p className="text-sm text-text-tertiary">
                {plan?.sourceTicker} · {plan?.refundDate ?? '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
              <p className="text-sm text-text-tertiary">청약금</p>
              <p className="text-base font-bold text-text-primary mt-1">
                {allocationResult ? formatUsd(allocationResult.subscriptionAmount) : '-'}
              </p>
            </div>
            <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
              <p className="text-sm text-text-tertiary">배정률</p>
              <p className="text-base font-bold text-text-primary mt-1">
                {allocationResult?.allocationRate != null ? `${allocationResult.allocationRate}%` : '-'}
              </p>
            </div>
            <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
              <p className="text-sm text-text-tertiary">배정금</p>
              <p className="text-base font-bold text-text-primary mt-1">
                {allocationResult?.allocatedAmount != null ? formatUsd(allocationResult.allocatedAmount) : '-'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <DonutGauge ratios={ratios} amount={refundAmount} message="분배되었어요" />

            <div className="flex items-center justify-center gap-4 mt-4">
              {ACCOUNTS.map((acc, i) => (
                <div key={acc.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                  <span className="text-xs text-text-secondary leading-tight">
                    {acc.legendLines[0]}
                    <br />
                    {acc.legendLines[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-5 bg-surface-bg space-y-3">
          {ACCOUNTS.map((acc, i) => (
            <div
              key={acc.id}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl fade-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img src={solBankIcon} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{acc.name}</p>
                <p className="text-xs text-text-tertiary truncate">{acc.desc}</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm font-bold text-text-primary">{formatUsd(amountOf(ratios[i]))}</span>
                <span className="text-xs font-medium" style={{ color: ZONE_COLORS[i] }}>
                  {ratios[i]}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
