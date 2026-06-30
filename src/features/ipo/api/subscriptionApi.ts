import { ledgerApi } from '@/lib/axios'
import type { ApiResponse } from '@/features/securities/types/securities'

export type SubscriptionStatusCode = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED'

export interface SubscriptionRes {
  subscriptionId: number
  subscriptionResultId?: number
  ipoId: number
  requestedShares: number
  subscriptionAmount: number
  subscriptionAgencyDeposit: number
  currency: string
  subscriptionStatus: SubscriptionStatusCode
  subscribedAt: string
  confirmedAt: string | null
  ticker: string
  companyName: string
  offerPriceMin: number
  offerPriceMax: number
  confirmedOfferPrice: number | null
  subscriptionEndDate: string | null
  listingDate: string | null
  resultStatus: string | null
  logoUrl: string | null
}

export interface SubscriptionCancelRes {
  subscriptionId: number
  refundAmount: number
  currency: string
  refundAccountId: number
  refundAccountNumberMasked: string
  refundInstitutionName: string
}

export interface CreateSubscriptionRequest {
  ipoId: number
  securitiesAccountId: number
  subscriptionAmount: number
  offerPrice: number
}

export interface SubscriptionListParams {
  ipoId?: number
  status?: SubscriptionStatusCode
  from?: string
  to?: string
}

export const subscriptionApi = {
  create: (body: CreateSubscriptionRequest): Promise<ApiResponse<SubscriptionRes>> =>
    ledgerApi.post('/api/ledger/api/v1/subscriptions', body),

  cancel: (subscriptionId: number): Promise<ApiResponse<SubscriptionCancelRes>> =>
    ledgerApi.delete(`/api/ledger/api/v1/subscriptions/${subscriptionId}`),

  getList: (params?: SubscriptionListParams): Promise<ApiResponse<{ subscriptions: SubscriptionRes[] }>> =>
    ledgerApi.get('/api/ledger/api/v1/subscriptions', { params }),
}
