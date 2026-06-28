import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi, type CreateSubscriptionRequest, type SubscriptionListParams } from '@/features/ipo/api/subscriptionApi'

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: (params?: SubscriptionListParams) => [...subscriptionKeys.all, 'list', params] as const,
}

export function useSubscriptionList(params?: SubscriptionListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.list(params),
    queryFn: () => subscriptionApi.getList(params),
    enabled: options?.enabled ?? true,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSubscriptionRequest) => subscriptionApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: ['subscriptionResult'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'assets'] })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subscriptionId: number) => subscriptionApi.cancel(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: ['subscriptionResult'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'assets'] })
    },
  })
}
