import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, RecommendedProduct, ProductType } from '../types/securities'

const MOCK: RecommendedProduct[] = [
  { productId: 11, ticker: 'QQQ', productName: 'Invesco QQQ Trust', productType: 'ETF', currentPriceUsd: 478.56, changeRateDay: 1.3, isUp: true, reason: '이 IPO 종목과 관련된 나스닥 100 ETF' },
  { productId: 1, ticker: 'MSFT', productName: '마이크로소프트', productType: 'OVERSEAS', currentPriceUsd: 935.89, changeRateDay: 1.6, isUp: true, reason: '동일 섹터(테크) 대표 관련주' },
]

// SEC-005: GET /api/v1/securities/recommended?ipoId=&type=ETF|STOCK
export function useRecommendedStocks(ipoId?: number, type?: ProductType) {
  return useQuery({
    queryKey: ['securities', 'recommended', ipoId, type],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/securities/recommended', {
        params: { ...(ipoId ? { ipoId } : {}), ...(type ? { type } : {}) },
      })
      return (res as unknown as ApiResponse<RecommendedProduct[]>).data
    },
    initialData: MOCK,
    staleTime: 1000 * 60 * 5,
  })
}
