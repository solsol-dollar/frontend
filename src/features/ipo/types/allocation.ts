// ALLOC-002: GET /api/v1/subscription-results/{subscriptionResultId}
export interface AllocationResultDetail {
  subscriptionResultId: number
  subscriptionAmount: number
  allocatedAmount: number | null
  feeAmount: number | null
  refundAmount: number | null
  allocationRate: number | null
  allocatedShares: number | null
  currentPrice: number | null
  pnlUsd: number | null
  listingDate: string | null
  hasReturnPlan: boolean
}
