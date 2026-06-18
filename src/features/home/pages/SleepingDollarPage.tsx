import { useNavigate } from 'react-router-dom'
import { ChevronRight, Calendar } from 'lucide-react'
import { Header } from '@/components/common/Header'
import sleepingIcon from '@/assets/home/sleeping.svg'
import checkIcon from '@/assets/home/check.svg'
import calendar from '@/assets/common/calendar.svg'
import { SolBankLogo } from '@/features/home/components/SolBankLogo'

const AMOUNT = '$3,850'
const DAYS = 15

const CONDITIONS = [
  '외화예수금 잔액 $1,000 이상',
  '30일 이상 미사용',
  '관심 IPO 청약 14일 이상 남음',
  '환불금 수령 7일 초과',
]

export function SleepingDollarPage() {
  const navigate = useNavigate()

  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header showBack title="쉬는 달러 감지" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="bg-white px-5 pt-8 pb-6 flex flex-col gap-5">
          {/* 상단 안내 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-surface-light flex items-center justify-center">
              <img src={sleepingIcon} alt="쉬는 달러" className="w-12 h-12" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-primary">
                <span className="text-primary">{AMOUNT}</span>가 {DAYS}일째 쉬고 있어요
              </p>
              <p className="text-sm font-light text-text-secondary mt-2 leading-relaxed">
                외화예수금의 달러가 오래 머물고 있어요.<br />
                다음 조건이 모두 충족돼 알려드려요!
              </p>
            </div>
          </div>

          {/* 조건 카드 */}
          <div className="bg-surface-neutral rounded-2xl px-5 py-4 flex flex-col gap-4">
            {CONDITIONS.map((cond) => (
              <div key={cond} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                 <img src={checkIcon} alt='체크 아이콘'/>
                </div>
                <span className="text-sm text-text-primary">{cond}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 액션 카드 */}
        <div className="flex flex-col gap-3 px-5 pt-5 pb-6">
          <button
            onClick={() => navigate('/ipo')}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-surface-neutral flex items-center justify-center flex-shrink-0">
              <img className='w-6' src={calendar} alt='캘린더아이콘'/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">IPO 일정 보러가기</p>
              <p className="text-xs text-text-secondary mt-0.5">청약 가능한 해외 IPO를 한눈에!</p>
            </div>
            <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
          </button>

          <button
            onClick={() => navigate('/home/fill')}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 text-left"
          >
            <SolBankLogo />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">Value-up 적립예금에 보관하기</p>
              <p className="text-xs text-text-secondary mt-0.5">쉬는 달러를 SOLSOL하게 적립예금으로!</p>
            </div>
            <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="px-4 pb-5 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-primary text-white py-4 rounded-2xl font-semibold"
        >
          완료
        </button>
      </div>
    </div>
  )
}
