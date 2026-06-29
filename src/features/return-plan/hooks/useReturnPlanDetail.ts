import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanResponse } from '../types/returnPlan'

// ?④굔 議고쉶 (紐낆꽭 ??異붽?): GET /api/ledger/api/v1/return-plans/{returnPlanId}
export function useReturnPlanDetail(returnPlanId: number) {
  return useQuery({
    queryKey: ['returnPlan', returnPlanId],
    queryFn: async () => {
      const res = await ledgerApi.get(`/api/ledger/api/v1/return-plans/${returnPlanId}`)
      return (res as unknown as ApiResponse<ReturnPlanResponse>).data
    },
    enabled: Number.isFinite(returnPlanId),
  })
}


