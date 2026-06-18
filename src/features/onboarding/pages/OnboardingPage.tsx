import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import changeupCard from '@/assets/home/changeup-card.png'


type Step = 'splash' | 'pin' | 'loading' | 'accounts'

const MOCK_ACCOUNTS = [
  { id: 'cma', label: '신한\nSOL\n증권', name: '신한투자증권 CMA 계좌', balance: '$8,200.00', required: true, isCard: false },
  { id: 'valueup', label: '신한\nSOL\nBank', name: '신한 Value-up 외화적립예금', balance: '$6,280.50', required: false, isCard: false },
  { id: 'chainup', label: '신한\nSOL\nBank', name: '신한 외화 체인지업 예금', balance: '$3,850.50', required: false, isCard: false },
  { id: 'changeup', label: '', name: '신한카드 Change-up 체크', balance: '$1,850.50', required: false, isCard: true },
]

function shuffle(arr: number[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function PinKeypad({ onEnter, onBack }: { onEnter: () => void; onBack: () => void }) {
  const [pin, setPin] = useState<number[]>([])
  const [nums, setNums] = useState(() => shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))

  const reshuffle = useCallback(() => setNums(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])), [])

  const handleKey = (k: number | '재배열' | '←') => {
    if (k === '재배열') { reshuffle(); return }
    if (k === '←') { setPin((p) => p.slice(0, -1)); return }
    if (pin.length < 6) {
      const next = [...pin, k]
      setPin(next)
      if (next.length === 6) setTimeout(onEnter, 300)
    }
  }

  const rows = [nums.slice(0, 3), nums.slice(3, 6), nums.slice(6, 9)]
  const lastRow: (number | '재배열' | '←')[] = ['재배열', nums[9], '←']

  return (
    <div className="mobile-container flex flex-col h-screen">
      {/* 상단 영역 */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="px-4 pt-4">
          <button onClick={onBack} className="p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

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
                  i < pin.length ? 'bg-primary border-primary' : 'border-gray-300'
                }`}
              />
            ))}
          </div>

         
        </div>
      </div>

      {/* 키패드 */}
      <div className="bg-primary">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className="py-5 flex items-center justify-center group"
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full text-white text-2xl font-light group-active:bg-white/20 transition-colors">
                  {k}
                </span>
              </button>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-3">
          {lastRow.map((k, i) => (
            <button
              key={i}
              onClick={() => handleKey(k)}
              className="py-5 flex items-center justify-center group"
            >
              <span className="w-14 h-14 flex items-center justify-center rounded-full text-white text-xl font-light group-active:bg-white/20 transition-colors">
                {k}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AccountSelectStep({ onConfirm }: { onConfirm: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(['cma']))

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
                className={`w-full flex items-center gap-3 p-3 rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.13)] transition-colors ${
                  isSelected ? 'bg-surface' : 'bg-white'
                }`}
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
          onClick={onConfirm}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium text-base"
        >
         완료
        </button>
      </div>
    </div>
  )
}

const LOGO_PATH = "M75.14,8.63C38.26,8.63,8.36,38.52,8.36,75.4s29.89,66.77,66.77,66.77,66.77-29.89,66.77-66.77S112.01,8.63,75.14,8.63h0Zm1.4,121.35c-7.99,1.11-21-.91-29.84-6.48-6.64-4.14-11.94-10.12-15.25-17.22-3.05-6.32-4.49-13.99-1.24-13.61,1.51,.18,2.83,3.05,5.79,6.81,2.01,2.56,3.86,4.72,5.24,5.02,.63,.13,1.11-.15,1.58-.99,.84-1.59,1.94-4.61,3.96-7.05,1.58-1.83,3.59-2.74,4.7,1.82,.53,2.19,.94,4.4,1.23,6.63,.35,2.88,.54,4.61,1.55,5.09s2.59-.13,5.22-1.11c1.89-.71,4.31-1.6,7.37-2.48,2.83-.81,4.62-.39,2.81,3.99-1.25,2.92-2.86,5.68-4.77,8.21-.54,.68-.44,1.66,.23,2.21,1.78,1.4,3.77,2.52,5.89,3.32,1.98,.83,4.01,1.53,6.08,2.11,2.49,.77,2.03,3.32-.53,3.72Zm34.26-14.37c-2.48,4.04-7.74,8.41-14.01,11.33-.96,.43-1.98,.29-2.21-.49s.32-1.46,.94-2.21c8.23-10.68,2.12-20.47-11.17-28.07-9.81-5.61-16.06-8.84-23.31-13.11-21.23-12.5-25.33-23.38-26.16-29.84-2.09-16.27,11.36-28.46,25.2-31.4,.43-.09,1.54-.27,1.89,.65s-.46,1.59-.94,1.88c-6.23,3.38-12.31,10.58-11.65,18.65,.36,4.49,2.29,10.94,14.43,19.6,7.33,5.23,16.31,9.51,34.41,20.37,19.13,11.47,16.95,25.45,12.57,32.62h.01Zm2.98-61.11c-4.37,5.35-8.73,3.32-12.09-4.17-2.1-4.7-4.85-5.82-6.8-4.6-2.12,1.34-1.28,4.56,1.11,8.27,1.38,2.22,1.07,5.09-.76,6.96-2.02,1.87-4.86,2.55-7.5,1.81-5.38-1.19-10.68-8.4-6.81-24.15,1.56-6.34-1.49-9.06-3.43-11.5-.96-1.23-1.11-1.97-.73-2.45s1.28-.57,2.86-.24c2.08,.43,5.15,1.49,7.65,1.88,1.83,.26,3.68,.35,5.53,.25,4.61-.32,9.23,.58,13.37,2.63,6.87,3.4,7.57,9.26,3.75,8.84-1.55-.41-3.04-1.03-4.42-1.85-.94-.45-1.76-.61-2.35-.17-.62,.51-.79,1.4-.4,2.1,.85,1.8,3.74,2.73,7.65,3.8,6.82,1.86,6.96,8.2,3.38,12.58Z"

function buildWavePath(fillLevel: number, phase: number): string {
  const baseY = 150 * (1 - fillLevel)
  const amplitude = 5
  const parts: string[] = []
  for (let x = -5; x <= 155; x += 2) {
    const wy = baseY + amplitude * Math.sin(phase + (x / 50) * Math.PI)
    parts.push(x === -5 ? `M ${x},${wy}` : `L ${x},${wy}`)
  }
  parts.push('L 155,155 L -5,155 Z')
  return parts.join(' ')
}

function LoadingStep({ onDone }: { onDone: () => void }) {
  const [fill, setFill] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const totalDuration = 5000
    const cycleDuration = totalDuration / 3

    const frame = () => {
      const elapsed = Date.now() - start
      if (elapsed >= totalDuration) {
        setFill(1)
        setTimeout(onDone, 200)
        return
      }
      setFill((elapsed % cycleDuration) / cycleDuration)
      setPhase((elapsed / 400) * Math.PI * 2)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [onDone])

  const wavePath = buildWavePath(fill, phase)

  return (
    <div className="mobile-container flex flex-col items-center justify-center h-screen bg-white gap-4 pb-24">
      <svg viewBox="0 0 150 150" className="w-20 h-20">
        <defs>
          <clipPath id="logo-shape-clip">
            <path d={LOGO_PATH} />
          </clipPath>
        </defs>
        <path fill="#E5E7EB" d={LOGO_PATH} />
        <g clipPath="url(#logo-shape-clip)">
          <path fill="#0046ff" d={wavePath} />
        </g>
      </svg>
      <p className="text-sm mt-5 text-text-tertiary">계좌 정보를 불러오고 있어요</p>
    </div>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('splash')

  if (step === 'pin') return <PinKeypad onEnter={() => setStep('loading')} onBack={() => setStep('splash')} />
  if (step === 'loading') return <LoadingStep onDone={() => setStep('accounts')} />
  if (step === 'accounts') return <AccountSelectStep onConfirm={() => navigate('/home')} />

  return (
    <div className="mobile-container flex flex-col h-screen bg-white px-4 pb-10">
      <div className="flex-1" />
      <button
        onClick={() => setStep('pin')}
        className="w-full bg-primary text-white py-4 rounded-2xl font-semibold text-base"
      >
        신한통합인증 시작하기
      </button>
    </div>
  )
}
