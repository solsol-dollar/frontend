import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export interface IdleStatus {
  isIdle: boolean
  accountId: number | null
  idleBalance: number | null
  idleDays: number
  detectedAt: string | null
}

interface IdleStatusResponse {
  code: string
  message: string
  data: IdleStatus
}

export function useIdleStatus() {
  return useQuery({
    queryKey: ['home', 'idle-status'],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/inflow/idle-status')) as unknown as IdleStatusResponse
      return res.data
    },
  })
}
