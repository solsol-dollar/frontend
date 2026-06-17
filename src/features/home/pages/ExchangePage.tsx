import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Header } from '@/components/common/Header'
import usaIcon from '@/assets/exchange/usa.svg'
import koreaIcon from '@/assets/exchange/korea.svg'

const RATE = 1512.54
const DOLLAR_BALANCE = 50
const WON_BALANCE = 500000

const DOLLAR_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←']
const WON_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←']

export function ExchangePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const direction: 'dollar-to-won' | 'won-to-dollar' = state?.direction ?? 'dollar-to-won'
  const isDollarToWon = direction === 'dollar-to-won'

  const [amount, setAmount] = useState('')

  const onKey = (k: string) => {
    if (k === '←') { setAmount((p) => p.slice(0, -1)); return }
    if (isDollarToWon) {
      if (k === '.') { if (!amount.includes('.')) setAmount((p) => p + '.'); return }
      const [, dec] = amount.split('.')
      if (dec !== undefined && dec.length >= 2) return
    }
    if (k === '00') { setAmount((p) => p + '00'); return }
    setAmount((p) => p + k)
  }

  const convertedAmount = amount
    ? isDollarToWon
      ? (parseFloat(amount) * RATE).toLocaleString('ko-KR', { maximumFractionDigits: 0 })
      : (parseFloat(amount) / RATE).toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    : isDollarToWon ? '0' : '0.00'

  const maxBalance = isDollarToWon ? DOLLAR_BALANCE : WON_BALANCE
  const isOverBalance = !!amount && parseFloat(amount) > maxBalance
  const canComplete = !!amount && amount !== '.' && parseFloat(amount) > 0 && !isOverBalance

  const fromIcon = isDollarToWon ? usaIcon : koreaIcon
  const toIcon = isDollarToWon ? koreaIcon : usaIcon
  const fromBalance = isDollarToWon ? `$${DOLLAR_BALANCE.toFixed(2)}` : `${WON_BALANCE.toLocaleString()}원`
  const toBalance = isDollarToWon ? `${WON_BALANCE.toLocaleString()}원` : `$${DOLLAR_BALANCE.toFixed(2)}`
  const fromPlaceholder = isDollarToWon ? '0.00' : '0'
  const displayAmount = amount && !isDollarToWon
    ? parseInt(amount).toLocaleString('ko-KR')
    : amount

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="환전" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col px-5 pt-6 min-h-0">
        {/* 환율 정보 */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-text-primary">1달러 = {RATE.toLocaleString()}원</p>
          <p className="text-xs text-text-tertiary mt-0.5">95% 우대</p>
        </div>

        {/* 입력 필드 */}
        <div className="bg-surface-bg rounded-2xl px-4 py-4 flex items-center gap-3">
          <img src={fromIcon} alt="입력 통화" className="w-8 h-8" />
          <span className={`text-xl font-semibold ${amount ? 'text-primary' : 'text-text-tertiary'}`}>
            {displayAmount || fromPlaceholder}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <p className={`text-xs ${isOverBalance ? 'text-danger' : 'text-text-tertiary'}`}>잔액 {fromBalance}</p>
          {isOverBalance && <p className="text-xs text-danger">잔액이 부족합니다</p>}
        </div>

        {/* 방향 화살표 */}
        <div className="flex justify-center my-4">
          <ChevronDown size={22} className="text-text-tertiary" />
        </div>

        {/* 환산 결과 */}
        <div className="bg-surface-bg rounded-2xl px-4 py-4 flex items-center gap-3">
          <img src={toIcon} alt="출력 통화" className="w-8 h-8" />
          <span className="text-xl font-semibold text-text-primary">{convertedAmount}</span>
        </div>
        <p className="text-xs text-text-tertiary mt-2 px-1">잔액 {toBalance}</p>

        <div className="flex-1" />
      </div>

      {/* 키패드 */}
      <div className="grid grid-cols-3 bg-white">
        {(isDollarToWon ? DOLLAR_KEYS : WON_KEYS).map((k) => (
          <button
            key={k}
            onClick={() => onKey(k)}
            className="py-5 text-2xl font-normal text-text-primary active:bg-surface-neutral transition-colors"
          >
            {k}
          </button>
        ))}
      </div>

      {/* 완료 버튼 */}
      <div className="px-4 pb-10 pt-2">
        <button
          onClick={() => navigate(-1)}
          disabled={!canComplete}
          className="w-full bg-primary text-white py-4 rounded-2xl font-semibold disabled:opacity-40 transition-opacity"
        >
          완료
        </button>
      </div>
    </div>
  )
}
