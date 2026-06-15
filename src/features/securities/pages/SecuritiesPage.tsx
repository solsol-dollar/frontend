import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'

type Tab = 'MY홈' | '해외주식' | 'ETF'

const HOLDINGS = [
  { ticker: 'MSFT', name: '마이크로소프트', qty: 2, price: '$438.91', change: '+$12.40', up: true },
  { ticker: 'AAPL', name: '마이크로소프트', qty: 2, price: '$438.91', change: '+$12.40', up: true },
  { ticker: 'GOOGL', name: '마이크로소프트', qty: 2, price: '$438.91', change: '-$4.50', up: false },
]

const STOCKS = [
  { ticker: 'MSFT', name: '마이크로소프트', price: '$35,890', change: '+1.4%', up: true },
  { ticker: 'AAPL', name: '마이크로소프트', price: '$35,890', change: '+1.4%', up: true },
  { ticker: 'NVDA', name: '마이크로소프트', price: '$35,890', change: '-0.8%', up: false },
  { ticker: 'AMZN', name: '마이크로소프트', price: '$35,890', change: '+1.4%', up: true },
]

function MyHomeTab() {
  return (
    <div className="px-4 pt-4">
      <section className="mb-5">
        <p className="text-xs text-text-tertiary">총 자산</p>
        <p className="text-2xl font-bold text-text-primary mt-1">$2,084,455</p>
        <div className="flex gap-4 mt-3">
          {[
            { label: '주식 평가금', value: '$1,084,800' },
            { label: '외화예수금', value: '$1,340,800' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs text-text-tertiary">{s.label}</p>
              <p className="text-sm font-semibold text-text-primary">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-sm font-bold text-text-primary mb-3">보유 종목</p>
        <div className="space-y-3">
          {HOLDINGS.map((h) => (
            <div key={h.ticker} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                <span className="text-xs font-bold text-text-secondary">{h.ticker.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{h.name}</p>
                <p className="text-xs text-text-tertiary">{h.qty}주</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary">{h.price}</p>
                <p className={cn('text-xs', h.up ? 'text-up' : 'text-down')}>{h.change}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StockListTab({ onSelect }: { onSelect: (ticker: string) => void }) {
  return (
    <div className="px-4 pt-4">
      <p className="text-xs text-text-tertiary mb-3">실시간 차트</p>
      {/* 차트 placeholder */}
      <div className="h-32 bg-surface rounded-xl mb-4 flex items-end overflow-hidden">
        <div className="flex-1 h-full flex items-end">
          <div className="w-full h-2/3 bg-primary/10 relative">
            <div className="absolute inset-0 flex items-end">
              <div className="w-full h-px bg-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {STOCKS.map((s, i) => (
          <button
            key={s.ticker}
            onClick={() => onSelect(s.ticker)}
            className="w-full flex items-center gap-3 py-2 text-left"
          >
            <span className="text-sm text-text-tertiary w-4">{i + 1}</span>
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
              <span className="text-xs font-bold text-text-secondary">{s.ticker.slice(0, 2)}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{s.name}</p>
              <p className="text-xs text-text-tertiary">{s.ticker}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary">{s.price}</p>
              <p className={cn('text-xs', s.up ? 'text-up' : 'text-down')}>{s.change}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function SecuritiesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('MY홈')
  const tabs: Tab[] = ['MY홈', '해외주식', 'ETF']

  return (
    <div className="page-content">
      <Header showNotification showMypage={false} showSearch />

      {/* 탭 */}
      <div className="flex border-b border-border bg-white">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t ? 'border-primary text-text-primary' : 'border-transparent text-text-tertiary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'MY홈' && <MyHomeTab />}
      {tab === '해외주식' && (
        <StockListTab onSelect={(ticker) => navigate(`/securities/stocks/${ticker}`)} />
      )}
      {tab === 'ETF' && <StockListTab onSelect={(ticker) => navigate(`/securities/stocks/${ticker}`)} />}
    </div>
  )
}
