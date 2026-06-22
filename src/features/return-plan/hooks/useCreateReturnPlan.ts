import { useMutation } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanResponse } from '../types/returnPlan'

// RP-001: POST /api/v1/return-plans
export function useCreateReturnPlan() {
  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const res = await ledgerApi.post('/api/v1/return-plans', { subscriptionId })
      return (res as unknown as ApiResponse<ReturnPlanResponse>).data
    },
  })
}
