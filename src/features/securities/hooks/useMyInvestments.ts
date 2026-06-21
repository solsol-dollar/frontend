import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, MyHoldingsSummary } from '../types/securities'

// 총 보유 = holdings 합산 (비중 bar 계산 일치)
// OVERSEAS: 4주 × $521.60 = $2,086.40 (62%)  |  ETF: 3주 × $419.20 = $1,257.60 (38%)
const MOCK: MyHoldingsSummary = {
  totalCurrentValueUsd: 3344,
  totalCostUsd: 3120,
  dayChangeUsd: 155.64,
  dayChangeRate: 4.9,
  cashUsd: 1084.45,
  cashKrw: 1_445_600,
  holdings: [
    { productId: 1, ticker: 'MSFT', productName: '마이크로소프트', productType: 'OVERSEAS', qty: 4, avgPriceUsd: 500, currentValueUsd: 2086.40, dayChangeUsd: 38.91, dayChangeRate: 4.9 },
    { productId: 2, ticker: 'SPY', productName: 'SPDR S&P 500 ETF', productType: 'ETF', qty: 3, avgPriceUsd: 400, currentValueUsd: 1257.60, dayChangeUsd: 22.10, dayChangeRate: 3.2 },
  ],
}

// SEC-004: GET /api/v1/securities/holdings
export function useMyInvestments() {
  return useQuery({
    queryKey: ['securities', 'holdings'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/securities/holdings')
      return (res as unknown as ApiResponse<MyHoldingsSummary>).data
    },
    initialData: MOCK,
  })
}
