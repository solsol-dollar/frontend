export type ChartPeriod = '5MIN' | '1D' | '1W' | '1M'

export type UiPeriod = '5분' | '일' | '주' | '월'

export const PERIOD_MAP: Record<UiPeriod, ChartPeriod> = {
  '5분': '5MIN',
  '일':  '1D',
  '주':  '1W',
  '월':  '1M',
}

export interface ChartCandle {
  date: string    // "20260618"
  time?: string   // "093500" — 5MIN(분봉)에만 존재, 백엔드 @JsonInclude(NON_NULL)로 다른 기간엔 키 자체 없음
  open: number
  high: number
  low: number
  close: number
  volume: number
  sign?: string   // "2"=상승 "3"=보합 "5"=하락, MINUTE는 키 없음
}

export interface ChartResponse {
  ticker: string
  period: ChartPeriod
  candleType: 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH'
  candles: ChartCandle[]
}
