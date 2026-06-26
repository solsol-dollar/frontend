import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, OrderHistoryItem } from '../types/securities'

export function useOrderHistory() {
  return useQuery({
    queryKey: ['securities', 'order-history'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/trade-orders')
      const raw = (res as unknown as ApiResponse<any[]>).data
      return raw.map((item: any) => ({
        orderId: item.orderId,
        date: typeof item.orderedAt === 'string' ? item.orderedAt.substring(0, 10) : item.orderedAt,
        ticker: item.ticker,
        productName: item.productName,
        orderType: item.orderSide as 'BUY' | 'SELL',
        status: item.orderStatus as 'COMPLETED' | 'PENDING' | 'CANCELLED',
        pricePerShareUsd: item.executedPrice ?? 0,
        qty: item.quantity ?? 0,
      })) satisfies OrderHistoryItem[]
    },
  })
}
