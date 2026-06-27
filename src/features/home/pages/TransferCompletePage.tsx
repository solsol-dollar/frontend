import { useNavigate, useLocation } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import shinhanIcon from '@/assets/home/shinhan-logo.svg'

export function TransferCompletePage() {
  
  const navigate = useNavigate() 
  const { state } = useLocation()
  const account = state?.account ?? { displayName: '내 CMA(RP형)' }
  const amount: string = state?.amount ?? '300.00'
  const returnTo: string | undefined = state?.returnTo

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-36">
        {/* 완료 문구 — ConfirmPage와 동일한 위치 */}
        <div className="relative text-center">
          {/* 로고는 absolute로 텍스트 위에 띄움 */}
          <img
            src={shinhanIcon}
            alt="신한 로고"
            className="absolute w-20 h-20 left-1/2 -translate-x-1/2 bottom-full mb-6"
          />
          <p className="text-[20px] font-semibold leading-snug">
            <span className="text-primary-500">{account.displayName}</span>
            <span className="text-text-primary"> 계좌로</span>
          </p>
          <p className="text-[20px] font-semibold text-text-primary leading-snug">$ {amount}를 옮겼어요</p>
        </div>
      </div>
      <div className="px-4 pb-10">
        <button
          onClick={() => navigate(returnTo ?? '/home', { replace: true })}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          완료
        </button>
      </div>
    </div>
  )
}
