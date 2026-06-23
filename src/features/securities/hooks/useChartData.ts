import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ChartPeriod, ChartResponse } from '../types/chart'

export function useChartData(productId: string, period: ChartPeriod) {
  return useQuery({
    queryKey: ['chart', productId, period],
    queryFn: async () => {
      // axios interceptor가 res.data를 반환하므로 응답 자체가 { code, data } 구조임
      const res = await serviceApi.get<ChartResponse>(
        `/api/v1/securities/products/${productId}/chart`,
        { params: { period } },
      )
      // interceptor가 res.data를 반환 → res는 실제로 { code: string, data: ChartResponse }
      return (res as unknown as { code: string; data: ChartResponse }).data
    },
    staleTime: period === '1D' ? 1000 * 60 : 1000 * 60 * 10,
    enabled: !!productId,
  })
}
