import { ChevronRight, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'

const ACCOUNTS = [
  { name: '신한투자증권 CMA 계좌', balance: '$8,200.00', sub: '원화 ₩8,200' },
  { name: '신한 Value-up 외화적립예금', balance: '$6,280.50', sub: '연 3.2% 이자' },
  { name: '신한 외화 체인지업 예금', balance: '$3,850.50', sub: null },
]

const INTEREST_IPOS = [
  { id: 1, ticker: 'CRWV', name: 'CoreWeave', dday: 'D-3', color: '#FF6830', status: '청약가능' },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page-content">
      <Header showNotification showMypage />

      {/* 총 달러 잔액 */}
      <section className="px-4 pt-4 pb-6 bg-white">
        <p className="text-sm text-text-secondary">내 달러 잔액</p>
        <p className="text-3xl font-bold text-text-primary mt-1">$18,330.50</p>
        <p className="text-xs text-text-tertiary mt-1">약 12개월 평균 $1,527.54</p>

        <div className="mt-4 space-y-2">
          {ACCOUNTS.map((acc) => (
            <div key={acc.name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">SOL</span>
                </div>
                <div>
                  <p className="text-sm text-text-primary">{acc.name}</p>
                  {acc.sub && <p className="text-xs text-text-tertiary">{acc.sub}</p>}
                </div>
              </div>
              <p className="text-sm font-semibold text-text-primary">{acc.balance}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/home/transfer')}
          className="mt-4 w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm"
        >
          송금
        </button>
      </section>

      {/* 쉬는 달러 widget */}
      <section className="mx-4 mt-4 p-4 bg-surface rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💤</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">$3,850가 10일째 쉬고 있어요</p>
            <p className="text-xs text-text-secondary mt-1">
              외화예수금의 달러가 오래 머물고 있어요. 해외 IPO에 참여해보세요!
            </p>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-text-secondary">• 투자수익 $5,934~$30,000원 기대</li>
              <li className="text-xs text-text-secondary">• 청약 마감까지 잔량 있어요</li>
              <li className="text-xs text-text-secondary">• 청약 후 환불금 발생 시 CMA에 연결</li>
            </ul>
          </div>
        </div>
        <button className="mt-3 w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold">
          IPO 청약 바로가기
        </button>
      </section>

      {/* 관심 IPO */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary">관심 IPO</h2>
          <button className="flex items-center gap-1 text-xs text-primary">
            전체보기 <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {INTEREST_IPOS.map((ipo) => (
            <button
              key={ipo.id}
              onClick={() => navigate(`/ipo/${ipo.id}`)}
              className="w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 text-left"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: ipo.color }}
              >
                {ipo.ticker.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-text-primary">{ipo.name}</span>
                  <span className="text-xs text-up font-medium">{ipo.dday}</span>
                </div>
                <span className="text-xs border border-primary text-primary rounded-full px-2 py-0.5 mt-1 inline-block">
                  {ipo.status}
                </span>
              </div>
              <Heart size={18} className="text-text-tertiary" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
