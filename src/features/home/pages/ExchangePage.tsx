import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'
import usaIcon from '@/assets/exchange/usa.svg'
import koreaIcon from '@/assets/exchange/korea.svg'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { useExchangeRate } from '@/features/home/hooks/useExchangeRate'
import { useExchange } from '@/features/home/hooks/useExchange'
import { useAnimatedInput } from '@/hooks/useAnimatedInput'
import { useState, useEffect, useRef } from 'react'

const DOLLAR_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←']
const WON_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←']

const LOGO_PATH = "M75.14,8.63C38.26,8.63,8.36,38.52,8.36,75.4s29.89,66.77,66.77,66.77,66.77-29.89,66.77-66.77S112.01,8.63,75.14,8.63h0Zm1.4,121.35c-7.99,1.11-21-.91-29.84-6.48-6.64-4.14-11.94-10.12-15.25-17.22-3.05-6.32-4.49-13.99-1.24-13.61,1.51,.18,2.83,3.05,5.79,6.81,2.01,2.56,3.86,4.72,5.24,5.02,.63,.13,1.11-.15,1.58-.99,.84-1.59,1.94-4.61,3.96-7.05,1.58-1.83,3.59-2.74,4.7,1.82,.53,2.19,.94,4.4,1.23,6.63,.35,2.88,.54,4.61,1.55,5.09s2.59-.13,5.22-1.11c1.89-.71,4.31-1.6,7.37-2.48,2.83-.81,4.62-.39,2.81,3.99-1.25,2.92-2.86,5.68-4.77,8.21-.54,.68-.44,1.66,.23,2.21,1.78,1.4,3.77,2.52,5.89,3.32,1.98,.83,4.01,1.53,6.08,2.11,2.49,.77,2.03,3.32-.53,3.72Zm34.26-14.37c-2.48,4.04-7.74,8.41-14.01,11.33-.96,.43-1.98,.29-2.21-.49s.32-1.46,.94-2.21c8.23-10.68,2.12-20.47-11.17-28.07-9.81-5.61-16.06-8.84-23.31-13.11-21.23-12.5-25.33-23.38-26.16-29.84-2.09-16.27,11.36-28.46,25.2-31.4,.43-.09,1.54-.27,1.89,.65s-.46,1.59-.94,1.88c-6.23,3.38-12.31,10.58-11.65,18.65,.36,4.49,2.29,10.94,14.43,19.6,7.33,5.23,16.31,9.51,34.41,20.37,19.13,11.47,16.95,25.45,12.57,32.62h.01Zm2.98-61.11c-4.37,5.35-8.73,3.32-12.09-4.17-2.1-4.7-4.85-5.82-6.8-4.6-2.12,1.34-1.28,4.56,1.11,8.27,1.38,2.22,1.07,5.09-.76,6.96-2.02,1.87-4.86,2.55-7.5,1.81-5.38-1.19-10.68-8.4-6.81-24.15,1.56-6.34-1.49-9.06-3.43-11.5-.96-1.23-1.11-1.97-.73-2.45s1.28-.57,2.86-.24c2.08,.43,5.15,1.49,7.65,1.88,1.83,.26,3.68,.35,5.53,.25,4.61-.32,9.23,.58,13.37,2.63,6.87,3.4,7.57,9.26,3.75,8.84-1.55-.41-3.04-1.03-4.42-1.85-.94-.45-1.76-.61-2.35-.17-.62,.51-.79,1.4-.4,2.1,.85,1.8,3.74,2.73,7.65,3.8,6.82,1.86,6.96,8.2,3.38,12.58Z"

function buildWavePath(fillLevel: number, phase: number): string {
  const baseY = 150 * (1 - fillLevel)
  const amplitude = 5
  const parts: string[] = []
  for (let x = -5; x <= 155; x += 2) {
    const wy = baseY + amplitude * Math.sin(phase + (x / 50) * Math.PI)
    parts.push(x === -5 ? `M ${x},${wy}` : `L ${x},${wy}`)
  }
  parts.push('L 155,155 L -5,155 Z')
  return parts.join(' ')
}

function ExchangeWaveLoading({ fromText, toText, isDone }: { fromText: string; toText: string; isDone: boolean }) {
  const [fill, setFill] = useState(0)
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const cycleDuration = 1200
    const frame = () => {
      const elapsed = Date.now() - startRef.current
      setFill((elapsed % cycleDuration) / cycleDuration)
      setPhase((elapsed / 400) * Math.PI * 2)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    if (!isDone) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setFill(1)
  }, [isDone])

  const wavePath = buildWavePath(fill, phase)

  return (
    <div className="mobile-container fixed top-0 left-1/2 -translate-x-1/2 h-screen z-50 bg-white flex flex-col">
      <div className="h-14 flex-shrink-0" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-36">
        <div className="relative text-center">
          <svg viewBox="-4.20 -3.63 158.67 158.07" className="absolute w-[80px] h-[80px] left-1/2 -translate-x-1/2 bottom-full mb-6">
            <defs>
              <clipPath id="wave-clip">
                <path d={LOGO_PATH} />
              </clipPath>
            </defs>
            <path fill="#E5E7EB" d={LOGO_PATH} />
            <g clipPath="url(#wave-clip)">
              <path fill="#0046ff" d={wavePath} />
            </g>
          </svg>
          <p className="text-[28px] font-semibold text-text-primary leading-snug invisible">{fromText}을</p>
          <p className="text-[28px] font-semibold leading-snug invisible">
            <span className="text-primary-500">{toText}</span>
            <span className="text-text-primary">으로</span>
          </p>
          <p className="text-[28px] font-semibold text-text-primary leading-snug invisible">환전했어요</p>
        </div>
      </div>
    </div>
  )
}

export function ExchangePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const direction: 'dollar-to-won' | 'won-to-dollar' = state?.direction ?? 'dollar-to-won'
  const isDollarToWon = direction === 'dollar-to-won'
  const returnTo: string | undefined = state?.returnTo
  const depth: number = state?.depth ?? 0

  const { data: assets } = useHomeAssets()
  const liveRate = useExchangeRate()
  const tts = liveRate?.tts ?? 0
  const ttb = liveRate?.ttb ?? 0
  const usdBalance = assets?.securities?.usdAvailableBalance ?? 0
  const krwBalance = assets?.securities?.krwBalance ?? 0

  const { chars, amount, pushChar, popChar } = useAnimatedInput()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showLoading, setShowLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const { mutateAsync: exchange } = useExchange()

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
  const convertedAmount = amountNum > 0
    ? isDollarToWon
      ? (ttb > 0 ? (amountNum * ttb).toLocaleString('ko-KR', { maximumFractionDigits: 0 }) : '0')
      : (tts > 0 ? (amountNum / tts).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0.00')
    : isDollarToWon ? '0' : '0.00'

  const maxBalance = isDollarToWon ? usdBalance : krwBalance
  const isOverBalance = amountNum > 0 && amountNum > maxBalance
  const canComplete = amountNum > 0 && !isOverBalance && !!(isDollarToWon ? ttb : tts)

  const fromIcon = isDollarToWon ? usaIcon : koreaIcon
  const toIcon = isDollarToWon ? koreaIcon : usaIcon
  const fromBalance = isDollarToWon
    ? `$${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `${krwBalance.toLocaleString('ko-KR')}원`
  const toBalance = isDollarToWon
    ? `${krwBalance.toLocaleString('ko-KR')}원`
    : `$${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const fromPlaceholder = isDollarToWon ? '0.00' : '0'

  const fromText = isDollarToWon
    ? `$${amountNum.toFixed(2)}`
    : `${amountNum.toLocaleString('ko-KR')}원`
  const toText = isDollarToWon
    ? `${parseInt(convertedAmount.replace(/,/g, '') || '0', 10).toLocaleString('ko-KR')}원`
    : `$${parseFloat(convertedAmount.replace(/,/g, '') || '0').toFixed(2)}`

  const handleComplete = async () => {
    setErrorMsg(null)
    setShowLoading(true)
    try {
      const [result] = await Promise.all([
        exchange({
          direction: isDollarToWon ? 'USD_TO_KRW' : 'KRW_TO_USD',
          sourceAmount: amountNum,
        }),
        new Promise(r => setTimeout(r, 2000)),
      ])
      setIsDone(true)
      await new Promise(r => setTimeout(r, 500))
      navigate('/home/exchange/complete', { replace: true, state: { result, returnTo, depth } })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErrorMsg(msg ?? '환전 중 오류가 발생했습니다')
      setShowLoading(false)
    }
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      {showLoading && <ExchangeWaveLoading fromText={fromText} toText={toText} isDone={isDone} />}
      <Header showBack title="환전" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col px-5 pt-6 min-h-0">
        <div className="mb-6">
          <p className="text-sm font-semibold text-text-primary">
            1달러 = {(isDollarToWon ? ttb : tts) > 0 ? (isDollarToWon ? ttb : tts).toLocaleString('ko-KR') : '—'}원
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isDollarToWon ? '달러 팔 때 (전신환 매입율)' : '달러 살 때 (전신환 매도율)'}
          </p>
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
          disabled={!canComplete || showLoading}
          className="w-full bg-primary text-white py-4 rounded-2xl font-semibold disabled:opacity-40 transition-opacity"
        >
          {showLoading ? '처리 중...' : '완료'}
        </button>
      </div>
    </div>
  )
}
