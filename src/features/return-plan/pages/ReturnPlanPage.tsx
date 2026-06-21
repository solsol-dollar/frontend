import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { useCountUp } from '../hooks/useCountUp'

const REFUND_TOTAL = 2108

const SUMMARY = [
  { label: '외화예수금', amount: 700 },
  { label: '외화적금', amount: 1100 },
  { label: '외화통장', amount: 308 },
]

const formatUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const HISTORY = [
  { id: 1, name: 'Rubrik', ticker: 'RUBK', date: '2025.05.28', amount: '$838.91', distributed: true },
  { id: 2, name: 'Rubrik', ticker: 'RUBK', date: '2025.05.28', amount: '$838.91', distributed: true },
  { id: 3, name: 'Klarna', ticker: 'KLAR', date: '2026.03.06', amount: '$2,108.00', distributed: false },
]

export function ReturnPlanPage() {
  const navigate = useNavigate()

  const refundCount = useCountUp(REFUND_TOTAL)
  const amount0 = useCountUp(SUMMARY[0].amount)
  const amount1 = useCountUp(SUMMARY[1].amount)
  const amount2 = useCountUp(SUMMARY[2].amount)
  const amounts = [amount0, amount1, amount2]

  const nextPending = HISTORY.filter((item) => !item.distributed).sort(
    (a, b) => new Date(a.date.replace(/\./g, '-')).getTime() - new Date(b.date.replace(/\./g, '-')).getTime(),
  )[0]

  return (
    <div className="page-content flex flex-col min-h-screen">
      <Header showNotification showMypage={false} showSearch />

      <section className="px-4 pt-2 pb-5 bg-white">
        <p className="text-sm text-text-tertiary">최근 환불금 · ${Math.round(refundCount).toLocaleString('en-US')}</p>

        <div className="flex items-center justify-between mt-2">
          <h2 className="text-2xl font-bold text-text-primary">CoreWeave IPO</h2>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            분배 완료
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {SUMMARY.map((s, i) => (
            <div key={s.label} className="flex-1 bg-surface-bg rounded-2xl py-6 px-3 text-left">
              <p className="text-sm text-text-tertiary">{s.label}</p>
              <p className="text-sm font-bold text-text-primary mt-1">{formatUsd(amounts[i])}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex-1 px-4 py-4 bg-surface-bg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(nextPending ? `/return-plan/pending/${nextPending.id}` : '/ipo')}
            className="flex-1 bg-white rounded-2xl p-4 py-5 text-left"
          >
            <p className="text-sm text-text-tertiary mb-1">다음 IPO 환불일</p>
            <p className="text-base font-bold text-text-primary mb-3">Klarna · D-3</p>
            <div className="flex items-center justify-between">
              <img src="/icons/Calendar.svg" width={32} height={32} alt="" />
              <ChevronRight size={18} className="text-text-tertiary" />
            </div>
          </button>

          <button
            onClick={() => navigate('/return-plan/allocation')}
            className="flex-1 bg-white rounded-2xl p-4 py-5 text-left"
          >
            <p className="text-sm text-text-tertiary mb-1">놀고있는 예수금도!</p>
            <p className="text-base font-bold text-text-primary mb-3">리턴 플랜</p>
            <div className="flex items-center justify-between">
              <img src="/icons/ArrowSolid.svg" width={32} height={32} alt="" />
              <ChevronRight size={18} className="text-text-tertiary" />
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between mt-5 mb-3">
          <h3 className="text-lg font-bold text-text-primary">리턴 내역</h3>
          <button
            onClick={() => navigate('/return-plan/history')}
            className="flex items-center text-sm text-text-tertiary"
          >
            전체보기
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-white rounded-2xl divide-y divide-border">
          {HISTORY.map((item) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}
