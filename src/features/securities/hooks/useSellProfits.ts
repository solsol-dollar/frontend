import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, SellProfitsSummary, ProductType } from '../types/securities'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getFullYear()).slice(2)}.${d.getMonth() + 1}.${d.getDate()}`
}

// TODO: GET /api/v1/trade-orders/profits (백엔드 구현 필요)
export function useSellProfits() {
  return useQuery({
    queryKey: ['securities', 'sell-profits'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/trade-orders/profits')
      const raw = (res as unknown as ApiResponse<any>).data
      return {
        totalProfitKrw: raw.totalProfitKrw ?? 0,
        isProfit: raw.isProfit ?? false,
        items: (raw.items ?? []).map((item: any) => ({
          orderId: item.orderId,
          date: formatDate(item.date),
          productType: item.productType as ProductType,
          ticker: item.ticker,
          productName: item.productName,
          totalSaleAmountUsd: item.totalSaleAmountUsd ?? 0,
          profitRate: item.profitRate ?? 0,
          isProfit: item.isProfit ?? false,
        })),
      } satisfies SellProfitsSummary
    },
  })
}
