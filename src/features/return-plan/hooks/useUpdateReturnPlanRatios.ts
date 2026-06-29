import { useMutation } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { AllocationItem, ReturnPlanResponse } from '../types/returnPlan'

// RP-002: PUT /api/ledger/api/v1/return-plans/{returnPlanId}
export function useUpdateReturnPlanRatios() {
  return useMutation({
    mutationFn: async ({
      returnPlanId,
      allocations,
    }: {
      returnPlanId: number
      allocations: AllocationItem[]
    }) => {
      const res = await ledgerApi.put(`/api/ledger/api/v1/return-plans/${returnPlanId}`, { allocations })
      return (res as unknown as ApiResponse<ReturnPlanResponse>).data
    },
  })
}


