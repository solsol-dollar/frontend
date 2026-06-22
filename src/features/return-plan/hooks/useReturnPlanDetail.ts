import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'
import type { ReturnPlanResponse } from '../types/returnPlan'

// 단건 조회 (명세 외 추가): GET /api/v1/return-plans/{returnPlanId}
export function useReturnPlanDetail(returnPlanId: number) {
  return useQuery({
    queryKey: ['returnPlan', returnPlanId],
    queryFn: async () => {
      const res = await ledgerApi.get(`/api/v1/return-plans/${returnPlanId}`)
      return (res as unknown as ApiResponse<ReturnPlanResponse>).data
    },
    enabled: Number.isFinite(returnPlanId),
  })
}
