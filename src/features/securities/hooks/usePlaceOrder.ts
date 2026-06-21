import { useMutation } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { ApiResponse, TradeOrderRequest, TradeOrderResponse } from '../types/securities'

// ORD-001: POST /api/v1/trade-orders
export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (req: TradeOrderRequest) => {
      const res = await ledgerApi.post('/api/v1/trade-orders', req)
      return (res as unknown as ApiResponse<TradeOrderResponse>).data
    },
  })
}
