import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'

export type ExchangeDirection = 'KRW_TO_USD' | 'USD_TO_KRW'

interface ExchangeRequest {
  direction: ExchangeDirection
  sourceAmount: number
}

export interface ExchangeResult {
  transactionId: number
  sourceAmount: number
  fromCurrency: string
  targetAmount: number
  toCurrency: string
  status: string
  completedAt: string
}

export function useExchange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (req: ExchangeRequest) => {
      const res = (await ledgerApi.post('/api/ledger/api/v1/exchange', req)) as unknown as { data: ExchangeResult }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
