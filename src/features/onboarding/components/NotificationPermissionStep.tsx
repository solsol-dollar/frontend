import { registerPushToken } from '@/lib/firebase'

interface Props {
  onDone: () => void
}

export function NotificationPermissionStep({ onDone }: Props) {
  const handleAllow = async () => {
    await registerPushToken()
    onDone()
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17"
              stroke="#0046ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-text-primary">알림을 허용해주세요</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            IPO 청약 시작일, 배정 결과 등<br />중요한 소식을 바로 받아볼 수 있어요
          </p>
        </div>
      </div>

      <div className="px-0 pb-10 pt-2 flex flex-col gap-3">
        <button
          onClick={handleAllow}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium text-base"
        >
          알림 허용하기
        </button>
        <button
          onClick={onDone}
          className="w-full py-3 text-text-secondary text-sm"
        >
          나중에
        </button>
      </div>
    </div>
  )
}
