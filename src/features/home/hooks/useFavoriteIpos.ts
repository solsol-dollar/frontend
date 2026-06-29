import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { serviceApi } from '@/lib/axios'

export interface FavoriteIpo {
  id: number
  ipoId: number
  ticker: string
  companyName: string
  logoUrl: string | null
  ipoStatus: 'UPCOMING' | 'OPEN' | 'CLOSED'
  subscriptionStartDate: string
  subscriptionEndDate: string
  listingDate: string | null
  confirmedOfferPrice: number
}

function calcDDay(dateStr: string): string {
  const diff = dayjs(dateStr).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diff === 0) return 'D-Day'
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}

export function getIpoDisplay(ipo: FavoriteIpo): { label: string; dday: string; isUpcoming: boolean } {
  if (ipo.ipoStatus === 'CLOSED') return { label: '청약마감', dday: '', isUpcoming: false }
  if (ipo.ipoStatus === 'OPEN') return { label: '청약가능', dday: calcDDay(ipo.subscriptionEndDate), isUpcoming: false }
  return { label: '청약예정', dday: ipo.listingDate ? calcDDay(ipo.listingDate) : '', isUpcoming: true }
}

const IPO_COLORS = ['#FF6830', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800']
export function getIpoColor(ipoId: number): string {
  return IPO_COLORS[ipoId % IPO_COLORS.length]
}

export function useFavoriteIpos() {
  return useQuery({
    queryKey: ['home', 'favorite-ipos'],
    queryFn: async () => {
      const res = (await serviceApi.get('/api/service/api/v1/home/favorite-ipos')) as unknown as {
        data: FavoriteIpo[]
      }
      return res.data
    },
    refetchOnMount: 'always',
  })
}
