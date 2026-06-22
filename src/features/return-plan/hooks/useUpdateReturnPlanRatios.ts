import { useMutation } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { AllocationItem, ReturnPlanResponse } from '../types/returnPlan'

// RP-002: PUT /api/v1/return-plans/{returnPlanId}
export function useUpdateReturnPlanRatios(returnPlanId: number) {
  return useMutation({
    mutationFn: async (allocations: AllocationItem[]) => {
      const res = await ledgerApi.put(`/api/v1/return-plans/${returnPlanId}`, { allocations })
      return (res as unknown as ApiResponse<ReturnPlanResponse>).data
    },
  })
}
