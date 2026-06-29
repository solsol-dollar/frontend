import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanListItem } from '../types/returnPlan'

// RP-004: GET /api/ledger/api/v1/return-plans
export function useReturnPlans(page = 0, size = 20) {
  return useQuery({
    queryKey: ['returnPlans', page, size],
    queryFn: async () => {
      const res = await ledgerApi.get('/api/ledger/api/v1/return-plans', { params: { page, size } })
      return (res as unknown as ApiResponse<{ returnPlans: ReturnPlanListItem[] }>).data.returnPlans
    },
  })
}


