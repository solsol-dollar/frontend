import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, OrderHistoryItem } from '../types/securities'

const MOCK: OrderHistoryItem[] = [
  { orderId: 1, date: '2026-06-16', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'SELL', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 2, date: '2026-06-16', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'BUY', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 3, date: '2026-06-15', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'SELL', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 4, date: '2026-06-14', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'SELL', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 5, date: '2026-06-12', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'SELL', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 6, date: '2026-06-12', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'BUY', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 7, date: '2026-06-10', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'SELL', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
  { orderId: 8, date: '2026-06-10', ticker: 'MSFT', productName: '마이크로소프트', orderType: 'SELL', status: 'COMPLETED', pricePerShareUsd: 838.91, qty: 3 },
]

// TODO: GET /api/v1/trade-orders (백엔드 구현 필요)
export function useOrderHistory() {
  return useQuery({
    queryKey: ['securities', 'order-history'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/trade-orders')
      return (res as unknown as ApiResponse<OrderHistoryItem[]>).data
    },
    initialData: MOCK,
  })
}
