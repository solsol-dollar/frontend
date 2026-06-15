import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/common/Header'

const ACCOUNTS = [
  { id: 'cma', name: '신한투자증권 CMA 계좌', number: '270-91-175039', linked: true, tag: null },
  {
    id: 'valueup', name: '신한 Value-up 외화적립예금',
    number: null, linked: false, tag: '연 3.2% 이자 SOLSOL에게',
  },
]

export function MyPage() {
  const navigate = useNavigate()

  return (
    <div className="page-content">
      <Header title="마이페이지" showNotification showSearch showMypage={false} />

      {/* 연동 계좌 목록 */}
      <section className="px-4 pt-4">
        <div className="space-y-3">
          {ACCOUNTS.map((acc) => (
            <div key={acc.id} className="flex items-center gap-3 py-3 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">SOL</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{acc.name}</p>
                {acc.number && <p className="text-xs text-text-tertiary mt-0.5">{acc.number}</p>}
                {acc.tag && <p className="text-xs text-text-secondary mt-0.5">{acc.tag}</p>}
              </div>
              {acc.linked ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              ) : (
                <button className="text-xs text-primary border border-primary rounded-full px-3 py-1">
                  추가
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {}}
          className="flex items-center gap-1 mt-3 text-sm text-text-secondary"
        >
          내 계좌·카드 보기 및 추가 연동
          <ChevronRight size={16} />
        </button>
      </section>

      {/* 상품 추천 배너 */}
      <section className="mx-4 mt-6 p-4 bg-white border border-border rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <div>
            <p className="text-base font-bold text-primary">신한 Value-up 외화적립예금</p>
            <p className="text-sm text-text-secondary">이런 고객님에게 유리한 상품입니다</p>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          {[
            '해외송금을 보내시는 개인 및 법인 고객',
            '외화자산에 일정부분 투자하여 자산의 분산 운용 및 포트폴리오의 다양화를 바라고자 하는 고객',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <button className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm">
          예금 만들기
        </button>
      </section>

      {/* 설정 메뉴 */}
      <section className="px-4 mt-6">
        {[
          { label: '알림 설정', path: '/notifications/settings' },
          { label: '앱 버전', value: '1.0.0' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className="w-full flex items-center justify-between py-4 border-b border-border"
          >
            <span className="text-sm text-text-primary">{item.label}</span>
            {item.path ? (
              <ChevronRight size={16} className="text-text-tertiary" />
            ) : (
              <span className="text-sm text-text-tertiary">{item.value}</span>
            )}
          </button>
        ))}
      </section>
    </div>
  )
}
