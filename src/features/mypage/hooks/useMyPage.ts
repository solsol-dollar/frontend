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

export function useMyPageAccounts() {
  return useQuery({
    queryKey: ['mypage', 'accounts'],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/mypage/accounts')) as unknown as {
        data: MyPageData
      }
      return res.data
    },
  })
}

export function useCreateDepositAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = (await serviceApi.post('/api/service/api/v1/mypage/accounts/deposit')) as unknown as {
        data: MyPageAccount
      }
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
    mutationFn: async () => {
      const res = (await serviceApi.post('/api/service/api/v1/mypage/accounts/savings')) as unknown as {
        data: MyPageAccount
      }
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
      const res = (await serviceApi.post('/api/service/api/v1/mypage/cards')) as unknown as {
        data: MyPageCard
      }
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'accounts'] })
      qc.invalidateQueries({ queryKey: ['home', 'assets'] })
    },
  })
}
