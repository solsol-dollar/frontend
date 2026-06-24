import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, MarketIndex } from '../types/securities'

export function useMarketIndices() {
  return useQuery({
    queryKey: ['securities', 'market-indices'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/securities/market/indices')
      return (res as unknown as ApiResponse<MarketIndex[]>).data
    },
    // 장 중 여부는 첫 응답에서 알 수 있으므로 항상 30초 refetch
    // (백엔드 스케줄러가 60초마다 갱신하므로 30초면 충분)
    refetchInterval: 30_000,
    staleTime: 25_000,
  })
}
