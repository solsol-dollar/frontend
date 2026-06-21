import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, MarketIndex } from '../types/securities'

const MOCK: MarketIndex[] = [
  { name: 'S&P 500', value: 5308.13, changeAmount: -500.77, changeRate: -1.6, isUp: false },
  { name: '나스닥', value: 5308.13, changeAmount: -500.77, changeRate: -1.6, isUp: false },
  { name: 'USD/KRW', value: 5308.13, changeAmount: -500.77, changeRate: -1.65, isUp: false },
]

// TODO: GET /api/v1/securities/market/indices (백엔드 구현 필요)
export function useMarketIndices() {
  return useQuery({
    queryKey: ['securities', 'market-indices'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/securities/market/indices')
      return (res as unknown as ApiResponse<MarketIndex[]>).data
    },
    initialData: MOCK,
    staleTime: 1000 * 60,
  })
}
