import { useState } from 'react'
import { cn } from '@/lib/utils'
import changeupCard from '@/assets/home/changeup-card.png'
import { ConsentSheet } from '@/features/onboarding/components/ConsentSheet'

const MOCK_ACCOUNTS = [
  { id: 'cma', label: '신한\nSOL\n증권', name: '신한투자증권 CMA 계좌', balance: '$8,200.00', required: true, isCard: false },
  { id: 'valueup', label: '신한\nSOL\nBank', name: '신한 Value-up 외화적립예금', balance: '$6,280.50', required: false, isCard: false },
  { id: 'chainup', label: '신한\nSOL\nBank', name: '신한 외화 체인지업 예금', balance: '$3,850.50', required: false, isCard: false },
  { id: 'changeup', label: '', name: '신한카드 Change-up 체크', balance: '$1,850.50', required: false, isCard: true },
]

interface Props {
  onConfirm: () => void
}

export function AccountSelectStep({ onConfirm }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(['cma']))
  const [showConsent, setShowConsent] = useState(false)

  const toggle = (id: string, required: boolean) => {
    if (required) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <div className="flex-1 px-4 pt-20 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-10 text-text-primary leading-tight">
          김희선님,<br />연동할 계좌를 선택해주세요
        </h2>

        <div className="mt-6 space-y-4">
          {MOCK_ACCOUNTS.map((acc) => {
            const isSelected = selected.has(acc.id)
            return (
              <button
                key={acc.id}
                onClick={() => toggle(acc.id, acc.required)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.13)] transition-colors',
                  isSelected ? 'bg-surface' : 'bg-white',
                )}
              >
                {acc.isCard ? (
                  <img src={changeupCard} alt="카드" className="w-6 h-10 ml-2 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[7px] font-bold text-center leading-tight whitespace-pre-line">
                      {acc.label}
                    </span>
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="text-xs text-text-secondary">{acc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-base font-bold text-text-primary">{acc.balance}</p>
                    {acc.required && (
                      <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        필수
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                    <path d="M4 10L8 14L16 6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-text-tertiary mt-4 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full border border-text-tertiary flex items-center justify-center text-[10px] flex-shrink-0">i</span>
          마이페이지에서 추가 연동 가능합니다.
        </p>
      </div>

      <div className="px-4 pb-10 pt-2">
        <button
          onClick={() => setShowConsent(true)}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium text-base"
        >
          완료
        </button>
      </div>

      {showConsent && <ConsentSheet onConfirm={onConfirm} onClose={() => setShowConsent(false)} />}
    </div>
  )
}
