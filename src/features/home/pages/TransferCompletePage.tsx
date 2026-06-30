import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import shinhanIcon from '@/assets/home/shinhan-logo.svg'
import { TransferResult } from '../hooks/useTransfer'

export function TransferCompletePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { state } = useLocation()
  const account = state?.account ?? null
  const amount: string = state?.amount ?? '0'
  const result: TransferResult | undefined = state?.result
  const returnTo: string | undefined = state?.returnTo
  const depth: number = state?.depth ?? 0

  const displayAccountName = result?.toAccountType === 'SECURITIES' && result?.toVirtualAccountNumber
    ? `가상계좌 ${result.toVirtualAccountNumber}`
    : (account?.displayName ?? '')

  useEffect(() => {
    if (!account) navigate('/home', { replace: true })
  }, [account, navigate])

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* 완료 문구 — ConfirmPage와 동일한 위치 */}
        <div className="relative text-center">
          {/* 로고는 absolute로 텍스트 위에 띄움 */}
          <img
            src={shinhanIcon}
            alt="신한 로고"
            className="absolute w-[88px] h-[88px] left-1/2 -translate-x-1/2 bottom-full mb-6"
          />
          <p className="text-[20px] font-semibold leading-snug">
            <span className="text-primary-500">{displayAccountName}</span>
            <span className="text-text-primary"> 계좌로</span>
          </p>
          <p className="text-[20px] font-semibold text-text-primary leading-snug">$ {amount}를 옮겼어요</p>
        </div>
      </div>
      <div className="px-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
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
