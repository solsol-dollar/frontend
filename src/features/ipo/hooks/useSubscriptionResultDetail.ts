import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { AllocationResultDetail } from '../types/allocation'

export function subscriptionResultQueryKey(subscriptionResultId: number) {
  return ['subscriptionResult', subscriptionResultId] as const
}

export async function fetchSubscriptionResult(subscriptionResultId: number): Promise<AllocationResultDetail> {
  const res = await ledgerApi.get(`/api/ledger/api/v1/subscription-results/${subscriptionResultId}`)
  return (res as unknown as ApiResponse<AllocationResultDetail>).data
}

// ALLOC-002: GET /api/v1/subscription-results/{subscriptionResultId}
export function useSubscriptionResultDetail(subscriptionResultId: number) {
  return useQuery({
    queryKey: subscriptionResultQueryKey(subscriptionResultId),
    queryFn: () => fetchSubscriptionResult(subscriptionResultId),
    enabled: Number.isFinite(subscriptionResultId),
  })
}
