import { useInfiniteQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, ProductListItem, ProductType, ProductSortType } from '../types/securities'

const PAGE_SIZE = 20

// SEC-001: GET /api/v1/securities/products (offset pagination)
export function useSecuritiesProducts(type: ProductType, sort: ProductSortType = 'TRADING_VALUE', keyword?: string) {
  return useInfiniteQuery({
    queryKey: ['securities', 'products', type, sort, keyword],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await serviceApi.get('/api/service/api/v1/securities/products', {
        params: { type, sort, offset: pageParam, limit: PAGE_SIZE, ...(keyword ? { keyword } : {}) },
      })
      const raw = (res as unknown as ApiResponse<any[]>).data
      const baseRank = (pageParam as number) + 1
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
        rank: baseRank + index,
      })) satisfies ProductListItem[]
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.flat().length
    },
    staleTime: 1000 * 30,
  })
}
