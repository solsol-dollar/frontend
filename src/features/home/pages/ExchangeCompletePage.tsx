import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import shinhanIcon from '@/assets/home/shinhan-logo.svg'
import type { ExchangeResult } from '@/features/home/hooks/useExchange'

export function ExchangeCompletePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { state } = useLocation()
  const result: ExchangeResult | undefined = state?.result
  const returnTo: string | undefined = state?.returnTo
  const depth: number = state?.depth ?? 0
  const isDollarToWon = result?.toCurrency === 'KRW'

  useEffect(() => {
    if (!result) navigate('/home', { replace: true })
  }, [result, navigate])

  const fromText = isDollarToWon
    ? `$${result?.sourceAmount?.toFixed(2) ?? '0.00'}`
    : `${result?.sourceAmount?.toLocaleString('ko-KR') ?? '0'}원`
  const toText = isDollarToWon
    ? `${result?.targetAmount?.toLocaleString('ko-KR') ?? '0'}원`
    : `$${result?.targetAmount?.toFixed(2) ?? '0.00'}`

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-36">
        <div className="relative text-center">
          <img
            src={shinhanIcon}
            alt="신한 로고"
            className="absolute w-20 h-20 left-1/2 -translate-x-1/2 bottom-full mb-6"
          />
          <p className="text-[28px] font-semibold text-text-primary leading-snug">{fromText}을</p>
          <p className="text-[28px] font-semibold leading-snug">
            <span className="text-primary-500">{toText}</span>
            <span className="text-text-primary">으로</span>
          </p>
          <p className="text-[28px] font-semibold text-text-primary leading-snug">환전했어요</p>
        </div>
      </div>

      <div className="px-4 pb-10">
        <button
          onClick={() => {
            qc.invalidateQueries({ queryKey: ['home', 'assets'] })
            depth > 0 ? navigate(-depth) : navigate(returnTo ?? '/home', { replace: true })
          }}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          완료
        </button>
      </div>
    </div>
  )
}
