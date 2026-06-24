import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export interface MyPageAccount {
  accountId: number
  accountType: 'SECURITIES' | 'DEPOSIT' | 'SAVINGS'
  accountName: string
  accountNumberMasked: string
  currency: string
  balance: number
  interestRate: number | null
  maturityDate: string | null
}

export interface MyPageCard {
  cardId: number
  cardName: string
  cardNumberMasked: string
  issuerName: string
}

interface MyPageData {
  accounts: MyPageAccount[]
  cards: MyPageCard[]
}

interface ApiResponse<T> {
  data: T
  code?: number
  message?: string
}

export function useMyPageAccounts() {
  return useQuery({
    queryKey: ['mypage', 'accounts'],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/mypage/accounts')) as ApiResponse<MyPageData>
      return res.data
    },
  })
}

export function useCreateDepositAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = (await serviceApi.post('/api/service/api/v1/mypage/accounts/deposit')) as ApiResponse<MyPageAccount>
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'accounts'] })
      qc.invalidateQueries({ queryKey: ['home', 'assets'] })
    },
  })
}

export function useCreateSavingsAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (maturityDate: string) => {
      const res = (await serviceApi.post('/api/service/api/v1/mypage/accounts/savings', { maturityDate })) as ApiResponse<MyPageAccount>
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'accounts'] })
      qc.invalidateQueries({ queryKey: ['home', 'assets'] })
    },
  })
}

export function useIssueCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = (await serviceApi.post('/api/service/api/v1/mypage/cards')) as ApiResponse<MyPageCard>
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'accounts'] })
      qc.invalidateQueries({ queryKey: ['home', 'assets'] })
    },
  })
}
