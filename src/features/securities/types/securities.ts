// API 응답 래퍼
export interface ApiResponse<T> {
  code: string
  data: T
}

// ─── 보유 종목 & MY홈 ───────────────────────────────────────────
export interface HoldingItem {
  productId: number
  ticker: string
  productName: string
  productType: 'OVERSEAS' | 'ETF'
  qty: number
  avgPriceUsd: number
  currentValueUsd: number
  dayChangeUsd: number
  dayChangeRate: number
}

// SEC-004: GET /api/v1/securities/holdings
export interface MyHoldingsSummary {
  totalCurrentValueUsd: number
  totalCostUsd: number
  dayChangeUsd: number
  dayChangeRate: number
  cashUsd: number   // 외화예수금
  cashKrw: number   // 원화
  holdings: HoldingItem[]
}

// ─── 종목 목록 ────────────────────────────────────────────────
// SEC-001: GET /api/v1/securities/products?type=OVERSEAS|ETF&sort=TRADING_VALUE|TRADING_VOLUME|RISE|FALL&keyword=
export type ProductSortType = 'TRADING_VALUE' | 'TRADING_VOLUME' | 'RISE' | 'FALL'
export type ProductType = 'OVERSEAS' | 'ETF'

export interface ProductListItem {
  sparkPrices: number[]
  productId: number
  ticker: string
  productName: string
  productType: ProductType
  currentPriceUsd: number
  changeRateDay: number
  isUp: boolean
  tradeAmount: number   // 거래대금 (백만 달러)
  tradeVolume: number   // 거래량
  rank: number
}

// ─── 종목 상세 ────────────────────────────────────────────────
// SEC-002: GET /api/v1/securities/products/{id}
export interface ProductDetail {
  productId: number
  ticker: string
  productName: string
  productType: ProductType
  currentPriceUsd: number
  currentPriceKrw: number
  dayChangeUsd: number
  dayChangeRate: number
  isUp: boolean
  isWatchlisted: boolean
}

// ─── 호가 ────────────────────────────────────────────────────
// SEC-003: GET /api/v1/securities/products/{id}/quotes
export interface OrderBookEntry {
  priceUsd: number
  qty: number
}

export interface OrderBookResponse {
  ticker: string
  asks: OrderBookEntry[]  // 매도 (sell)
  bids: OrderBookEntry[]  // 매수 (buy)
}

// ─── 마켓 인덱스 ──────────────────────────────────────────────
// GET /api/v1/securities/market/indices
export interface MarketIndex {
  name: string          // "S&P 500" | "나스닥" | "USD/KRW"
  value: number
  changeAmount: number
  changeRate: number
  isUp: boolean
  isMarketOpen: boolean
}

// ─── 주문 내역 ────────────────────────────────────────────────
// GET /api/v1/trade-orders
export type OrderType = 'BUY' | 'SELL'
export type OrderStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED'

export interface OrderHistoryItem {
  orderId: number
  date: string          // "2026-06-16"
  ticker: string
  productName: string
  orderType: OrderType
  status: OrderStatus
  pricePerShareUsd: number
  qty: number
}

// ─── 판매 수익 ────────────────────────────────────────────────
// GET /api/v1/trade-orders/profits
export interface SellProfitItem {
  orderId: number
  date: string
  productType: ProductType
  ticker: string
  productName: string
  totalSaleAmountUsd: number
  profitRate: number
  isProfit: boolean
}

export interface SellProfitsSummary {
  totalProfitKrw: number
  isProfit: boolean
  items: SellProfitItem[]
}

// ─── 추천 종목 ───────────────────────────────────────────────
// SEC-005: GET /api/v1/securities/recommended?ipoId=&type=ETF|STOCK
export interface RecommendedProduct {
  productId: number
  ticker: string
  productName: string
  productType: ProductType
  currentPriceUsd: number
  changeRateDay: number
  isUp: boolean
  reason: string   // 추천 이유
}

// ─── 주문 요청/응답 ───────────────────────────────────────────
// ORD-001: POST /api/v1/trade-orders
export interface TradeOrderRequest {
  productId: number
  accountId: number      // 증권 계좌 ID (MVP: 1 고정)
  orderSide: 'BUY' | 'SELL'
  quantity: number
  requestedPrice: number // 현재가 (시장가 주문)
}

export type OrderSide = 'BUY' | 'SELL'

export interface TradeOrderResponse {
  orderId: number
  ticker: string
  productName: string
  pricePerShareUsd: number
  estimatedFeeKrw: number
  qty: number
  estimatedTotalKrw: number
  scheduledAt: string   // "오늘 오후 10시 30분 주문 예정"
}
