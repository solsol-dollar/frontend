import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { AllocationItem, ImmediateAllocationResponse } from '../types/returnPlan'

// RP-008: POST /api/ledger/api/v1/return-plans/immediate
export function useExecuteImmediateAllocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (allocations: AllocationItem[]) => {
      const res = await ledgerApi.post('/api/ledger/api/v1/return-plans/immediate', { allocations })
      return (res as unknown as ApiResponse<ImmediateAllocationResponse>).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['returnPlanSummary'] })
      queryClient.invalidateQueries({ queryKey: ['returnPlans'] })
    },
  })
}


