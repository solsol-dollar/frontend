import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, MyHoldingsSummary } from '../types/securities'

// SEC-004: GET /api/v1/securities/holdings
export function useMyInvestments() {
  return useQuery({
    queryKey: ['securities', 'holdings'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/securities/holdings')
      const raw = (res as unknown as ApiResponse<any>).data
      return {
        totalCurrentValueUsd: raw.totalCurrentValueUsd ?? 0,
        totalCostUsd: raw.totalCostUsd ?? 0,
        dayChangeUsd: raw.dayChangeUsd ?? 0,
        dayChangeRate: 0, // 백엔드 미제공
        cashUsd: raw.cashUsd ?? 0,
        cashKrw: raw.cashKrw ?? 0,
        holdings: (raw.holdings ?? []).map((h: any) => ({
          productId: h.productId,
          ticker: h.ticker,
          productName: h.productName,
          productType: (h.exchangeName?.includes('NYSE') || h.exchangeName?.includes('NAS') ? 'OVERSEAS' : 'OVERSEAS') as 'OVERSEAS' | 'ETF',
          qty: h.totalQuantity ?? 0,
          avgPriceUsd: h.averagePrice ?? 0,
          currentValueUsd: h.evaluatedAmount ?? 0,
          dayChangeUsd: 0,
          dayChangeRate: 0,
        })),
      } satisfies MyHoldingsSummary
    },
  })
}
