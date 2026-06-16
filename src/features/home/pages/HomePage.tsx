import { ChevronRight, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import sleepingIcon from '@/assets/home/sleeping.svg'
import changeupCard from '@/assets/home/changeup-card.png'

const ACCOUNTS = [
  { id: 1, name: '신한투자증권 CMA 계좌', balance: '$8,200.00' },
  { id: 2, name: '신한 Value-up 외화적립예금', balance: '$6,280.50' },
  { id: 3, name: '신한 외화 체인지업 예금', balance: '$3,850.50' },
]

const INTEREST_IPOS = [
  { id: 1, ticker: 'CRWV', name: 'CoreWeave', dday: 'D-2', color: '#FF6830', status: '청약가능' },
  { id: 2, ticker: 'CRWV', name: 'CoreWeave', dday: 'D-2', color: '#FF6830', status: '청약가능' },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page-content bg-surface-bg">

      {/* 총 자산 — 배경 흰색 풀너비 */}
      <section className="bg-white px-4 pt-5 pb-7">
        <p className="text-[16px] text-text-secondary">총 자산 (USD)</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[25px] font-bold text-text-primary leading-none">$18,330.50</p>
          <div className="flex items-center justify-end gap-1">
            <p className="text-[14px] font-medium text-text-secondary">달러 환율 </p>
            <p className='text-[14px] font-medium text-up'>1,518.90</p>
            <p className="text-[13px] font-light text-up">+0.03%</p>
          </div>
        </div>
      </section>

      {/* 쉬는 달러 감지 — 카드 */}
      <section className="mx-4 mt-5">
        <button
          className="w-full bg-white rounded-xl px-4 py-4 flex items-center gap-4 text-left"
          onClick={() => {}}
        >
          <div className='bg-blue-100 px-2 py-2 rounded-3xl'>
          <span className="text-2xl leading-none"><img src={sleepingIcon} alt="쉬는 달러 감지 아이콘"/></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">쉬는 달러 감지</p>
            <p className="text-xs text-text-secondary mt-0.5">쉬는 달러를 SOLSOL하게 적금으로!</p>
          </div>
          <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
        </button>
      </section>

      {/* 내 계좌 — 카드 */}
      <section className="mx-4 mt-5">
        <p className="text-xs text-text-secondary mb-2 px-1">내 계좌</p>
        <div className="bg-white rounded-xl ">
          {ACCOUNTS.map((acc) => (
            <div key={acc.id} className="flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold leading-none">SOL</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary truncate">{acc.name}</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{acc.balance}</p>
              </div>
              <button
                onClick={() => navigate('/home/transfer')}
                className="flex-shrink-0 px-4 py-2 bg-border rounded-md text-xs text-text-secondary"
              >
                송금
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 이번 달 소비 — 카드 */}
      <section className="mx-4 mt-5">
        <p className="text-xs text-text-secondary mb-2 px-1">이번 달 소비</p>
        <div className="bg-white rounded-xl px-4 py-4 flex items-center gap-4">
      <img src={changeupCard} className='w-8 h-15 object-cover'/>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary truncate">신한카드 Change-up 체크</p>
            <p className="text-sm font-bold text-text-primary mt-0.5">$1,850.50</p>
          </div>
          <button className="flex-shrink-0 px-4 py-2 bg-border rounded-md text-xs text-text-secondary">
            내역
          </button>
        </div>
      </section>

      {/* 관심 IPO */}
      <section className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs text-text-secondary">관심 IPO</p>
          <button className="flex items-center gap-0.5 text-xs text-text-secondary">
            전체보기 <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-3">
          {INTEREST_IPOS.map((ipo) => (
            <button
              key={ipo.id}
              onClick={() => navigate(`/ipo/${ipo.id}`)}
              className="w-full bg-white  rounded-xl p-4 flex items-center gap-4 text-left"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: ipo.color }}
              >
                {ipo.ticker.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-text-primary">{ipo.name}</p>
                <p className="text-xs text-text-tertiary">{ipo.ticker}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs border border-danger text-danger rounded-full px-2 py-0.5 whitespace-nowrap">
                  {ipo.status}
                </span>
                <span className="text-xs font-medium text-danger pr-2">{ipo.dday}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}
