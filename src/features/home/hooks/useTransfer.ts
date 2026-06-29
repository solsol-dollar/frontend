import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'

interface TransferRequest {
  fromAccountId: number
  toAccountId: number
  amount: number
}

export interface TransferResult {
  transactionId: number
  fromAccountId: number
  toAccountId: number
  toAccountType: string
  toVirtualAccountNumber: string | null
  amount: number
  currency: string
  status: string
  completedAt: string
  executedAt: string
}

export function useTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (req: TransferRequest) => {
      const res = (await ledgerApi.post('/api/ledger/api/v1/transfer', req)) as unknown as { data: TransferResult }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
