import { useState } from 'react'
import { Header } from '@/components/common/Header'

const ACCOUNTS = [
  { id: 'cma', name: '신한투자증권 CMA 계좌', number: '270-14-164537', balance: '$8,200.00' },
  { id: 'chainup', name: '신한 외화 체인지업 예금', number: '270-1645-0275-43', balance: '$3,850.50' },
]

export function TransferPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'amount'>('select')

  if (step === 'amount') {
    return (
      <div className="flex flex-col h-screen">
        <Header showBack title="송금" showNotification={false} showMypage={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
          <p className="text-sm text-text-secondary">내 외화 통장 선택하기</p>
          <p className="text-2xl font-bold text-text-primary">얼마나 옮길까요?</p>
        </div>
        {/* 금액 키패드 */}
        <div className="bg-primary grid grid-cols-3">
          {[1,2,3,4,5,6,7,8,9,'.',0,'←'].map((k) => (
            <button key={String(k)} className="py-5 text-white text-xl font-medium active:bg-white/10">
              {k}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      <div className="flex-1 px-4 pt-6">
        <p className="text-sm text-text-secondary mb-4">내 외화 통장 선택하기</p>
        <p className="text-xl font-bold text-text-primary mb-6">계좌를 선택해요</p>

        <div className="space-y-3">
          {ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelected(acc.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors text-left ${
                selected === acc.id ? 'border-primary' : 'border-border'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">SOL</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{acc.name}</p>
                <p className="text-xs text-text-tertiary">{acc.number}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => selected && setStep('amount')}
          disabled={!selected}
          className="w-full bg-primary disabled:bg-border text-white py-4 rounded-xl font-semibold transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  )
}
