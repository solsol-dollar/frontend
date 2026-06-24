import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, ProductDetail, OrderBookResponse, ProductType } from '../types/securities'

const USD_KRW = 1368.5

// SEC-002: GET /api/v1/securities/products/{id}
export function useStockDetail(productId: string) {
  return useQuery({
    queryKey: ['securities', 'product', productId],
    queryFn: async () => {
      const res = await serviceApi.get(`/api/service/api/v1/securities/products/${productId}`)
      const raw = (res as unknown as ApiResponse<any>).data
      return {
        productId: raw.id,
        ticker: raw.ticker,
        productName: raw.productName,
        productType: raw.productType as ProductType,
        currentPriceUsd: raw.price ?? 0,
        currentPriceKrw: Math.round((raw.price ?? 0) * USD_KRW),
        dayChangeUsd: raw.change ?? 0,
        dayChangeRate: raw.changeRate ?? 0,
        isUp: raw.sign === '1' || raw.sign === '2',
        isWatchlisted: false,
      } satisfies ProductDetail
    },
    enabled: !!productId,
  })
}

// SEC-003: GET /api/v1/securities/products/{id}/quotes
export function useOrderBook(productId: string) {
  return useQuery({
    queryKey: ['securities', 'order-book', productId],
    queryFn: async () => {
      const res = await serviceApi.get(`/api/service/api/v1/securities/products/${productId}/quotes`)
      const raw = (res as unknown as ApiResponse<any>).data
      return {
        ticker: raw.ticker,
        asks: (raw.askLevels ?? []).map((l: any) => ({ priceUsd: l.price, qty: l.volume })),
        bids: (raw.bidLevels ?? []).map((l: any) => ({ priceUsd: l.price, qty: l.volume })),
      } satisfies OrderBookResponse
    },
    enabled: !!productId,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 10,
  })
}
