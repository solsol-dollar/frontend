import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, SellProfitsSummary } from '../types/securities'

const MOCK: SellProfitsSummary = {
  totalProfitKrw: 3292,
  isProfit: true,
  items: [
    { orderId: 1, date: '26.6.4', productType: 'OVERSEAS', ticker: 'MSFT', productName: 'SpaceX', totalSaleAmountUsd: 2.04, profitRate: 16.8, isProfit: true },
  ],
}

// TODO: GET /api/v1/trade-orders/profits (백엔드 구현 필요)
export function useSellProfits() {
  return useQuery({
    queryKey: ['securities', 'sell-profits'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/trade-orders/profits')
      return (res as unknown as ApiResponse<SellProfitsSummary>).data
    },
    initialData: MOCK,
  })
}
