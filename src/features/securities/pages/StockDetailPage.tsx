import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'
import { PriceChart } from '../components/PriceChart'
import { type UiPeriod, PERIOD_MAP } from '../types/chart'

const ORDER_BOOK = [
  { price: '$1,024.10', qty: 1, up: false },
  { price: '$1,022.10', qty: 1, up: false },
  { price: '$2,084.47', qty: 1, up: true, current: true },
  { price: '$2,037.13', qty: 1, up: false },
  { price: '$2,011.34', qty: 1, up: false },
]

export function StockDetailPage() {
  const { id } = useParams()
  const [period, setPeriod] = useState<UiPeriod>('일')
  const [buyOpen, setBuyOpen] = useState(false)
  const [qty, setQty] = useState('')
  const periods: UiPeriod[] = ['5분', '일', '주', '월']

  const unitPrice = 2084.47
  const totalAmount = parseFloat(qty || '0') * unitPrice

  return (
    <div className="page-content">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={<Heart size={22} className="text-text-tertiary" />}
      />

      {/* 종목 정보 */}
      <section className="px-4 pt-4 pb-5 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
            <span className="text-xs font-bold text-text-secondary">{(id ?? 'MS').slice(0, 2)}</span>
          </div>
          <p className="text-sm text-text-secondary">{id ?? 'MSFT'} · 마이크로소프트</p>
        </div>
        <p className="text-2xl font-bold text-text-primary">$2,084.47</p>
        <p className="text-sm text-up mt-0.5">+$24.13 · +1.17%</p>

        {/* 차트 기간 선택 */}
        <div className="flex gap-2 mt-4">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'text-xs px-3 py-1 rounded-full',
                period === p ? 'bg-primary text-white' : 'bg-surface text-text-secondary',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 주가 차트 */}
        <PriceChart productId={id ?? ''} period={PERIOD_MAP[period]} className="mt-3" />
      </section>

      {/* 호가 */}
      <section className="px-4 py-4 bg-white mt-2">
        <p className="text-sm font-bold text-text-primary mb-3">호가</p>
        <div className="space-y-1.5">
          {ORDER_BOOK.map((row, i) => (
            <div
              key={i}
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-lg text-sm',
                row.current ? 'bg-up/10' : 'bg-transparent',
              )}
            >
              <span className={cn('font-medium', row.up ? 'text-up' : 'text-down')}>{row.price}</span>
              <span className="text-text-secondary">{row.qty}주</span>
            </div>
          ))}
        </div>
      </section>

      {/* 매수/매도 버튼 */}
      <div className="px-4 py-4 flex gap-3">
        <button className="flex-1 py-4 border border-down text-down rounded-xl font-semibold">
          판매하기
        </button>
        <button
          onClick={() => setBuyOpen(true)}
          className="flex-1 py-4 bg-primary text-white rounded-xl font-semibold"
        >
          구매하기
        </button>
      </div>

      {/* 구매 bottom sheet */}
      {buyOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setBuyOpen(false)}>
          <div className="w-full bg-white rounded-t-3xl px-4 pt-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-text-primary mb-1">몇 주 구매할까요?</h3>
            <p className="text-xs text-text-secondary mb-4">{id ?? 'MSFT'} · $2,084.47</p>

            {/* 수량 입력 */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setQty((q) => String(Math.max(0, parseInt(q || '0') - 1)))}
                className="w-10 h-10 rounded-full border border-border text-xl font-bold text-text-primary"
              >
                -
              </button>
              <span className="flex-1 text-center text-2xl font-bold text-text-primary">
                {qty || '0'}주
              </span>
              <button
                onClick={() => setQty((q) => String(parseInt(q || '0') + 1))}
                className="w-10 h-10 rounded-full border border-border text-xl font-bold text-text-primary"
              >
                +
              </button>
            </div>

            {/* 구매 예약 요약 */}
            <div className="p-4 bg-surface rounded-xl mb-4 space-y-2">
              <p className="text-xs font-semibold text-text-secondary mb-2">구매 예약</p>
              {[
                { label: '계좌', value: '신한투자증권 CMA 계좌' },
                { label: '내 달러 수량', value: '$2,084주' },
                { label: '구매 주 수', value: `${qty || 0}주` },
                { label: '총 구매 대금', value: `$${totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{r.label}</span>
                  <span className="font-medium text-text-primary">{r.value}</span>
                </div>
              ))}
            </div>

            <button className="w-full bg-primary text-white py-4 rounded-xl font-semibold">
              구매하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
