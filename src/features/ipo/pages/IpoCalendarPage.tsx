import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Search, Bell, FileText } from 'lucide-react'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'

type Tab = '청약 일정' | '청약내역/취소'
type BottomFilter = '전체' | '관심'

interface ActiveIpo {
  id: number
  abbr: string
  ticker: string
  name: string
  color: string
  status: '청약가능' | '청약예정'
  dDay: string
  scheduledDate: string
  offeringPrice: string
  subscriptionPeriod: string
  listingDate: string
  isWishlisted: boolean
}

interface ClosedIpo {
  id: number
  abbr: string
  ticker: string
  name: string
  color: string
  status: '청약종료'
  scheduledDate: string
  confirmedOfferingPrice: string
  currentPrice: string
  listingDate: string
  listingChange: string
  listingChangePositive: boolean
  isWishlisted: boolean
}

type Ipo = ActiveIpo | ClosedIpo

const IPOS: Ipo[] = [
  {
    id: 1,
    abbr: 'CR',
    ticker: 'CRWV',
    name: 'CoreWeave',
    color: '#FF6B35',
    status: '청약가능',
    dDay: 'D-2',
    scheduledDate: '2026-06-24',
    offeringPrice: 'USD 20.000',
    subscriptionPeriod: '2026.06.24 ~ 09.03',
    listingDate: '2026.09.04',
    isWishlisted: false,
  },
  {
    id: 2,
    abbr: 'S',
    ticker: 'SPCX',
    name: 'SpaceX',
    color: '#FF6B35',
    status: '청약종료',
    scheduledDate: '2026-06-24',
    confirmedOfferingPrice: 'USD 20.000',
    currentPrice: 'USD 24.610',
    listingDate: '2026.06.24',
    listingChange: '24.610 ▲ 4.610(23.02%)',
    listingChangePositive: true,
    isWishlisted: false,
  },
]

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function getWeekOfMonth(date: dayjs.Dayjs): number {
  const firstDay = date.startOf('month').day()
  const adjusted = firstDay === 0 ? 6 : firstDay - 1
  return Math.ceil((date.date() + adjusted) / 7)
}

function ActiveIpoCard({ ipo, onClick }: { ipo: ActiveIpo; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-xl p-4 text-left shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black flex-shrink-0"
            style={{ backgroundColor: ipo.color }}
          >
            {ipo.abbr}
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#111827] leading-tight">{ipo.name}</p>
            <p className="text-xs text-[#7F858F] mt-0.5">{ipo.ticker}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-medium border border-[#CA3D40] text-[#CA3D40] rounded-[7px] px-2 py-0.5">
            {ipo.status}
          </span>
          <span className="text-[11px] font-bold text-[#CA3D40]">{ipo.dDay}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#7F858F]">공모(예정)가</span>
          <span className="text-[13px] font-semibold text-[#111827]">{ipo.offeringPrice}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#7F858F]">청약 기간</span>
          <span className="text-[13px] font-medium text-[#7F858F]">{ipo.subscriptionPeriod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#7F858F]">상장(예정)일</span>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[#7F858F]">{ipo.listingDate}</span>
            <Heart size={16} className="text-[#9AA0AB]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </button>
  )
}

function ClosedIpoCard({ ipo, onClick }: { ipo: ClosedIpo; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-xl p-4 text-left shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black flex-shrink-0"
            style={{ backgroundColor: ipo.color }}
          >
            {ipo.abbr}
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#111827] leading-tight">{ipo.name}</p>
            <p className="text-xs text-[#7F858F] mt-0.5">{ipo.ticker}</p>
          </div>
        </div>
        <span className="text-[10px] font-medium border border-[#6B7280] text-[#6B7280] rounded-[7px] px-2 py-0.5 flex-shrink-0">
          청약종료
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex gap-8 mb-1">
          <div>
            <p className="text-xs font-medium text-[#7F858F] mb-1">공모가(확정)</p>
            <p className="text-[13px] font-semibold text-[#111827]">{ipo.confirmedOfferingPrice}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#7F858F] mb-1">현재가</p>
            <p className="text-[13px] font-semibold text-[#111827]">{ipo.currentPrice}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#7F858F]">상장일</span>
          <span className="text-[13px] font-medium text-[#7F858F]">{ipo.listingDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#7F858F]">상장일 대비</span>
          <div className="flex items-center gap-3">
            <span className={cn('text-[13px] font-medium', ipo.listingChangePositive ? 'text-[#CA3D40]' : 'text-down')}>
              {ipo.listingChange}
            </span>
            <Heart size={16} className="text-[#9AA0AB]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </button>
  )
}

function IpoCard({ ipo, onClick }: { ipo: Ipo; onClick: () => void }) {
  if (ipo.status === '청약종료') {
    return <ClosedIpoCard ipo={ipo as ClosedIpo} onClick={onClick} />
  }
  return <ActiveIpoCard ipo={ipo as ActiveIpo} onClick={onClick} />
}

export function IpoCalendarPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('청약 일정')
  const [bottomFilter, setBottomFilter] = useState<BottomFilter>('전체')

  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')

  const dow = today.day()
  const monday = today.subtract(dow === 0 ? 6 : dow - 1, 'day')
  const weekDays = Array.from({ length: 6 }, (_, i) => monday.add(i, 'day'))

  const filteredIpos = bottomFilter === '전체' ? IPOS : IPOS.filter((ipo) => ipo.isWishlisted)

  const ipoDatesAfterToday = filteredIpos
    .map((ipo) => ipo.scheduledDate)
    .filter((d) => d >= todayStr)
  const uniqueDates = Array.from(new Set([todayStr, ...ipoDatesAfterToday])).sort()

  return (
    <div className="bg-[#F6F6F9]">
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-[52px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] font-bold text-[#111111]">IPO 캘린더</span>
          <button
            onClick={() => navigate('/ipo/guide')}
            className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white text-[11px] font-bold leading-none">?</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/notifications')} className="relative p-0.5">
            <Bell size={22} className="text-[#111111]" />
            <span className="absolute top-0 right-0 w-[7px] h-[7px] bg-[#DC2626] rounded-full border border-white" />
          </button>
          <button className="p-0.5">
            <Search size={20} className="text-[#111111]" />
          </button>
        </div>
      </header>

      <div className="flex bg-white">
        {(['청약 일정', '청약내역/취소'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-[15px] font-bold border-b-2 transition-colors',
              tab === t ? 'border-primary text-[#111111]' : 'border-transparent text-[#999EA4]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '청약 일정' && (
        <>
          <div className="bg-white px-4 pt-2 pb-3">
            <div className="flex justify-end items-center gap-2 mb-2">
              <button className="text-[10px] text-[#1A1A1A]">오늘</button>
              <span className="w-px h-3 bg-[#D9DBE0]" />
              <button className="text-[10px] text-[#1A1A1A]">월별보기</button>
            </div>
            <div className="grid grid-cols-6">
              {weekDays.map((day) => {
                const isToday = day.format('YYYY-MM-DD') === todayStr
                const isSaturday = day.day() === 6
                const hasIpo = filteredIpos.some(
                  (ipo) => ipo.scheduledDate === day.format('YYYY-MM-DD'),
                )
                return (
                  <div key={day.format('YYYY-MM-DD')} className="flex flex-col items-center gap-1">
                    <span className="text-[12px] text-[#9AA0AB]">
                      {isToday ? '오늘' : DAY_NAMES[day.day()]}
                    </span>
                    <div
                      className={cn(
                        'w-[33px] h-[33px] flex items-center justify-center rounded-[6px] text-[16px] font-semibold',
                        isToday
                          ? 'bg-[#6B7280] text-white'
                          : isSaturday
                          ? 'text-[#C8CBD2]'
                          : 'text-[#1A1A1A]',
                      )}
                    >
                      {day.date()}
                    </div>
                    <div className={cn('w-1.5 h-1.5 rounded-full', hasIpo ? 'bg-up' : 'invisible')} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="px-4">
            {uniqueDates.map((dateStr, idx) => {
              const date = dayjs(dateStr)
              const isToday = dateStr === todayStr
              const dayIpos = filteredIpos.filter((ipo) => ipo.scheduledDate === dateStr)
              const prevDate = idx > 0 ? dayjs(uniqueDates[idx - 1]) : null
              const showWeekDivider =
                !prevDate ||
                getWeekOfMonth(prevDate) !== getWeekOfMonth(date) ||
                prevDate.month() !== date.month()

              return (
                <div key={dateStr}>
                  {showWeekDivider && (
                    <div className="flex items-center gap-3 py-4">
                      <div className="flex-1 border-t border-dashed border-[#D9DBE0]" />
                      <span className="text-[14px] font-medium text-[#9AA0AB] shrink-0">
                        {date.month() + 1}월 {getWeekOfMonth(date)}주차
                      </span>
                      <div className="flex-1 border-t border-dashed border-[#D9DBE0]" />
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[18px] font-bold text-[#3A3D45]">{date.date()}일</span>
                      {isToday ? (
                        <span className="bg-[#F0F1F4] text-[#9AA0AB] text-[12px] font-semibold px-3 py-1 rounded-[8px]">
                          오늘
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-[#9AA0AB]">
                          {DAY_NAMES[date.day()]}
                        </span>
                      )}
                    </div>

                    {dayIpos.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <div className="w-11 h-11 rounded-full bg-[#F0F1F4] flex items-center justify-center">
                          <FileText size={20} className="text-[#9AA0AB]" />
                        </div>
                        <span className="text-[17px] font-bold text-[#3A3D45]">소식이 없어요</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayIpos.map((ipo) => (
                          <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo/${ipo.id}`)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end px-4 pb-4 pt-2">
            <div className="flex bg-[#EFEFEF] rounded-[15px] p-0.5">
              {(['전체', '관심'] as BottomFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setBottomFilter(f)}
                  className={cn(
                    'px-5 py-1.5 rounded-[15px] text-[13px] transition-colors',
                    bottomFilter === f
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-[#999EA4] font-medium',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === '청약내역/취소' && (
        <div className="px-4 pt-4 space-y-3">
          {IPOS.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo/${ipo.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
