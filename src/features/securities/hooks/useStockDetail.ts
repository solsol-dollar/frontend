import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, ProductDetail, OrderBookResponse } from '../types/securities'

const MOCK_DETAIL: ProductDetail = {
  productId: 1,
  ticker: 'MSFT',
  productName: '마이크로소프트',
  productType: 'OVERSEAS',
  currentPriceUsd: 2084.47,
  currentPriceKrw: 390860,
  dayChangeUsd: 38.91,
  dayChangeRate: 4.9,
  isUp: true,
  isWatchlisted: false,
}

const MOCK_ORDER_BOOK: OrderBookResponse = {
  ticker: 'MSFT',
  asks: [
    { priceUsd: 1090.58, qty: 312 },
    { priceUsd: 1006.69, qty: 245 },
    { priceUsd: 922.80, qty: 189 },
    { priceUsd: 880.86, qty: 156 },
    { priceUsd: 855.69, qty: 98 },
  ],
  bids: [
    { priceUsd: 822.13, qty: 10 },
    { priceUsd: 796.96, qty: 21 },
    { priceUsd: 755.02, qty: 287 },
    { priceUsd: 671.13, qty: 345 },
    { priceUsd: 587.24, qty: 412 },
  ],
}

// SEC-002: GET /api/v1/securities/products/{id}
export function useStockDetail(productId: string) {
  return useQuery({
    queryKey: ['securities', 'product', productId],
    queryFn: async () => {
      const res = await serviceApi.get(`/api/v1/securities/products/${productId}`)
      return (res as unknown as ApiResponse<ProductDetail>).data
    },
    initialData: MOCK_DETAIL,
    enabled: !!productId,
  })
}

// SEC-003: GET /api/v1/securities/products/{id}/quotes
export function useOrderBook(productId: string) {
  return useQuery({
    queryKey: ['securities', 'order-book', productId],
    queryFn: async () => {
      const res = await serviceApi.get(`/api/v1/securities/products/${productId}/quotes`)
      return (res as unknown as ApiResponse<OrderBookResponse>).data
    },
    initialData: MOCK_ORDER_BOOK,
    enabled: !!productId,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 10,
  })
}
