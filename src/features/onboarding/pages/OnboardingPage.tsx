import { useNavigate } from 'react-router-dom'
import { AccountSelectStep } from '@/features/onboarding/components/AccountSelectStep'
import { useCompleteOnboarding } from '@/features/onboarding/hooks/useCompleteOnboarding'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { complete } = useCompleteOnboarding()

  return (
    <AccountSelectStep
      onConfirm={() => complete(() => navigate('/home', { state: { requestNotification: true } }))}
    />
  )
}
