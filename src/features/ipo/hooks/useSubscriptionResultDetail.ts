import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { AllocationResultDetail } from '../types/allocation'

// ALLOC-002: GET /api/v1/subscription-results/{subscriptionResultId}
export function useSubscriptionResultDetail(subscriptionResultId: number) {
  return useQuery({
    queryKey: ['subscriptionResult', subscriptionResultId],
    queryFn: async () => {
      const res = await ledgerApi.get(`/api/v1/subscription-results/${subscriptionResultId}`)
      return (res as unknown as ApiResponse<AllocationResultDetail>).data
    },
    enabled: Number.isFinite(subscriptionResultId),
  })
}
