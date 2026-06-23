export type MarketStatus = 'pre' | 'open' | 'after' | 'closed'

export function getUsMarketStatus(): MarketStatus {
  const now = new Date()
  const etStr = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
  const [h, m] = etStr.split(':').map(Number)
  const minutes = h * 60 + m

  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const dow = etDate.getDay()
  if (dow === 0 || dow === 6) return 'closed'

  if (minutes >= 4 * 60 && minutes < 9 * 60 + 30) return 'pre'
  if (minutes >= 9 * 60 + 30 && minutes < 16 * 60) return 'open'
  if (minutes >= 16 * 60 && minutes < 20 * 60) return 'after'
  return 'closed'
}

export const MARKET_STATUS_LABEL: Record<MarketStatus, string> = {
  pre: '프리마켓',
  open: '장중',
  after: '시간외',
  closed: '마감',
}

export const MARKET_STATUS_CLASS: Record<MarketStatus, string> = {
  pre: 'text-warning bg-warning/10',
  open: 'text-success bg-success/10',
  after: 'text-text-secondary bg-surface',
  closed: 'text-text-tertiary bg-surface',
}
