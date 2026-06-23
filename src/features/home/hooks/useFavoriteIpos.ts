import { useQuery } from '@tanstack/react-query'
import { serviceApi } from '@/lib/axios'

export interface FavoriteIpo {
  id: number
  ipoId: number
  ticker: string
  companyName: string
  ipoStatus: 'UPCOMING' | 'OPEN' | 'CLOSED'
  subscriptionStartDate: string
  subscriptionEndDate: string
  confirmedOfferPrice: number
}

function calcDDay(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-day'
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}

export function getIpoDisplay(ipo: FavoriteIpo): { label: string; dday: string } {
  if (ipo.ipoStatus === 'CLOSED') return { label: '청약마감', dday: '마감' }
  if (ipo.ipoStatus === 'OPEN') return { label: '청약가능', dday: calcDDay(ipo.subscriptionEndDate) }
  return { label: '청약예정', dday: calcDDay(ipo.subscriptionStartDate) }
}

const IPO_COLORS = ['#FF6830', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800']
export function getIpoColor(ipoId: number): string {
  return IPO_COLORS[ipoId % IPO_COLORS.length]
}

export function useFavoriteIpos() {
  return useQuery({
    queryKey: ['home', 'favorite-ipos'],
    queryFn: async () => {
      const res = await serviceApi.get('/api/service/api/v1/home/favorite-ipos') as unknown
      // 배열로 바로 오는 경우 vs { data: [...] } 래핑 모두 처리
      if (Array.isArray(res)) return res as FavoriteIpo[]
      const wrapped = res as { data: FavoriteIpo[] }
      return wrapped.data ?? []
    },
  })
}
