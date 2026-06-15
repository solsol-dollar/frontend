import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/common/Header'

type Tab = '청약 일정' | '청약내역/취소'
type Filter = '전체' | '청약가능' | '청약예정'
type ViewMode = 'list' | 'calendar'

const IPOS = [
  {
    id: 1, date: '14일', ticker: 'CRWV', name: 'CoreWeave', color: '#FF6830',
    status: '청약가능' as const, price: 'USD 20,000', startDate: '2026.06.02',
    endDate: '2026.06.14', returnAmount: '+$1,432.33 ~ +$3,003',
  },
  {
    id: 2, date: '24일', ticker: 'SPCE', name: 'SpaceX', color: '#1C1FE8',
    status: '청약예정' as const, price: 'USD 20,000', startDate: '2026.06.10',
    endDate: '2026.06.24', returnAmount: '+$830 ~ +$1,200',
  },
]

const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)

function IpoCard({ ipo, onClick }: { ipo: typeof IPOS[0]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white border border-border rounded-2xl p-4 text-left">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: ipo.color }}
        >
          {ipo.ticker.slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-base font-semibold text-text-primary">{ipo.name}</span>
            <span className={cn(
              'text-xs border rounded-full px-2 py-0.5',
              ipo.status === '청약가능' ? 'border-primary text-primary' : 'border-text-tertiary text-text-tertiary',
            )}>
              {ipo.status}
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            {ipo.startDate} ~ {ipo.endDate}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-text-primary">{ipo.price}</span>
            <span className="text-xs text-up font-medium">{ipo.returnAmount}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function IpoCalendarPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('청약 일정')
  const [filter, setFilter] = useState<Filter>('전체')
  const [view, setView] = useState<ViewMode>('list')

  const filters: Filter[] = ['전체', '청약가능', '청약예정']
  const filtered = IPOS.filter((ipo) => filter === '전체' || ipo.status === filter)
  const grouped = filtered.reduce<Record<string, typeof IPOS>>((acc, ipo) => {
    if (!acc[ipo.date]) acc[ipo.date] = []
    acc[ipo.date].push(ipo)
    return acc
  }, {})

  return (
    <div className="page-content">
      <Header
        showNotification
        showMypage={false}
        showSearch
        rightAction={
          <button onClick={() => navigate('/ipo/guide')} className="text-xs text-primary px-2">
            IPO란?
          </button>
        }
      />

      {/* 탭 */}
      <div className="flex border-b border-border bg-white">
        {(['청약 일정', '청약내역/취소'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-primary text-text-primary'
                : 'border-transparent text-text-tertiary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '청약 일정' && (
        <>
          {/* 필터 + 뷰 토글 */}
          <div className="px-4 py-3 flex items-center justify-between bg-white">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    filter === f ? 'bg-primary text-white' : 'bg-surface text-text-secondary',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setView('list')}
                className={cn('p-1.5 rounded', view === 'list' ? 'text-primary' : 'text-text-tertiary')}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={cn('p-1.5 rounded', view === 'calendar' ? 'text-primary' : 'text-text-tertiary')}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          {view === 'list' ? (
            <div className="px-4 pb-4 space-y-6">
              {Object.entries(grouped).map(([date, ipos]) => (
                <div key={date}>
                  <p className="text-sm font-bold text-text-primary mb-3">{date}일</p>
                  <div className="space-y-3">
                    {ipos.map((ipo) => (
                      <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo/${ipo.id}`)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 pb-4">
              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7 mt-4">
                {['일','월','화','수','목','금','토'].map((d) => (
                  <div key={d} className="text-center text-xs text-text-tertiary py-2">{d}</div>
                ))}
                {CALENDAR_DAYS.map((day) => {
                  const hasIpo = IPOS.some((ipo) => parseInt(ipo.date) === day)
                  return (
                    <div key={day} className="flex flex-col items-center py-2">
                      <span className="text-sm text-text-primary">{day}</span>
                      {hasIpo && <span className="w-1.5 h-1.5 rounded-full bg-pink mt-0.5" />}
                    </div>
                  )
                })}
              </div>
              {/* 범례 */}
              <div className="flex gap-4 mt-4 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink" />
                  <span className="text-xs text-text-secondary">청약시작/마감</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal" />
                  <span className="text-xs text-text-secondary">상장(예정)일</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === '청약내역/취소' && (
        <div className="px-4 pt-4">
          <div className="space-y-3">
            {IPOS.map((ipo) => (
              <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo/${ipo.id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
