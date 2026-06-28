import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, MyHoldingsSummary } from '../types/securities'

// SEC-004: GET /api/v1/securities/holdings
export function useMyInvestments() {
  return useQuery({
    queryKey: ['securities', 'holdings'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/securities/holdings')
      const raw = (res as unknown as ApiResponse<any>).data
      const holdings = (raw.holdings ?? []).map((h: any) => ({
        productId: h.productId,
        ticker: h.ticker,
        productName: h.productName,
        productType: (h.productType as 'OVERSEAS' | 'ETF') ?? 'OVERSEAS',
        qty: h.totalQuantity ?? 0,
        avgPriceUsd: h.averagePrice ?? 0,
        currentValueUsd: h.evaluatedAmount ?? null,
        hasPrice: h.currentPrice !== null && h.currentPrice !== undefined,
        dayChangeUsd: 0,
        dayChangeRate: 0,
      }))
      return {
        totalCurrentValueUsd: raw.totalCurrentValueUsd ?? 0,
        totalCostUsd: raw.totalCostUsd ?? 0,
        hasPriceData: holdings.some((h: any) => h.hasPrice),
        dayChangeUsd: raw.dayChangeUsd ?? 0,
        dayChangeRate: 0, // 백엔드 미제공
        cashUsd: raw.cashUsd ?? 0,
        cashKrw: raw.cashKrw ?? 0,
        holdings,
      } satisfies MyHoldingsSummary
    },
  })
}
