import { useMutation } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, TradeOrderRequest, TradeOrderResponse } from '../types/securities'

const USD_KRW = 1368.5

// ORD-001: POST /api/v1/trade-orders (service-app:8081)
export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (req: TradeOrderRequest) => {
      const res = await serviceApi.post('/api/v1/trade-orders', req)
      const raw = (res as unknown as ApiResponse<any>).data
      const now = new Date()
      const hour = now.getHours() < 12 ? `오전 ${now.getHours()}시` : `오후 ${now.getHours() - 12 || 12}시`
      return {
        orderId: raw.orderId,
        ticker: raw.ticker,
        productName: raw.productName,
        pricePerShareUsd: raw.executedPrice ?? 0,
        estimatedFeeKrw: 1000,
        qty: raw.quantity ?? 0,
        estimatedTotalKrw: Math.round((raw.executedAmount ?? 0) * USD_KRW),
        scheduledAt: `오늘 ${hour} 30분 주문 예정`,
      } satisfies TradeOrderResponse
    },
  })
}
