import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

type Step = 'splash' | 'pin' | 'accounts'

const MOCK_ACCOUNTS = [
  { id: 'cma', name: '신한투자증권 CMA 계좌', balance: '$8,200.00', tag: '달러', selected: true },
  { id: 'valueup', name: '신한 Value-up 외화적립예금', balance: '$6,280.50', tag: null, selected: false },
  { id: 'chainup', name: '신한 외화 체인지업 예금', balance: '$3,850.50', tag: null, selected: false },
  { id: 'changeup', name: '신한카드 Change-up 체크', balance: '$1,850.50', tag: null, selected: false },
]

function PinKeypad({ onEnter }: { onEnter: () => void }) {
  const [pin, setPin] = useState<number[]>([])
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '재배열', 0, '←']

  const handleKey = (k: typeof keys[number]) => {
    if (k === '←') setPin((p) => p.slice(0, -1))
    else if (k === '재배열') return
    else if (pin.length < 6) {
      const next = [...pin, k as number]
      setPin(next)
      if (next.length === 6) setTimeout(onEnter, 300)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">신한인증서</h2>
          <p className="text-sm text-text-secondary mt-2">비밀번호를 입력해주세요.</p>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length ? 'bg-primary border-primary' : 'border-border'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-6 text-sm text-text-tertiary">
          <button className="flex items-center gap-1">
            <CheckCircle2 size={16} />
            자동로그인
          </button>
          <span>|</span>
          <button>비밀번호 분실안내</button>
        </div>
      </div>

      <div className="bg-primary grid grid-cols-3">
        {keys.map((k) => (
          <button
            key={String(k)}
            onClick={() => handleKey(k)}
            className="py-5 text-white text-xl font-medium active:bg-white/10 transition-colors"
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

function AccountSelectStep({ onConfirm }: { onConfirm: () => void }) {
  const [selectedId, setSelectedId] = useState('cma')

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full h-1 bg-border mt-12">
        <div className="h-full bg-primary w-1/2 transition-all" />
      </div>
      <p className="text-right text-xs text-text-tertiary px-4 mt-1">2/4</p>

      <div className="flex-1 px-4 pt-6">
        <h2 className="text-2xl font-bold text-text-primary leading-tight">
          김희선님,<br />연동할 계좌를 선택해주세요
        </h2>

        <div className="mt-6 space-y-3">
          {MOCK_ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedId(acc.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors ${
                selectedId === acc.id ? 'border-primary bg-white' : 'border-transparent bg-surface'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">SOL</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-text-primary">{acc.name}</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{acc.balance}</p>
              </div>
              {acc.tag && (
                <span className="text-xs text-primary border border-primary rounded-full px-2 py-0.5">
                  {acc.tag}
                </span>
              )}
              {selectedId === acc.id && (
                <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-text-tertiary mt-4 flex items-center gap-1">
          <span className="inline-block w-3.5 h-3.5 rounded-full border border-text-tertiary text-center text-[10px]">i</span>
          마이페이지에서 추가 연동 가능합니다.
        </p>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={onConfirm}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
        >
          청약신청
        </button>
      </div>
    </div>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('splash')

  if (step === 'pin') return <PinKeypad onEnter={() => setStep('accounts')} />
  if (step === 'accounts') return <AccountSelectStep onConfirm={() => navigate('/home')} />

  return (
    <div className="mobile-container flex flex-col items-center justify-between min-h-screen px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-2xl font-bold">S</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">SOL SOL</span> 달러
          </h1>
          <p className="text-sm text-text-secondary mt-2">신한 그룹 연계 해외 공모주 IPO 청약</p>
        </div>
      </div>

      <button
        onClick={() => setStep('pin')}
        className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base"
      >
        신한통합인증 시작하기
      </button>
    </div>
  )
}
