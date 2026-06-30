import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { useCountUp } from '../hooks/useCountUp'
import { useReturnPlans } from '../hooks/useReturnPlans'
import { useReturnPlanDetail } from '../hooks/useReturnPlanDetail'

const formatUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ReturnPlanPage() {
  const navigate = useNavigate()
  const { data: returnPlans = [] } = useReturnPlans()

  const SUMMARY_LABELS = ['CMA 계좌', '외화적립예금', '체인지업 예금']

  const history = [...returnPlans]
    .sort((a, b) => {
      if (!a.refundDate) return -1
      if (!b.refundDate) return 1
      return b.refundDate.localeCompare(a.refundDate)
    })
    .map((plan) => ({
      id: plan.returnPlanId,
      name: plan.sourceCompanyName,
      ticker: plan.sourceTicker,
      date: plan.refundDate ? plan.refundDate.slice(0, 10).replace(/-/g, '.') : '예정',
      amount: formatUsd(plan.totalRefundAmount),
      distributed: plan.planStatus === 'EXECUTED',
    }))

  const nextPending = returnPlans
    .filter((plan) => plan.planStatus !== 'EXECUTED')
    .sort((a, b) => (a.refundDate ?? '').localeCompare(b.refundDate ?? ''))[0]

  const nextPendingDday = nextPending?.refundDate
    ? (() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const target = new Date(nextPending.refundDate as string)
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
      })()
    : null

  const lastExecuted = returnPlans
    .filter((plan) => plan.planStatus === 'EXECUTED')
    .sort((a, b) => (b.refundDate ?? '').localeCompare(a.refundDate ?? ''))[0]

  const { data: lastExecutedDetail, isLoading: isDetailLoading } = useReturnPlanDetail(lastExecuted?.returnPlanId ?? NaN)

  const securitiesAmount = lastExecutedDetail?.allocations.find((a) => a.destinationType === 'SECURITIES')?.amount ?? 0
  const savingsAmount = lastExecutedDetail?.allocations.find((a) => a.destinationType === 'SAVINGS')?.amount ?? 0
  const accountAmount = lastExecutedDetail?.allocations.find((a) => a.destinationType === 'DEPOSIT')?.amount ?? 0

  const amount0 = useCountUp(securitiesAmount)
  const amount1 = useCountUp(savingsAmount)
  const amount2 = useCountUp(accountAmount)
  const amounts = [amount0, amount1, amount2]

  return (
    <div className="mobile-container h-dvh flex flex-col bg-surface-bg">
      <Header showNotification showMypage={false} showSearch onSearchClick={() => navigate('/return-plan/search')} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {lastExecuted ? (
          <section className="px-4 pt-2 pb-5 bg-white shrink-0">
            <p className="text-sm text-text-tertiary">최근 실행건 · {formatUsd(lastExecuted.totalRefundAmount)}</p>

            <div className="flex items-center justify-between mt-2">
              <h2 className="text-2xl font-bold text-text-primary">{lastExecuted.sourceCompanyName}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                분배 완료
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              {SUMMARY_LABELS.map((label, i) => (
                <div key={label} className="flex-1 bg-surface-bg rounded-2xl py-6 px-3 text-left">
                  <p className="text-sm text-text-tertiary">{label}</p>
                  {isDetailLoading
                    ? <div className="h-4 w-14 mt-1 rounded-md bg-gray-200 animate-pulse" />
                    : <p className="text-sm font-bold text-text-primary mt-1">{formatUsd(amounts[i])}</p>
                  }
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="px-4 pt-6 pb-8 bg-white flex flex-col items-center text-center shrink-0">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <img src="/icons/ArrowSolid.svg" width={28} height={28} alt="" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">아직 분배된 내역이 없어요</h2>
            <p className="text-sm text-text-tertiary mt-1 leading-relaxed">
              IPO에 청약하고 환불금을 받으면<br />리턴 플랜으로 자동 분배해드려요
            </p>
            <button
              onClick={() => navigate('/ipo')}
              className="mt-5 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold"
            >
              IPO 둘러보기
            </button>
          </section>
        )}

        <div className="px-4 pt-7 pb-4">
          <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(nextPending ? `/return-plan/pending/${nextPending.returnPlanId}` : '/ipo')}
            className="w-[167px] h-[136px] bg-white rounded-2xl p-4 text-left flex flex-col justify-between"
          >
            <div>
              <p className="text-[13px] font-medium text-text-tertiary mb-0">다음 IPO 환불일</p>
              <p className="text-base font-bold text-text-primary line-clamp-1">
                {nextPending ? `${nextPending.sourceCompanyName} · ${nextPendingDday ?? '예정'}` : '예정된 환불 없음'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <img src="/icons/ReturnPlan_cal.svg" width={42} height={42} alt="" />
              <ChevronRight size={18} className="text-text-tertiary" />
            </div>
          </button>

          <button
            onClick={() => navigate('/return-plan/allocation')}
            className="w-[167px] h-[136px] bg-white rounded-2xl p-4 text-left flex flex-col justify-between"
          >
            <div>
              <p className="text-[13px] font-medium text-text-tertiary mb-0">놀고있는 예수금도!</p>
              <p className="text-base font-bold text-text-primary">리턴 플랜</p>
            </div>
            <div className="flex items-center justify-between">
              <img src="/icons/returnPlan_icon.svg" width={42} height={42} alt="" />
              <ChevronRight size={18} className="text-text-tertiary" />
            </div>
          </button>
          </div>

          <div className="flex items-center justify-between mt-7 mb-2 px-1">
          <h3 className="text-xs text-text-secondary">리턴 내역</h3>
          <button
            onClick={() => navigate('/return-plan/history')}
            className="flex items-center gap-0.5 text-xs text-text-secondary"
          >
            전체보기 <ChevronRight size={13} />
          </button>
          </div>

          <div className="bg-white rounded-2xl divide-y divide-border">
          {history.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-tertiary">리턴 내역이 없어요</p>
          ) : (
            history.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  navigate(item.distributed ? `/return-plan/result/${item.id}` : `/return-plan/pending/${item.id}`)
                }
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-text-primary">{item.name}</p>
                  <p className="text-sm text-text-tertiary">
                    {item.ticker} · {item.date}
                  </p>
                </div>
                <p className="text-base font-bold text-text-primary">{item.amount}</p>
              </button>
            ))
          )}
          </div>
          <div className="h-[79px]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  )
}
