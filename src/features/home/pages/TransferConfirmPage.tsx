import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { useTransfer } from '@/features/home/hooks/useTransfer'

export function TransferConfirmPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const fromAccountId: number = state?.fromAccountId ?? 0
  const toAccountId: number = state?.toAccountId ?? 0
  const sourceName: string = state?.sourceName ?? '출금 계좌'
  const destName: string = state?.destName ?? '입금 계좌'
  const sourceBalance: string = state?.sourceBalance ?? '$0.00'
  const destBalance: string = state?.destBalance ?? '$0.00'
  const amount: string = state?.amount ?? '0'

  const amountNum = parseFloat(amount)
  const sourceFunds = parseFloat(sourceBalance.replace(/[^0-9.]/g, ''))
  const sourceAfter = (sourceFunds - amountNum).toFixed(2)
  const destAfter = (parseFloat(destBalance.replace(/[^0-9.]/g, '')) + amountNum).toFixed(2)
  const isInvalid = !amountNum || amountNum <= 0 || amountNum > sourceFunds || !fromAccountId || !toAccountId

  const { mutateAsync: transfer, isPending } = useTransfer()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleConfirm = async () => {
    setErrorMsg(null)
    try {
      const result = await transfer({ fromAccountId, toAccountId, amount: amountNum })
      navigate('/home/transfer/complete', { state: { account: { displayName: destName }, amount, result } })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErrorMsg(msg ?? '송금 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-[28px] font-semibold text-center leading-snug">
          <span className="text-primary-500">{destName}</span>
          <span className="text-text-primary"> 계좌로</span>
        </p>
        <p className="text-[28px] font-semibold text-text-primary text-center leading-snug">$ {amount}를</p>
        <p className="text-[28px] font-semibold text-text-primary text-center leading-snug">옮길까요?</p>
      </div>

      <div className="px-5 mb-10">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-s text-text-secondary">송금 후 예상 잔액</span>
        </div>
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-sub">{sourceName}</span>
            <span className="text-sm font-medium text-text-primary">${sourceAfter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-sub">{destName}</span>
            <span className="text-sm font-medium text-text-primary">${destAfter}</span>
          </div>
        </div>
        {errorMsg && (
          <p className="mt-4 text-sm text-danger text-center">{errorMsg}</p>
        )}
      </div>

      <div className="px-4 pb-10">
        <button
          onClick={handleConfirm}
          disabled={isPending || isInvalid}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-40"
        >
          {isPending ? '처리 중...' : '옮기기'}
        </button>
      </div>
    </div>
  )
}
