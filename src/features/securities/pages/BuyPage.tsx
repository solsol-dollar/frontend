import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStockDetail } from '../hooks/useStockDetail'
import { usePlaceOrder } from '../hooks/usePlaceOrder'
import { useMyInvestments } from '../hooks/useMyInvestments'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import type { TradeOrderResponse } from '../types/securities'
import { useMarketStatus } from '../utils/marketHours'

const FEE_RATE = 0.0025

export function BuyPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: stock } = useStockDetail(id)
  const { mutate: placeOrder, isPending } = usePlaceOrder()
  const { data: holdings } = useMyInvestments()
  const { data: assets } = useHomeAssets()

  const availableCash = holdings?.cashUsd ?? 0
  const maxBuyQty = stock?.currentPriceUsd && stock.currentPriceUsd > 0
    ? Math.floor(availableCash / stock.currentPriceUsd)
    : 0

  const marketStatus = useMarketStatus()
  const canTrade = marketStatus === 'open'

  const [qty, setQty] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<TradeOrderResponse | null>(null)

  const qtyNum = parseInt(qty || '0')
  const estimatedUsd = (stock?.currentPriceUsd ?? 0) * qtyNum
  const krwRate = stock ? stock.currentPriceKrw / stock.currentPriceUsd : 0
  const estimatedFeeKrw = Math.round(estimatedUsd * krwRate * FEE_RATE)
  const totalKrw = Math.round(estimatedUsd * krwRate)

  const handleConfirm = () => {
    if (!qtyNum || !stock) return
    placeOrder(
      {
        productId: stock.productId,
        accountId: assets?.securities.usdAccountId ?? 1,
        orderSide: 'BUY',
        quantity: qtyNum,
        requestedPrice: stock.currentPriceUsd,
      },
      {
        onSuccess: (data) => {
          setShowConfirm(false)
          setResult(data)
        },
      },
    )
  }

  return (
    <div className="flex flex-col h-screen bg-surface-bg">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div className="flex-1 text-center min-w-0 px-3">
          <p className="text-sm font-semibold text-text-primary truncate">{stock?.ticker} · {stock?.productName}</p>
          <p className={cn('text-xs', stock?.isUp ? 'text-up' : 'text-down')}>
            ${stock?.currentPriceUsd.toFixed(2)} {stock?.isUp ? '+' : ''}{stock?.dayChangeRate.toFixed(1)}%
          </p>
        </div>
        <div className="w-8 flex-shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* 구매 가격 */}
        <div className="bg-white rounded-2xl px-4 py-4">
          <p className="text-xs text-text-tertiary mb-2">구매할 가격</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-text-primary">
              ${stock?.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-tertiary">{stock?.currentPriceKrw.toLocaleString()}원</p>
          </div>
        </div>

        {/* 수량 입력 — REQ-09-06-03 */}
        <div className="bg-white rounded-2xl px-4 py-4">
          <p className="text-xs text-text-tertiary mb-3">수량</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(String(Math.max(0, qtyNum - 1)))}
              disabled={qtyNum <= 0}
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-xl font-medium text-text-primary disabled:opacity-30"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              className="flex-1 text-2xl font-bold text-text-primary bg-transparent outline-none text-center placeholder:text-text-tertiary"
            />
            <button
              onClick={() => setQty(String(qtyNum + 1))}
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-xl font-medium text-text-primary"
            >
              +
            </button>
          </div>
          <p className="text-xs text-text-tertiary mt-3 text-center">
            구매가능 ${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })} · 최대 {maxBuyQty}주
          </p>
        </div>

        {/* 예상 금액 */}
        {qtyNum > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">구매 수량</span>
              <span className="font-medium text-text-primary">{qtyNum}주</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">예상 구매 금액</span>
              <span className="font-medium text-text-primary">${estimatedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-text-secondary font-medium">총 예상 결제액</span>
              <span className="font-bold text-text-primary">{totalKrw.toLocaleString()}원</span>
            </div>
          </div>
        )}
      </div>

      {/* 구매하기 버튼 */}
      <div className="px-4 pt-3 pb-4 bg-white border-t border-border">
        {!canTrade && (
          <p className="text-center text-[11px] text-text-tertiary mb-2">
            미국 장 마감 중 · 23:30 ~ 06:00에 거래 가능
          </p>
        )}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!qtyNum || !canTrade}
          className="w-full py-4 bg-up text-white rounded-2xl font-semibold text-base disabled:opacity-40"
        >
          구매하기
        </button>
      </div>

      {/* 주문 확인 바텀시트 */}
      {showConfirm && !result && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl px-5 pt-3 pb-8">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <p className="text-base font-bold text-text-primary text-center mb-1">{stock?.productName}</p>
            <p className="text-xs text-text-tertiary text-center mb-6">주문 내용을 확인해 주세요</p>

            <div className="space-y-3 border-t border-border pt-4">
              {[
                { label: '주문 유형', value: '시장가 구매' },
                { label: '구매 수량', value: `${qtyNum}주` },
                { label: '1주 현재가', value: `$${stock?.currentPriceUsd.toFixed(2)}` },
                { label: '예상 수수료', value: `${estimatedFeeKrw.toLocaleString()}원` },
                { label: '총 예상 결제액', value: `${totalKrw.toLocaleString()}원` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{r.label}</span>
                  <span className="font-medium text-text-primary">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 bg-surface rounded-2xl font-semibold text-text-secondary"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 py-4 bg-up text-white rounded-2xl font-semibold disabled:opacity-40"
              >
                {isPending ? '처리 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 구매 완료 바텀시트 */}
      {result && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl px-5 pt-3 pb-8">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <p className="text-sm text-text-secondary text-center mb-1">{result.productName}</p>
            <p className="text-2xl font-bold text-up text-center">구매 완료</p>
            <p className="text-xs text-text-tertiary text-center mt-1 mb-6">{result.scheduledAt}</p>

            <div className="space-y-3 border-t border-border pt-4">
              {[
                { label: '구매 수량', value: `${result.qty}주` },
                { label: '예상 수수료', value: `${result.estimatedFeeKrw.toLocaleString()}원` },
                { label: '총 예상 결제액', value: `${result.estimatedTotalKrw.toLocaleString()}원` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{r.label}</span>
                  <span className="font-medium text-text-primary">{r.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/securities')}
              className="w-full py-4 mt-6 bg-surface rounded-2xl font-semibold text-text-secondary"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
