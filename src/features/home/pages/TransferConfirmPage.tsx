import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function TransferConfirmPage() {
  const navigate = useNavigate()

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-text-secondary text-center">내 CMA(RP형) 계좌로</p>
        <p className="text-3xl font-bold text-primary text-center">$ 300.00을</p>
        <p className="text-sm text-text-secondary text-center">옮길까요?</p>

        <div className="w-full mt-6 p-4 bg-surface rounded-2xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">송금 전 잔액</span>
            <span className="font-medium text-text-primary">$3,050.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">이동 후 잔액</span>
            <span className="font-medium text-text-primary">$8,500.00</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-semibold"
        >
          취소
        </button>
        <button
          onClick={() => navigate('/home/transfer/complete')}
          className="flex-1 bg-primary text-white py-4 rounded-xl font-semibold"
        >
          옮기기
        </button>
      </div>
    </div>
  )
}
