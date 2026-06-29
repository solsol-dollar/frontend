import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanListItem } from '../types/returnPlan'

interface UseReturnPlansParams {
  keyword?: string
  from?: string
  to?: string
  status?: string
  page?: number
  size?: number
}

// RP-004: GET /api/ledger/api/v1/return-plans
export function useReturnPlans(params?: UseReturnPlansParams) {
  return useQuery({
    queryKey: ['returnPlans', params],
    queryFn: async () => {
      const res = await ledgerApi.get('/api/ledger/api/v1/return-plans', {
        params: { page: 0, size: 20, ...params },
      })
      return (res as unknown as ApiResponse<{ returnPlans: ReturnPlanListItem[] }>).data.returnPlans
    },
  })
}
