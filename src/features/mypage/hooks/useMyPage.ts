import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export interface MyPageAccount {
  accountId: number
  accountType: 'SECURITIES' | 'DEPOSIT' | 'SAVINGS'
  accountName: string
  accountNumberMasked: string
  currency: string
  balance: number
  reservedBalance: number
  availableBalance: number
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

export interface Notification {
  notificationId: number
  notificationType: string
  title: string
  message: string
  targetType: string | null
  targetId: number | null
  isRead: boolean
  sentAt: string
}

export interface NotificationSettings {
  fcmRegistered: boolean
  ipoAllocationEnabled: boolean
  ipoRefundEnabled: boolean
  idleDollarEnabled: boolean
}

export function useNotifications(params?: { isRead?: boolean; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['mypage', 'notifications', params],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/mypage/notifications', { params: { page: 0, size: 50, ...params } })) as ApiResponse<{ notifications: Notification[] }>
      return res.data.notifications
    },
    staleTime: 30_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: number) => {
      await serviceApi.put(`/api/service/api/v1/mypage/notifications/${notificationId}/read`)
    },
    onSuccess: (_, notificationId) => {
      qc.setQueriesData<Notification[]>({ queryKey: ['mypage', 'notifications'] }, (old) =>
        old?.map((n) => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      )
    },
    onError: (err) => {
      console.error('[알림 읽음 처리 실패]', err)
    },
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['mypage', 'notification-settings'],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/mypage/notification-settings')) as ApiResponse<NotificationSettings>
      return res.data
    },
  })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Omit<NotificationSettings, 'fcmRegistered'>) => {
      await serviceApi.put('/api/service/api/v1/mypage/notification-settings', body)
    },
    onSuccess: (_, variables) => {
      qc.setQueryData(['mypage', 'notification-settings'], (old: NotificationSettings | undefined) =>
        old ? { ...old, ...variables } : variables
      )
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
