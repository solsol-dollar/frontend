import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanPresetResponse } from '../types/returnPlan'

// RP-005: GET /api/ledger/api/v1/return-plans/presets
export function useReturnPlanPresets() {
  return useQuery({
    queryKey: ['returnPlanPresets'],
    queryFn: async () => {
      const res = await ledgerApi.get('/api/ledger/api/v1/return-plans/presets')
      return (res as unknown as ApiResponse<ReturnPlanPresetResponse[]>).data
    },
  })
}


