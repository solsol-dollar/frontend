import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function TransferCompletePage() {
  const navigate = useNavigate()

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-3xl font-bold">S</span>
        </div>
        <div className="text-center">
          <p className="text-primary font-bold text-lg">신한 Value-up 외화적립예금</p>
          <p className="text-xl font-bold text-text-primary mt-1">$ 300.00을</p>
          <p className="text-base font-semibold text-text-primary mt-1">내 CMA(RP형) 계좌로</p>
          <p className="text-base font-semibold text-text-primary">송금했어요</p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          확인
        </button>
      </div>
    </div>
  )
}
