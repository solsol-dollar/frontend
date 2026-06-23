import { getUsMarketStatus, MARKET_STATUS_LABEL, MARKET_STATUS_CLASS } from '../utils/marketHours'

export function MarketStatusBadge() {
  const status = getUsMarketStatus()
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${MARKET_STATUS_CLASS[status]}`}>
      {MARKET_STATUS_LABEL[status]}
    </span>
  )
}
