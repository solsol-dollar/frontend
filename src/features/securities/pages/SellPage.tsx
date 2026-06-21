import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useStockDetail } from '../hooks/useStockDetail'
import { useMyInvestments } from '../hooks/useMyInvestments'
import { usePlaceOrder } from '../hooks/usePlaceOrder'
import type { TradeOrderResponse } from '../types/securities'

const FEE_RATE = 0.0025

export function SellPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: stock } = useStockDetail(id)
  const { data: holdings } = useMyInvestments()
  const { mutate: placeOrder, isPending } = usePlaceOrder()

  const holding = holdings?.holdings.find((h) => h.productId === Number(id))
  const maxQty = holding?.qty ?? 0

  const [qty, setQty] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<TradeOrderResponse | null>(null)

  const qtyNum = Math.min(parseInt(qty || '0'), maxQty)
  const estimatedUsd = (stock?.currentPriceUsd ?? 0) * qtyNum
  const estimatedFeeKrw = Math.round(estimatedUsd * (stock?.currentPriceKrw ?? 0 / (stock?.currentPriceUsd ?? 1)) * FEE_RATE)
  const totalKrw = Math.round(estimatedUsd * (stock?.currentPriceKrw ?? 0 / (stock?.currentPriceUsd ?? 1)))

  const handleConfirm = () => {
    if (!qtyNum || !stock) return
    placeOrder(
      {
        productId: stock.productId,
        accountId: 1, // MVP: 고정값, 실서비스에서 사용자 계좌 ID로 교체
        orderSide: 'SELL',
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
        <button onClick={() => navigate(-1)}>
          <span className="text-xl text-text-secondary">←</span>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary">{stock?.productName}</p>
          <p className={cn('text-xs', stock?.isUp ? 'text-up' : 'text-down')}>
            {stock?.isUp ? '+' : ''}{stock?.dayChangeUsd.toFixed(2)} ({stock?.isUp ? '+' : ''}{stock?.dayChangeRate.toFixed(1)}%)
          </p>
        </div>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* 판매 가격 */}
        <div className="bg-white rounded-2xl px-4 py-4">
          <p className="text-xs text-text-tertiary mb-2">판매할 가격</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-text-primary">
              ${stock?.currentPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-tertiary">{stock?.currentPriceKrw.toLocaleString()}원</p>
          </div>
        </div>

        {/* 수량 입력 — REQ-09-06-03, REQ-09-06-06 */}
        <div className="bg-white rounded-2xl px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-tertiary">수량</p>
            <button
              onClick={() => setQty(String(maxQty))}
              className="text-xs text-primary font-semibold"
            >
              전체 매도
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(String(Math.max(0, qtyNum - 1)))}
              disabled={qtyNum <= 0}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-xl font-medium text-text-primary disabled:opacity-30"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={maxQty}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              className="flex-1 text-2xl font-bold text-text-primary bg-transparent outline-none text-center placeholder:text-text-tertiary"
            />
            <button
              onClick={() => setQty(String(Math.min(maxQty, qtyNum + 1)))}
              disabled={qtyNum >= maxQty}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-xl font-medium text-text-primary disabled:opacity-30"
            >
              +
            </button>
          </div>
          {qtyNum > maxQty && (
            <p className="text-xs text-danger mt-2 text-center">보유 수량({maxQty}주)을 초과할 수 없습니다</p>
          )}
          <p className="text-xs text-text-tertiary mt-2 text-center">보유 수량 {maxQty}주</p>
        </div>

        {/* 예상 금액 */}
        {qtyNum > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">판매 수량</span>
              <span className="font-medium text-text-primary">{qtyNum}주</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">예상 판매 금액</span>
              <span className="font-medium text-text-primary">${estimatedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="text-text-secondary font-medium">총 예상 수령액</span>
              <span className="font-bold text-text-primary">{totalKrw.toLocaleString()}원</span>
            </div>
          </div>
        )}
      </div>

      {/* 판매하기 버튼 */}
      <div className="px-4 py-4 bg-white border-t border-border">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!qtyNum || qtyNum > maxQty}
          className="w-full py-4 bg-down text-white rounded-2xl font-semibold text-base disabled:opacity-40"
        >
          판매하기
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
                { label: '주문 유형', value: '시장가 판매' },
                { label: '판매 수량', value: `${qtyNum}주` },
                { label: '1주 현재가', value: `$${stock?.currentPriceUsd.toFixed(2)}` },
                { label: '예상 수수료', value: `${estimatedFeeKrw.toLocaleString()}원` },
                { label: '총 예상 수령액', value: `${totalKrw.toLocaleString()}원` },
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
                className="flex-1 py-4 bg-down text-white rounded-2xl font-semibold disabled:opacity-40"
              >
                {isPending ? '처리 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 판매 완료 바텀시트 */}
      {result && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl px-5 pt-3 pb-8">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <p className="text-sm text-text-secondary text-center mb-1">{result.productName}</p>
            <p className="text-2xl font-bold text-down text-center">판매 완료</p>
            <p className="text-xs text-text-tertiary text-center mt-1 mb-6">{result.scheduledAt}</p>

            <div className="space-y-3 border-t border-border pt-4">
              {[
                { label: '판매 수량', value: `${result.qty}주` },
                { label: '예상 수수료', value: `${result.estimatedFeeKrw.toLocaleString()}원` },
                { label: '총 수령 예정', value: `${result.estimatedTotalKrw.toLocaleString()}원` },
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
