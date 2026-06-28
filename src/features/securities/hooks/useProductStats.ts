import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, ProductStats } from '../types/securities'

export function useProductStats(productId: string) {
  return useQuery({
    queryKey: ['securities', 'stats', productId],
    queryFn: async () => {
      const res = await serviceApi.get(`/api/service/api/v1/securities/products/${productId}/stats`)
      const raw = (res as unknown as ApiResponse<any>).data
      return {
        ticker: raw.ticker,
        week52High: raw.week52High ?? null,
        week52Low: raw.week52Low ?? null,
        returns: raw.returns ?? {},
      } satisfies ProductStats
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })
}
