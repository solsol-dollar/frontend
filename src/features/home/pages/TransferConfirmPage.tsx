import { useNavigate, useLocation } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function TransferConfirmPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const account = state?.account ?? { displayName: '내 CMA(RP형)' }
  const amount: string = state?.amount ?? '300.00'

  const sourceAfter = `$${(3850 - parseFloat(amount)).toFixed(2)}`
  const destAfter = `$${(8200 + parseFloat(amount)).toFixed(2)}`

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      {/* 확인 문구 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-[28px] font-semibold text-center leading-snug">
          <span className="text-primary-500">{account.displayName}</span>
          <span className="text-text-primary"> 계좌로</span>
        </p>
        <p className="text-[28px] font-semibold text-text-primary text-center leading-snug">$ {amount}를</p>
        <p className="text-[28px] font-semibold text-text-primary text-center leading-snug">옮길까요?</p>
      </div>

      {/* 예상 잔액 */}
      <div className="px-5 mb-10">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-s text-text-secondary">송금 후 예상 잔액</span>
          <span className="text-danger text-sm font-bold">?</span>
        </div>
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-sub">출금 계좌</span>
            <span className="text-sm font-medium text-text-primary">{sourceAfter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-sub">입금 계좌</span>
            <span className="text-sm font-medium text-text-primary">{destAfter}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-10">
        <button
          onClick={() => navigate('/home/transfer/complete', { state: { account, amount } })}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          옮기기
        </button>
      </div>
    </div>
  )
}
