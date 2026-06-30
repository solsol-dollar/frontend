import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export function useCardCategoryTransactions(year: number, month: number, category?: string | null) {
  return useQuery({
    queryKey: ['card', 'category-transactions', year, month, category],
    queryFn: async () => {
      const params: Record<string, string | number> = { year, month }
      if (category) {
        params.category = category
      }
      const res = (await serviceApi.get('/api/v1/card/transactions/categories', {
        params,
      })) as any
      console.log('API response:', res.data)
      // data가 배열이면 그대로 반환, 객체 내에 items나 transactions 같은 필드가 있으면 해당 배열을 반환
      const payload = res.data
      if (payload?.categories && Array.isArray(payload.categories)) {
        const filteredCategories = category 
          ? payload.categories.filter((cat: any) => cat.category === category)
          : payload.categories
        return filteredCategories.flatMap((cat: any) => cat.transactions || [])
      }
      if (Array.isArray(payload)) return payload
      if (payload?.items && Array.isArray(payload.items)) return payload.items
      if (payload?.transactions && Array.isArray(payload.transactions)) return payload.transactions
      if (payload?.data && Array.isArray(payload.data)) return payload.data
      return []
    },
    enabled: !!year && !!month,
  })
}
