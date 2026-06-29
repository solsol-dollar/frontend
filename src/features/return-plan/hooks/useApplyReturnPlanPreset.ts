import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanResponse } from '../types/returnPlan'

// RP-006: PUT /api/ledger/api/v1/return-plans/{returnPlanId}/preset
export function useApplyReturnPlanPreset(returnPlanId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (presetCode: string) => {
      const res = await ledgerApi.put(`/api/ledger/api/v1/return-plans/${returnPlanId}/preset`, { presetCode })
      return (res as unknown as ApiResponse<ReturnPlanResponse>).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returnPlan', returnPlanId] })
      queryClient.invalidateQueries({ queryKey: ['returnPlans'] })
      queryClient.invalidateQueries({ queryKey: ['returnPlanSummary'] })
    },
  })
}


