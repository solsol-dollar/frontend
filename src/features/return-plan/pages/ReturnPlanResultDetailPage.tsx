import { Header } from '@/components/common/Header'
import solBankIcon from '@/assets/common/shinhan-bank.svg'
import { DonutGauge } from '../components/DonutGauge'
import { ZONE_COLORS } from '../constants'

const RESULT = {
  name: 'Rubrik',
  ticker: 'RUBK',
  date: '2025.05.28',
  subscriptionAmount: '$3,000',
  allocationRate: '30%',
  allocatedAmount: '$900',
  refundAmount: 2108,
}

const DISTRIBUTION = [
  {
    label: '예수금',
    ratio: 20,
    name: '신한투자증권 CMA 계좌',
    desc: '다음 IPO 대기금 · ETF 투자',
    amount: '+$420',
    legendLines: ['신한투자증권', 'CMA 계좌'],
  },
  {
    label: '적립예금',
    ratio: 50,
    name: '신한 Value-up 외화적립예금',
    desc: '연 3.2% · 3개월 이상',
    amount: '+$1,050',
    legendLines: ['신한 Value-up', '외화적립예금'],
  },
  {
    label: '예금/카드',
    ratio: 30,
    name: '신한 외화 체인지업 예금',
    desc: '체크카드로 해외소비 시 간편추가',
    amount: '+$630',
    legendLines: ['신한 외화', '체인지업 예금'],
  },
]

export function ReturnPlanResultDetailPage() {
  return (
    <div className="mobile-container flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header showBack title="리턴 결과 상세보기" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-6 bg-white">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-300 flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-text-primary">{RESULT.name}</p>
              <p className="text-sm text-text-tertiary">
                {RESULT.ticker} · {RESULT.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
              <p className="text-sm text-text-tertiary">청약금</p>
              <p className="text-base font-bold text-text-primary mt-1">{RESULT.subscriptionAmount}</p>
            </div>
            <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
              <p className="text-sm text-text-tertiary">배정률</p>
              <p className="text-base font-bold text-text-primary mt-1">{RESULT.allocationRate}</p>
            </div>
            <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
              <p className="text-sm text-text-tertiary">배정금</p>
              <p className="text-base font-bold text-text-primary mt-1">{RESULT.allocatedAmount}</p>
            </div>
          </div>

          <div className="mt-6">
            <DonutGauge
              ratios={[DISTRIBUTION[0].ratio, DISTRIBUTION[1].ratio, DISTRIBUTION[2].ratio]}
              amount={RESULT.refundAmount}
              message="분배되었어요"
            />

            <div className="flex items-center justify-center gap-4 mt-4">
              {DISTRIBUTION.map((d, i) => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                  <span className="text-xs text-text-secondary leading-tight">
                    {d.legendLines[0]}
                    <br />
                    {d.legendLines[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-5 bg-surface-bg space-y-3">
          {DISTRIBUTION.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl fade-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img src={solBankIcon} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{d.name}</p>
                <p className="text-xs text-text-tertiary truncate">{d.desc}</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm font-bold text-text-primary">{d.amount}</span>
                <span className="text-xs font-medium" style={{ color: ZONE_COLORS[i] }}>
                  {d.ratio}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
