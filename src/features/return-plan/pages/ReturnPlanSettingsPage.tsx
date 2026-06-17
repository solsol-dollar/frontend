import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'

const ACCOUNTS = [
  { id: 'cma', name: '신한투자증권 CMA 계좌', ratio: 40, amount: '₩7,100' },
  { id: 'valueup', name: '신한 Value-up 외화적립예금', ratio: 40, amount: '₩1,100' },
  { id: 'chainup', name: '신한 외화 체인지업 예금', ratio: 20, amount: '₩380' },
]

export function ReturnPlanSettingsPage() {
  const navigate = useNavigate()
  const [ratios, setRatios] = useState<Record<string, number>>(
    Object.fromEntries(ACCOUNTS.map((a) => [a.id, a.ratio]))
  )

  const totalAmount = '$2,108.00'
  const ipoName = 'Klarna IPO'
  const dday = 'D-3'

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header showBack title="리턴 플랜 설정" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* IPO 정보 */}
        <section className="px-4 pt-5 pb-4 bg-white">
          <p className="text-xs text-text-tertiary">{ipoName} 후 수령 금액 예상</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-text-primary">{totalAmount}</p>
            <span className="text-sm text-up font-medium">{dday} 후 $2,108를 리턴돼요!</span>
          </div>
        </section>

        {/* 도넛 차트 영역 (placeholder) */}
        <section className="px-4 py-5 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="w-full h-full rounded-full border-[16px] border-primary opacity-30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-text-primary">{totalAmount}</p>
              <p className="text-xs text-text-tertiary">총 리턴금</p>
            </div>
          </div>
        </section>

        {/* 계좌별 배분 */}
        <section className="px-4 pb-6">
          <p className="text-sm font-semibold text-text-primary mb-3">수령 계좌 설정</p>
          <p className="text-xs text-text-secondary mb-4">
            ☑ 지금 SOLSOL달러에서 청약하면 수익을 올려드려요!
          </p>
          <div className="space-y-4">
            {ACCOUNTS.map((acc) => (
              <div key={acc.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">SOL</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-text-primary truncate pr-2">{acc.name}</span>
                    <span className="font-bold text-text-primary flex-shrink-0">
                      {ratios[acc.id]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={ratios[acc.id]}
                    onChange={(e) => setRatios((r) => ({ ...r, [acc.id]: Number(e.target.value) }))}
                    className="w-full mt-1 accent-primary"
                  />
                  <p className="text-xs text-text-tertiary">{acc.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          수정 완료
        </button>
      </div>
    </div>
  )
}
