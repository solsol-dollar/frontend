import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, RankingItem } from '../types/securities'

export type RankingType = 'gainer' | 'loser' | 'volume'

export function useRanking(type: RankingType = 'gainer', limit = 5, productType?: 'OVERSEAS' | 'ETF') {
  return useQuery({
    queryKey: ['securities', 'ranking', type, limit, productType],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/securities/products/ranking', {
        params: { type, limit, ...(productType && { productType }) },
      })
      const raw = (res as unknown as ApiResponse<any[]>).data
      return raw.map((item) => ({
        id: item.id,
        ticker: item.ticker,
        productName: item.productName,
        close: item.close ?? 0,
        changeRate: item.changeRate ?? 0,
        sign: item.sign ?? '3',
      })) satisfies RankingItem[]
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}
