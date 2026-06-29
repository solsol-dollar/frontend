import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanSummaryResponse } from '../types/returnPlan'

// RP-007: GET /api/ledger/api/v1/return-plans/summary
export function useReturnPlanSummary() {
  return useQuery({
    queryKey: ['returnPlanSummary'],
    queryFn: async () => {
      const res = await ledgerApi.get('/api/ledger/api/v1/return-plans/summary')
      return (res as unknown as ApiResponse<ReturnPlanSummaryResponse>).data
    },
  })
}


