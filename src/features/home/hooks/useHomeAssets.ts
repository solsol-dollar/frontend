import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export interface Securities {
  usdAccountId: number
  krwAccountId: number
  accountNumberMasked: string
  virtualAccountNumber?: string | null
  usdBalance: number
  krwBalance: number
  totalUsdBalance: number
  // 진행 중인 청약에 묶인 홀딩액을 제외하고 지금 바로 신청에 쓸 수 있는 금액
  usdAvailableBalance: number
  krwAvailableBalance: number
}

export interface Account {
  accountId: number
  accountType: 'SAVINGS' | 'DEPOSIT'
  accountName: string
  accountNumberMasked: string
  balance: number
  reservedBalance?: number
  availableBalance?: number
  interestRate: number | null
  maturityDate: string | null
}

export interface Card {
  cardName: string
  cardNumberMasked: string
  issuerName: string
  monthlySpend: number | null
  currency: string
  monthlyCount: number | null
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
