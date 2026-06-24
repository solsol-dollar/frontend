import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, ProductListItem, ProductType, ProductSortType } from '../types/securities'

// SEC-001: GET /api/v1/securities/products
export function useSecuritiesProducts(type: ProductType, sort: ProductSortType = 'TRADING_VALUE', keyword?: string) {
  return useQuery({
    queryKey: ['securities', 'products', type, sort, keyword],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/securities/products', {
        params: { type, sort, ...(keyword ? { keyword } : {}) },
      })
      const raw = (res as unknown as ApiResponse<any[]>).data
      return raw.map((item, index) => ({
        productId: item.id,
        ticker: item.ticker,
        productName: item.productName,
        productType: item.productType as ProductType,
        currentPriceUsd: item.price ?? 0,
        changeRateDay: item.changeRate ?? 0,
        isUp: item.sign === '1' || item.sign === '2',
        tradeAmount: item.tradeAmount ?? 0,
        tradeVolume: item.volume ?? 0,
        sparkPrices: (item.sparkPrices ?? []).map(Number),
        rank: index + 1,
      })) satisfies ProductListItem[]
    },
    staleTime: 1000 * 30,
  })
}
