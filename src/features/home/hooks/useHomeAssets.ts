import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export interface Securities {
  usdAccountId: number
  krwAccountId: number
  accountNumberMasked: string
  usdBalance: number
  krwBalance: number
  totalUsdBalance: number
}

export interface Account {
  accountId: number
  accountType: 'SAVINGS' | 'DEPOSIT'
  accountName: string
  accountNumberMasked: string
  balance: number
  interestRate: number | null
  maturityDate: string | null
}

export interface Card {
  cardName: string
  cardNumberMasked: string
}

export interface ExchangeRateInfo {
  rate: number
  previousRate: number | null
  changeAmount: number | null
  changeRate: number | null
}

export interface HomeAssets {
  securities: Securities
  accounts: Account[]
  cards: Card[]
  exchangeRateInfo: ExchangeRateInfo
  totalUsdBalance: number
}

export function useHomeAssets() {
  return useQuery({
    queryKey: ['home', 'assets'],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/home/assets')) as unknown as {
        data: HomeAssets
      }
      return res.data
    },
  })
}
