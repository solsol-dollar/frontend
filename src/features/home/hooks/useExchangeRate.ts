import { useEffect, useState } from 'react'

export interface ExchangeRate {
  price: number
  tts: number
  ttb: number
  spread: number
  change: number
  changeRate: number
  sign: string
  high: number
  low: number
  open: number
  updatedAt: string
}

export function useExchangeRate() {
  const [rate, setRate] = useState<ExchangeRate | null>(null)

  useEffect(() => {
    fetch('/api/v1/exchange/rate/market')
      .then(r => r.json())
      .then(res => setRate(res.data ?? res))
      .catch(() => {})

    const es = new EventSource('/api/v1/exchange/rate/stream')
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        setRate(parsed.data ?? parsed)
      } catch {}
    }
    es.onerror = () => {}

    return () => es.close()
  }, [])

  return rate
}
