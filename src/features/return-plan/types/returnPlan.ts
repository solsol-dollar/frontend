export type DestinationType = 'SECURITIES' | 'SAVINGS' | 'DEPOSIT'

export interface AllocationItem {
  destinationType: DestinationType
  ratio: number
  amount?: number
}

export interface NextIpoInfo {
  ipoId: number
  ticker: string
  subscriptionStartDate: string
}

// RP-001/002: POST,PUT /api/v1/return-plans(/{id})
export interface ReturnPlanResponse {
  returnPlanId: number
  subscriptionId: number
  totalRefundAmount: number
  sourceTicker: string
  sourceCompanyName: string
  refundDate: string | null
  subscriptionAmount: number | null
  allocationRate: number | null
  allocatedAmount: number | null
  nextIpoInfo: NextIpoInfo | null
  savingsRate: number | null
  allocations: AllocationItem[]
}

// RP-004: GET /api/v1/return-plans
export interface ReturnPlanListItem {
  returnPlanId: number
  subscriptionId: number
  totalRefundAmount: number
  planStatus: 'DRAFT' | 'EXECUTED'
  sourceTicker: string
  sourceCompanyName: string
  refundDate: string | null
  depositDate: string | null
}

// RP-007: GET /api/v1/return-plans/summary
export interface ReturnPlanSummaryResponse {
  totalPlanCount: number
  executedPlanCount: number
  totalRefundAmount: number
  securitiesAmount: number
  savingsAmount: number
  accountAmount: number
  nextIpoInfo: NextIpoInfo | null
}

// RP-005: GET /api/v1/return-plans/presets
export interface ReturnPlanPresetResponse {
  presetCode: string
  presetName: string
  securitiesRatio: number
  savingsRatio: number
  accountRatio: number
  description: string
}

// RP-008: POST /api/v1/return-plans/immediate
export interface ImmediateAllocationResponse {
  totalAmount: number
  allocations: {
    destinationType: DestinationType
    ratio: number
    amount: number
  }[]
}
