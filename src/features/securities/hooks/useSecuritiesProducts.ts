import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'
import type { ApiResponse, ProductListItem, ProductType, ProductSortType } from '../types/securities'

const MOCK_STOCKS: ProductListItem[] = [
  { productId: 1, ticker: 'MSFT', productName: '마이크로소프트', productType: 'OVERSEAS', currentPriceUsd: 935.89, changeRateDay: 1.6, isUp: true, tradeAmount: 67579, tradeVolume: 1234567, rank: 1 },
  { productId: 2, ticker: 'AAPL', productName: '애플', productType: 'OVERSEAS', currentPriceUsd: 218.27, changeRateDay: 0.8, isUp: true, tradeAmount: 51234, tradeVolume: 987654, rank: 2 },
  { productId: 3, ticker: 'NVDA', productName: '엔비디아', productType: 'OVERSEAS', currentPriceUsd: 875.43, changeRateDay: -1.2, isUp: false, tradeAmount: 43210, tradeVolume: 876543, rank: 3 },
  { productId: 4, ticker: 'GOOGL', productName: '알파벳', productType: 'OVERSEAS', currentPriceUsd: 178.92, changeRateDay: 2.1, isUp: true, tradeAmount: 38765, tradeVolume: 654321, rank: 4 },
  { productId: 5, ticker: 'AMZN', productName: '아마존', productType: 'OVERSEAS', currentPriceUsd: 192.34, changeRateDay: -0.5, isUp: false, tradeAmount: 29873, tradeVolume: 543210, rank: 5 },
  { productId: 6, ticker: 'META', productName: '메타', productType: 'OVERSEAS', currentPriceUsd: 514.78, changeRateDay: 3.2, isUp: true, tradeAmount: 21456, tradeVolume: 432109, rank: 6 },
]

const MOCK_ETFS: ProductListItem[] = [
  { productId: 10, ticker: 'SPY', productName: 'SPDR S&P 500 ETF', productType: 'ETF', currentPriceUsd: 547.23, changeRateDay: 0.9, isUp: true, tradeAmount: 88765, tradeVolume: 3456789, rank: 1 },
  { productId: 11, ticker: 'QQQ', productName: 'Invesco QQQ Trust', productType: 'ETF', currentPriceUsd: 478.56, changeRateDay: 1.3, isUp: true, tradeAmount: 72341, tradeVolume: 2345678, rank: 2 },
  { productId: 12, ticker: 'VTI', productName: 'Vanguard Total Stock', productType: 'ETF', currentPriceUsd: 238.91, changeRateDay: -0.4, isUp: false, tradeAmount: 45678, tradeVolume: 1234567, rank: 3 },
  { productId: 13, ticker: 'IWM', productName: 'iShares Russell 2000', productType: 'ETF', currentPriceUsd: 208.34, changeRateDay: -1.1, isUp: false, tradeAmount: 34567, tradeVolume: 987654, rank: 4 },
  { productId: 14, ticker: 'EFA', productName: 'iShares MSCI EAFE', productType: 'ETF', currentPriceUsd: 84.12, changeRateDay: 0.6, isUp: true, tradeAmount: 23456, tradeVolume: 765432, rank: 5 },
  { productId: 15, ticker: 'GLD', productName: 'SPDR Gold Shares', productType: 'ETF', currentPriceUsd: 234.67, changeRateDay: 1.8, isUp: true, tradeAmount: 18765, tradeVolume: 543210, rank: 6 },
]

// SEC-001: GET /api/v1/securities/products
export function useSecuritiesProducts(type: ProductType, sort: ProductSortType = 'TRADING_VALUE', keyword?: string) {
  return useQuery({
    queryKey: ['securities', 'products', type, sort, keyword],
    queryFn: async () => {
      const res = await serviceApi.get('/api/v1/securities/products', {
        params: { type, sort, ...(keyword ? { keyword } : {}) },
      })
      return (res as unknown as ApiResponse<ProductListItem[]>).data
    },
    initialData: type === 'OVERSEAS' ? MOCK_STOCKS : MOCK_ETFS,
    staleTime: 1000 * 30,
  })
}
