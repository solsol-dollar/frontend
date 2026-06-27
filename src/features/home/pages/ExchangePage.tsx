import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'
import usaIcon from '@/assets/exchange/usa.svg'
import koreaIcon from '@/assets/exchange/korea.svg'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { useExchange } from '@/features/home/hooks/useExchange'
import { useAnimatedInput } from '@/hooks/useAnimatedInput'
import { useState } from 'react'

const DOLLAR_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←']
const WON_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←']

export function ExchangePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const direction: 'dollar-to-won' | 'won-to-dollar' = state?.direction ?? 'dollar-to-won'
  const isDollarToWon = direction === 'dollar-to-won'
  const returnTo: string | undefined = state?.returnTo
  const depth: number = state?.depth ?? 0

  const { data: assets } = useHomeAssets()
  const rate = assets?.exchangeRateInfo?.rate ?? 0
  const usdBalance = assets?.securities?.usdAvailableBalance ?? 0
  const krwBalance = assets?.securities?.krwBalance ?? 0

  const { chars, amount, pushChar, popChar } = useAnimatedInput()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { mutateAsync: exchange, isPending } = useExchange()

  const onKey = (k: string) => {
    if (k === '←') { popChar(); return }
    if (isDollarToWon) {
      if (k === '.') {
        if (!amount.includes('.')) pushChar('.')
        return
      }
      const [, dec] = amount.split('.')
      if (dec !== undefined && dec.length >= 2) return
    }
    if (k === '00') { pushChar('0'); pushChar('0'); return }
    pushChar(k)
  }

  const amountNum = parseFloat(amount) || 0
  const convertedAmount = amountNum > 0 && rate > 0
    ? isDollarToWon
      ? (amountNum * rate).toLocaleString('ko-KR', { maximumFractionDigits: 0 })
      : (amountNum / rate).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : isDollarToWon ? '0' : '0.00'

  const maxBalance = isDollarToWon ? usdBalance : krwBalance
  const isOverBalance = amountNum > 0 && amountNum > maxBalance
  const canComplete = amountNum > 0 && !isOverBalance && !!rate

  const fromIcon = isDollarToWon ? usaIcon : koreaIcon
  const toIcon = isDollarToWon ? koreaIcon : usaIcon
  const fromBalance = isDollarToWon
    ? `$${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `${krwBalance.toLocaleString('ko-KR')}원`
  const toBalance = isDollarToWon
    ? `${krwBalance.toLocaleString('ko-KR')}원`
    : `$${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const fromPlaceholder = isDollarToWon ? '0.00' : '0'

  const handleComplete = async () => {
    setErrorMsg(null)
    try {
      const result = await exchange({
        direction: isDollarToWon ? 'USD_TO_KRW' : 'KRW_TO_USD',
        sourceAmount: amountNum,
      })
      navigate('/home/exchange/complete', { state: { result, returnTo, depth: depth + 1 } })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErrorMsg(msg ?? '환전 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="환전" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col px-5 pt-6 min-h-0">
        <div className="mb-6">
          <p className="text-sm font-semibold text-text-primary">
            1달러 = {rate > 0 ? rate.toLocaleString('ko-KR') : '—'}원
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">95% 우대</p>
        </div>

        <div className="bg-surface-bg rounded-2xl px-4 py-4 flex items-center gap-3 overflow-hidden">
          <img src={fromIcon} alt="입력 통화" className="w-8 h-8 flex-shrink-0" />
          {chars.length > 0 ? (
            <div className="flex items-baseline">
              {chars.map((c) => (
                <span
                  key={c.id}
                  className={cn(
                    'text-xl font-semibold text-primary inline-block',
                    c.exiting ? 'animate-char-out' : 'animate-char-in',
                  )}
                >
                  {c.char}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xl font-semibold text-text-tertiary">{fromPlaceholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <p className={cn('text-xs', isOverBalance ? 'text-danger' : 'text-text-tertiary')}>잔액 {fromBalance}</p>
          {isOverBalance && <p className="text-xs text-danger">잔액이 부족합니다</p>}
        </div>

        <div className="flex justify-center my-4">
          <ChevronDown size={22} className="text-text-tertiary" />
        </div>

        <div className="bg-surface-bg rounded-2xl px-4 py-4 flex items-center gap-3">
          <img src={toIcon} alt="출력 통화" className="w-8 h-8" />
          <span className="text-xl font-semibold text-text-primary">{convertedAmount}</span>
        </div>
        <p className="text-xs text-text-tertiary mt-2 px-1">잔액 {toBalance}</p>

        {errorMsg && (
          <p className="mt-4 text-sm text-danger text-center">{errorMsg}</p>
        )}

        <div className="flex-1" />
      </div>

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

      <div className="px-4 pb-10 pt-2">
        <button
          onClick={handleComplete}
          disabled={!canComplete || isPending}
          className="w-full bg-primary text-white py-4 rounded-2xl font-semibold disabled:opacity-40 transition-opacity"
        >
          {isPending ? '처리 중...' : '완료'}
        </button>
      </div>
    </div>
  )
}
