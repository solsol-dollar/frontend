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
  /** 환불금의 출처 IPO (화면 표시용 보강 필드, 명세 외 추가) */
  sourceTicker: string
  sourceCompanyName: string
  refundDate: string | null
  nextIpoInfo: NextIpoInfo | null
  savingsRate: number | null
  allocations: AllocationItem[]
}

// RP-003: PUT /api/v1/return-plans/{id}/confirm
export interface ReturnPlanConfirmResponse {
  returnPlanId: number
  confirmedAt: string
  planStatus: 'DRAFT' | 'CONFIRMED' | 'EXECUTED'
}

// RP-004: GET /api/v1/return-plans
export interface ReturnPlanListItem {
  returnPlanId: number
  subscriptionId: number
  totalRefundAmount: number
  planStatus: 'DRAFT' | 'CONFIRMED' | 'EXECUTED'
  confirmedAt: string | null
  /** 화면 표시용 보강 필드 (명세 외 추가) */
  sourceTicker: string
  sourceCompanyName: string
  refundDate: string | null
}
