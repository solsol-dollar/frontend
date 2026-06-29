import { useState } from 'react'
import { ConsentSheet } from '@/features/onboarding/components/ConsentSheet'
import { useMyPageAccounts } from '@/features/mypage/hooks/useMyPage'
import changeupCard from '@/assets/home/changeup-card.png'

interface Props {
  onConfirm: () => void
}

export function AccountSelectStep({ onConfirm }: Props) {
  const [showConsent, setShowConsent] = useState(false)
  const { data } = useMyPageAccounts()

  const accounts = data?.accounts ?? []
  const cards = data?.cards ?? []

  const securities = accounts.filter((a) => a.accountType === 'SECURITIES')
  const bankAccounts = accounts.filter((a) => a.accountType !== 'SECURITIES')

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <div className="flex-1 px-4 pt-20 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-10 text-text-primary leading-tight">
          연동할 계좌를 확인해주세요
        </h2>

        <div className="mt-6 space-y-4">
          {securities.length > 0 && (
            <div className="w-full flex items-center gap-3 p-3 rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.13)] bg-surface">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[7px] font-bold text-center leading-tight whitespace-pre-line">
                  {'신한\nSOL\n증권'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-text-secondary">신한투자증권 CMA 계좌</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-base font-bold text-text-primary">
                    {securities[0].virtualAccountNumber 
                      ? `가상계좌 ${securities[0].virtualAccountNumber}`
                      : securities[0].accountNumberMasked}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    필수
                  </span>
                </div>
              </div>
            </div>
          )}

          {bankAccounts.map((acc) => (
            <div
              key={acc.accountId}
              className="w-full flex items-center gap-3 p-3 rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.13)] bg-surface"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[7px] font-bold text-center leading-tight whitespace-pre-line">
                  {'신한\nSOL\nBank'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-text-secondary">{acc.accountName}</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{acc.accountNumberMasked}</p>
              </div>
            </div>
          ))}

          {cards.map((card) => (
            <div
              key={card.cardId}
              className="w-full flex items-center gap-3 p-3 rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.13)] bg-surface"
            >
              <img src={changeupCard} alt="카드" className="w-6 h-10 ml-2 object-cover flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-xs text-text-secondary">{card.cardName}</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{card.cardNumberMasked}</p>
              </div>
            </div>
          ))}
        </div>

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
