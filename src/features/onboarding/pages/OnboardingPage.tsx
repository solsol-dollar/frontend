import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PinKeypad } from '@/features/onboarding/components/PinKeypad'
import { LoadingStep } from '@/features/onboarding/components/LoadingStep'
import { AccountSelectStep } from '@/features/onboarding/components/AccountSelectStep'
import { loginWithPin, completeOnboarding } from '@/lib/auth'

type Step = 'splash' | 'pin' | 'loading' | 'accounts'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('splash')
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinKey, setPinKey] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const errorTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current)
    }
  }, [])

  const handlePinEnter = async (pin: string) => {
    setPinError(null)
    try {
      const { onboardingStatus } = await loginWithPin(pin)
      if (onboardingStatus === 'COMPLETED') {
        setIsCompleted(true)
        setStep('loading')
      } else {
        setStep('loading')
      }
    } catch {
      setPinError('비밀번호가 올바르지 않습니다')
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current)
      errorTimerRef.current = window.setTimeout(() => {
        setPinError(null)
        setPinKey((k) => k + 1)
      }, 3000)
    }
  }

  if (step === 'pin')
    return (
      <PinKeypad
        key={pinKey}
        onEnter={handlePinEnter}
        onBack={() => setStep('splash')}
        error={pinError}
      />
    )
  if (step === 'loading')
    return (
      <LoadingStep
        message={isCompleted ? '로그인에 성공했습니다' : '계좌 정보를 불러오고 있어요'}
        onDone={() => (isCompleted ? navigate('/home') : setStep('accounts'))}
      />
    )
  if (step === 'accounts')
    return (
      <AccountSelectStep
        onConfirm={async () => {
          await completeOnboarding()
          navigate('/home')
        }}
      />
    )

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
