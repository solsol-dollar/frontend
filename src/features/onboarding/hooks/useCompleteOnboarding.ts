import { useState } from 'react'
import { completeOnboarding } from '@/lib/auth'

export function useCompleteOnboarding() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const complete = async (onSuccess: () => void) => {
    setIsLoading(true)
    setError(null)
    try {
      await completeOnboarding()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('온보딩 완료 처리에 실패했습니다'))
    } finally {
      setIsLoading(false)
    }
  }

  return { complete, isLoading, error }
}
