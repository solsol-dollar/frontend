import { useMutation } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanConfirmResponse } from '../types/returnPlan'

// RP-003: PUT /api/v1/return-plans/{returnPlanId}/confirm
export function useConfirmReturnPlan(returnPlanId: number) {
  return useMutation({
    mutationFn: async () => {
      const res = await ledgerApi.put(`/api/v1/return-plans/${returnPlanId}/confirm`)
      return (res as unknown as ApiResponse<ReturnPlanConfirmResponse>).data
    },
  })
}
