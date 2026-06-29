import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, RecommendedProduct, ProductType } from '../types/securities'

// SEC-005-IPO: GET /api/v1/securities/recommended?ipoId= (IPO 섹터 기반 ETF 추천)
export function useRecommendedStocks(ipoId?: number) {
  return useQuery({
    queryKey: ['securities', 'recommended', ipoId],
    enabled: ipoId !== undefined,
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/securities/recommended', {
        params: ipoId ? { ipoId } : {},
      })
      const raw = (res as unknown as ApiResponse<any[]>).data
      return raw.map(item => ({
        productId: item.id,
        ticker: item.ticker,
        productName: item.productName,
        productType: item.productType as ProductType,
        currentPriceUsd: item.currentPrice ?? 0,
        changeRateDay: item.changeRate ?? 0,
        isUp: item.sign === '1' || item.sign === '2',
        reason: item.reason,
      })) satisfies RecommendedProduct[]
    },
    staleTime: 1000 * 60 * 5,
  })
}
