import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PinKeypad } from '../components/PinKeypad'
import { LoadingStep } from '../components/LoadingStep'
import { AccountSelectStep } from '../components/AccountSelectStep'

type Step = 'splash' | 'pin' | 'loading' | 'accounts'

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
