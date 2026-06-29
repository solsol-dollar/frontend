import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ipoApi } from '@/features/ipo/api/ipoApi'

export const ipoKeys = {
  all: ['ipos'] as const,
  lists: () => [...ipoKeys.all, 'list'] as const,
  list: (params?: object) => [...ipoKeys.lists(), params] as const,
  detail: (id: number) => [...ipoKeys.all, 'detail', id] as const,
  favorites: (limit?: number) => [...ipoKeys.all, 'favorites', limit] as const,
}

export function useIpoList(params?: { keyword?: string; status?: 'OPEN' | 'UPCOMING' | 'CLOSED'; size?: number }) {
  return useQuery({
    queryKey: ipoKeys.list(params),
    queryFn: () => ipoApi.getList({ size: 100, ...params }),
  })
}

export function useIpoDetail(ipoId: number) {
  return useQuery({
    queryKey: ipoKeys.detail(ipoId),
    queryFn: () => ipoApi.getDetail(ipoId),
    enabled: ipoId > 0,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ipoId, isFavorite }: { ipoId: number; isFavorite: boolean }) =>
      isFavorite ? ipoApi.removeFavorite(ipoId) : ipoApi.addFavorite(ipoId),
    onMutate: async ({ ipoId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ipoKeys.detail(ipoId) })
      const previous = queryClient.getQueryData(ipoKeys.detail(ipoId))
      queryClient.setQueryData(ipoKeys.detail(ipoId), (old: any) =>
        old ? { ...old, data: { ...old.data, isFavorite: !isFavorite } } : old
      )
      return { previous, ipoId }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ipoKeys.detail(context.ipoId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ipoKeys.all })
      queryClient.invalidateQueries({ queryKey: ['home', 'favorite-ipos'] })
    },
  })
}

export function useIpoFavorites(limit?: number) {
  return useQuery({
    queryKey: ipoKeys.favorites(limit),
    queryFn: () => ipoApi.getFavorites(limit),
  })
}

export function useIpoNews(ipoId: number, size = 3) {
  return useQuery({
    queryKey: [...ipoKeys.detail(ipoId), 'news', size],
    queryFn: () => ipoApi.getNews(ipoId, size),
    enabled: ipoId > 0,
  })
}

export function useIpoTopNews(ipoId: number) {
  return useQuery({
    queryKey: [...ipoKeys.detail(ipoId), 'news', 'top'],
    queryFn: () => ipoApi.getTopNews(ipoId),
    enabled: ipoId > 0,
  })
}

export function useIpoNewsDetail(ipoId: number, newsId: number) {
  return useQuery({
    queryKey: [...ipoKeys.detail(ipoId), 'news', newsId],
    queryFn: () => ipoApi.getNewsDetail(ipoId, newsId),
    enabled: ipoId > 0 && newsId > 0,
  })
}

export function useIpoScore(ipoId: number) {
  return useQuery({
    queryKey: ['ipo-score', ipoId],
    queryFn: () => ipoApi.getScore(ipoId),
    enabled: ipoId > 0,
  })
}

export function useIpoFinancials(ipoId: number) {
  return useQuery({
    queryKey: [...ipoKeys.detail(ipoId), 'financials'],
    queryFn: () => ipoApi.getFinancials(ipoId),
    enabled: ipoId > 0,
  })
}
