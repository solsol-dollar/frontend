import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PinKeypad } from '@/features/onboarding/components/PinKeypad'
import { LoadingStep } from '@/features/onboarding/components/LoadingStep'
import { SplashScreen } from '@/features/onboarding/components/SplashScreen'
import { loginWithPin } from '@/lib/auth'

type Step = 'splash' | 'pin' | 'loading'

export function LoginPage() {
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

  useEffect(() => {
    if (step !== 'splash') return
    const t = window.setTimeout(() => setStep('pin'), 2000)
    return () => window.clearTimeout(t)
  }, [step])

  const handlePinEnter = async (pin: string) => {
    setPinError(null)
    try {
      const { onboardingStatus } = await loginWithPin(pin)
      if (onboardingStatus === 'COMPLETED') {
        setIsCompleted(true)
      }
      setStep('loading')
    } catch {
      setPinError('비밀번호가 올바르지 않습니다')
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current)
      errorTimerRef.current = window.setTimeout(() => {
        setPinError(null)
        setPinKey((k) => k + 1)
      }, 600)
    }
  }

  if (step === 'pin')
    return (
      <PinKeypad
        key={pinKey}
        onEnter={handlePinEnter}
        error={pinError}
      />
    )
  if (step === 'loading')
    return (
      <LoadingStep
        message={isCompleted ? '로그인에 성공했습니다' : '계좌 정보를 불러오고 있어요'}
        onDone={() => (isCompleted ? navigate('/home') : navigate('/onboarding'))}
      />
    )
  return <SplashScreen />
}
