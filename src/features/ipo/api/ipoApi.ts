import { serviceApi } from '@/lib/axios'

interface ApiResponse<T> {
  code: string
  message: string
  data: T
}

export interface IpoListItem {
  id: number
  ticker: string
  companyName: string
  ipoStatus: string
  subscriptionStartDate: string
  subscriptionEndDate: string
  listingDate: string
  offerPriceMin: number | null
  offerPriceMax: number | null
  confirmedOfferPrice: number | null
  isFavorite: boolean
  logoUrl: string | null
}

export interface IpoDetailItem {
  id: number
  ticker: string
  companyName: string
  exchangeName: string
  sector: string
  ipoStatus: string
  subscriptionStartDate: string
  subscriptionEndDate: string
  listingDate: string
  refundDate: string | null
  depositDate: string | null
  offerPriceMin: number | null
  offerPriceMax: number | null
  confirmedOfferPrice: number | null
  minimumSubscriptionAmount: number | null
  isFavorite: boolean
  numberOfShares: number | null
  logoUrl: string | null
}

export interface FavoriteIpoItem {
  id: number
  ipoId: number
  ticker: string
  companyName: string
  ipoStatus: string
  subscriptionStartDate: string
  subscriptionEndDate: string
  confirmedOfferPrice: number | null
}

interface IpoListData {
  ipos: IpoListItem[]
  total: number
  page: number
  size: number
}

export const ipoApi = {
  getList: (params?: {
    status?: 'OPEN' | 'UPCOMING' | 'CLOSED'
    favoriteOnly?: boolean
    page?: number
    size?: number
  }): Promise<ApiResponse<IpoListData>> =>
    serviceApi.get('/api/v1/ipos', { params }),

  getDetail: (ipoId: number): Promise<ApiResponse<IpoDetailItem>> =>
    serviceApi.get(`/api/v1/ipos/${ipoId}`),

  addFavorite: (ipoId: number): Promise<ApiResponse<unknown>> =>
    serviceApi.post(`/api/v1/ipos/${ipoId}/favorites`),

  removeFavorite: (ipoId: number): Promise<ApiResponse<null>> =>
    serviceApi.delete(`/api/v1/ipos/${ipoId}/favorites`),

  getFavorites: (limit?: number): Promise<ApiResponse<{ favorites: FavoriteIpoItem[] }>> =>
    serviceApi.get('/api/v1/favorites/ipos', limit ? { params: { limit } } : undefined),
}
