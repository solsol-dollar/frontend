import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export type CardCategory =
  | 'SUBSCRIPTION' | 'SHOPPING' | 'GROCERY' | 'CAFE' | 'RESTAURANT'
  | 'DELIVERY' | 'TRANSPORT' | 'TRAVEL' | 'GAME' | 'HEALTH' | 'EDUCATION' | 'ETC'

export const CATEGORY_LABEL: Record<CardCategory, string> = {
  SUBSCRIPTION: '구독',
  SHOPPING: '쇼핑',
  GROCERY: '마트',
  CAFE: '카페',
  RESTAURANT: '식당',
  DELIVERY: '배달',
  TRANSPORT: '교통',
  TRAVEL: '여행',
  GAME: '게임',
  HEALTH: '헬스',
  EDUCATION: '교육',
  ETC: '기타',
}

export interface CardTransaction {
  id: number
  merchantName: string
  category: CardCategory
  amount: number
  currency: string
  transactedAt: string
}

export interface CardSummary {
  totalCount: number
  totalAmount: number
  currency: string
  fxSavings: {
    savingsKrw: number
    savingsUsd: number
  }
  byCategory: {
    category: string
    amount: number
    count: number
  }[]
  topSpend: CardTransaction
  recurringPayments: {
    merchantName: string
    category: CardCategory
    averageAmount: number
    dayOfMonth: number
  }[]
  transactions: CardTransaction[]
}

interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

export function useCardSummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ['card', 'summary', year, month],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/v1/card/transactions/summary', {
        params: { year, month },
      })) as ApiResponse<CardSummary>
      return res.data
    },
  })
}
