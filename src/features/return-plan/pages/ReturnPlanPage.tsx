import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Header } from '@/components/common/Header'

const MONTHS = ['4월', '5월', '6월']
const HISTORY = [
  { id: 1, date: '6월 3일 월요일', name: 'Rubrik', amount: '$838.91', type: 'ALLOCATED' },
  { id: 2, date: '6월 3일 월요일', name: 'Rubrik', amount: '$838.91', type: 'ALLOCATED' },
  { id: 3, date: '6월 10일 월요일', name: 'Rubrik', amount: '$838.91', type: 'REFUNDED' },
]

export function ReturnPlanPage() {
  const navigate = useNavigate()
  const [monthIdx, setMonthIdx] = useState(2)

  return (
    <div className="page-content">
      <Header
        title="리턴 플랜"
        showNotification
        showMypage={false}
        showSearch
      />

      {/* 현재 활성 IPO 요약 */}
      <section className="px-4 pt-4 pb-5 bg-white">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-text-tertiary">진행 중인 리턴플랜</p>
          <span className="text-xs text-primary">CoreWeave IPO</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: '총 리턴금', value: '$700.00' },
            { label: '배정금', value: '$1,100.00' },
            { label: '이자', value: '$308.90' },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-xs text-text-tertiary">{s.label}</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/return-plan/settings')}
          className="mt-4 w-full py-3 border border-primary text-primary rounded-xl text-sm font-semibold"
        >
          리턴 플랜 설정
        </button>
      </section>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-border">
        <button
          onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
          className="p-1"
          disabled={monthIdx === 0}
        >
          <ChevronLeft size={20} className={monthIdx === 0 ? 'text-text-tertiary' : 'text-text-primary'} />
        </button>
        <p className="text-sm font-semibold text-text-primary">{MONTHS[monthIdx]}</p>
        <button
          onClick={() => setMonthIdx((i) => Math.min(MONTHS.length - 1, i + 1))}
          className="p-1"
          disabled={monthIdx === MONTHS.length - 1}
        >
          <ChevronRight size={20} className={monthIdx === MONTHS.length - 1 ? 'text-text-tertiary' : 'text-text-primary'} />
        </button>
      </div>

      {/* 리턴 내역 목록 */}
      <div className="px-4 pt-4 space-y-4">
        {HISTORY.map((item) => (
          <div key={item.id}>
            <p className="text-xs text-text-tertiary mb-2">{item.date}</p>
            <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                <span className="text-xs font-bold text-text-secondary">RB</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                <p className="text-xs text-text-tertiary">
                  {item.type === 'ALLOCATED' ? '배정 완료' : '환불 완료'}
                </p>
              </div>
              <p className="text-sm font-bold text-up">{item.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
