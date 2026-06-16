import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
    currentPrice: 'USD 24.60',
    listingDate: '2026.06.24',
    listingChange: '24.610 ▲ 4.60(23.5%)',
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

function HeartIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.2503 2.40774C15.4111 0.899217 14.004 0 12.4854 0C10.2345 0 9.03662 1.52736 8.49986 2.50765C7.9631 1.52736 6.76523 0 4.51431 0C2.99575 0 1.5894 0.900036 0.749377 2.40774C-0.258193 4.21846 -0.249095 6.54102 0.77288 8.62036C2.26869 11.662 5.5939 14.3342 7.44301 15.6552C7.76446 15.8845 8.1314 16 8.49986 16C8.86832 16 9.23526 15.8845 9.55671 15.6552C11.4051 14.3342 14.731 11.662 16.2268 8.62036C17.2496 6.54102 17.2579 4.21846 16.2503 2.40774Z"
        fill={isActive ? '#CA3D40' : '#001936'}
        fillOpacity={isActive ? 1 : 0.31}
      />
    </svg>
  )
}

function WeekDivider({ label }: { label: string }) {
  return (
    <div className="relative mt-[3px] py-4 flex items-center justify-center">
      <img src="/icons/Line.svg" className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full" alt="" />
      <span className="relative bg-[#F6F6F9] px-2 text-[14px] font-medium text-[#9AA0AB]">
        {label}
      </span>
    </div>
  )
}

function ActiveIpoCard({ ipo, onClick, isWishlisted, onWishlistToggle }: { ipo: ActiveIpo; onClick: () => void; isWishlisted: boolean; onWishlistToggle: () => void }) {
  return (
    <button onClick={onClick} className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[22px] text-left">
      <div className="flex items-center justify-between mb-[13px]">
        <div className="flex items-center gap-[18px]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black flex-shrink-0"
            style={{ backgroundColor: ipo.color }}
          >
            {ipo.abbr}
          </div>
          <div className="translate-y-[1px]">
            <p className="text-[15px] font-bold text-[#111827] leading-[17.5px]">{ipo.name}</p>
            <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">{ipo.ticker}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-[5px] flex-shrink-0">
          <img src="/icons/IPO_ready.svg" width={50} height={17} alt={ipo.status} className="translate-x-[3px]" />
          <span className="text-[11px] font-bold text-[#CA3D40]">{ipo.dDay}</span>
        </div>
      </div>
      <div className="pl-[58px] space-y-[8px]">
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">공모(예정)가</span>
          <span className="ml-[11px] text-[13px] font-semibold text-[#111827]">{ipo.offeringPrice}</span>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">청약 기간</span>
          <span className="ml-[11px] text-[13px] font-medium text-[#7F858F]">{ipo.subscriptionPeriod}</span>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">상장(예정)일</span>
          <span className="ml-[11px] text-[13px] font-medium text-[#7F858F]">{ipo.listingDate}</span>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onWishlistToggle() }} className="absolute bottom-[22px] right-[17px]">
        <HeartIcon isActive={isWishlisted} />
      </button>
    </button>
  )
}

function ClosedIpoCard({ ipo, onClick, isWishlisted, onWishlistToggle }: { ipo: ClosedIpo; onClick: () => void; isWishlisted: boolean; onWishlistToggle: () => void }) {
  return (
    <button onClick={onClick} className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[30px] text-left">
      <img src="/icons/IPO_end.svg" width={50} height={17} alt={ipo.status} className="absolute top-[17.5px] right-[17px] translate-x-[3px]" />
      <div className="flex items-center mb-[13px]">
        <div className="flex items-center gap-[18px]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black flex-shrink-0"
            style={{ backgroundColor: ipo.color }}
          >
            {ipo.abbr}
          </div>
          <div className="translate-y-[1px]">
            <p className="text-[15px] font-bold text-[#111827] leading-[17.5px]">{ipo.name}</p>
            <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">{ipo.ticker}</p>
          </div>
        </div>
      </div>
      <div className="pl-[58px] space-y-[8px]">
        <div className="flex gap-[30px] mb-[18px]">
          <div>
            <p className="text-[12px] font-medium text-[#7F858F] mb-[4px]">공모가(확정)</p>
            <p className="text-[13px] font-semibold text-[#111827]">{ipo.confirmedOfferingPrice}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#7F858F] mb-[4px]">현재가</p>
            <p className="text-[13px] font-semibold text-[#111827]">{ipo.currentPrice}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">상장일</span>
          <span className="ml-[7px] text-[13px] font-medium text-[#7F858F]">{ipo.listingDate}</span>
        </div>
        <div className="flex items-center !mt-[6px]">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">상장일 대비</span>
          <span className={cn('ml-[7px] text-[13px] font-medium', ipo.listingChangePositive ? 'text-[#CA3D40]' : 'text-down')}>
            {ipo.listingChange.split('▲').map((part, i) =>
              i === 0 ? part : <span key={i}><span className="text-[9px]">▲</span>{part}</span>
            )}
          </span>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onWishlistToggle() }} className="absolute bottom-[22px] right-[17px]">
        <HeartIcon isActive={isWishlisted} />
      </button>
    </button>
  )
}

function IpoCard({ ipo, onClick, isWishlisted, onWishlistToggle }: { ipo: Ipo; onClick: () => void; isWishlisted: boolean; onWishlistToggle: () => void }) {
  if (ipo.status === '청약종료') {
    return <ClosedIpoCard ipo={ipo as ClosedIpo} onClick={onClick} isWishlisted={isWishlisted} onWishlistToggle={onWishlistToggle} />
  }
  return <ActiveIpoCard ipo={ipo as ActiveIpo} onClick={onClick} isWishlisted={isWishlisted} onWishlistToggle={onWishlistToggle} />
}

export function IpoCalendarPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('청약 일정')
  const [bottomFilter, setBottomFilter] = useState<BottomFilter>('전체')
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set())
  const [isScrollable, setIsScrollable] = useState(false)

  const toggleWishlist = (id: number) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')

  const dow = today.day()
  const monday = today.subtract(dow === 0 ? 6 : dow - 1, 'day')
  const weekDays = Array.from({ length: 6 }, (_, i) => monday.add(i, 'day'))

  const filteredIpos = bottomFilter === '전체' ? IPOS : IPOS.filter((ipo) => wishlistedIds.has(ipo.id))

  const ipoDatesAfterToday = filteredIpos
    .map((ipo) => ipo.scheduledDate)
    .filter((d) => d >= todayStr)
  const uniqueDates = bottomFilter === '관심'
    ? Array.from(new Set(ipoDatesAfterToday)).sort()
    : Array.from(new Set([todayStr, ...ipoDatesAfterToday])).sort()

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsScrollable(document.documentElement.scrollHeight > window.innerHeight)
    })
  }, [filteredIpos, tab, bottomFilter])

  return (
    <div className="bg-[#F6F6F9] min-h-screen">
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-[56px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] font-bold text-[#111111]">IPO 캘린더</span>
          <button onClick={() => navigate('/ipo/guide')}>
            <img src="/icons/question.svg" width={22} height={22} alt="" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/notifications')}>
            <img src="/icons/Bell.svg" width={25} height={25} alt="" />
          </button>
          <button>
            <img src="/icons/search.svg" width={19} height={19} alt="" />
          </button>
        </div>
      </header>

      <div className="flex bg-white relative z-[1]">
        {(['청약 일정', '청약내역/취소'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 h-[47px] text-[15px] font-bold border-b-2 transition-colors',
              tab === t ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#999EA4]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '청약 일정' && (
        <>
          <div className="bg-white px-4 pt-[9px] pb-[17px] rounded-b-[20px] shadow-[0_1px_10px_rgba(0,0,0,0.2)]">
            <div className="flex justify-end items-center gap-4 mb-[17px] pr-1">
              <button className="text-[12px] font-medium text-[#1A1A1A]">오늘</button>
              <span className="w-px h-[14px] bg-[#D9DBE0]" />
              <button className="text-[12px] font-medium text-[#1A1A1A]">월별보기</button>
            </div>
            <div className="grid grid-cols-6">
              {weekDays.map((day) => {
                const isToday = day.format('YYYY-MM-DD') === todayStr
                const isSaturday = day.day() === 6
                return (
                  <div key={day.format('YYYY-MM-DD')} className="flex flex-col items-center">
                    <span className="text-[12px] leading-[15px] text-[#9AA0AB]">
                      {isToday ? '오늘' : DAY_NAMES[day.day()]}
                    </span>
                    <div
                      className={cn(
                        'mt-[10px] w-[33px] h-[33px] flex items-center justify-center rounded-[6px] text-[16px] font-semibold',
                        isToday
                          ? 'bg-[#6B7280] text-white'
                          : isSaturday
                          ? 'text-[#C8CBD2]'
                          : 'text-[#1A1A1A]',
                      )}
                    >
                      {day.date()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={cn("px-4", isScrollable && "pb-[20px]")}>
            {bottomFilter === '관심' && filteredIpos.length === 0 && (
              <div className="flex flex-col items-center pt-[160px]">
                <div className="w-[64px] h-[64px] rounded-full bg-[#F0F1F4] flex items-center justify-center">
                  <img src="/icons/heart.svg" width={26} height={26} alt="" />
                </div>
                <span className="mt-[18px] text-[18px] font-bold text-[#001936]/[0.55]">관심 IPO를 등록해주세요</span>
              </div>
            )}
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
                    <WeekDivider
                      label={`${date.month() + 1}월 ${getWeekOfMonth(date)}주차`}
                    />
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-3 pl-[6px]">
                      <span className="text-[18px] font-bold text-[#3A3D45]">{date.date()}일</span>
                      {isToday ? (
                        <span className="inline-flex items-center justify-center w-[44px] h-[25px] bg-[#F0F1F4] text-[#9AA0AB] text-[12px] font-semibold rounded-[8px]">
                          오늘
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-[#9AA0AB]">
                          {DAY_NAMES[date.day()]}
                        </span>
                      )}
                    </div>

                    {dayIpos.length === 0 ? (
                      bottomFilter === '전체' && (
                        <div className="flex items-center gap-3 ml-[7px] mt-[16px]">
                          <div className="w-11 h-11 rounded-full bg-[#F0F1F4] flex items-center justify-center">
                            <img src="/icons/docs.svg" width={22} height={22} alt="" />
                          </div>
                          <span className="text-[17px] font-bold text-[#3A3D45] ml-1">소식이 없어요</span>
                        </div>
                      )
                    ) : (
                      <div className="space-y-[18px] mb-4">
                        {dayIpos.map((ipo) => (
                          <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo/${ipo.id}`)} isWishlisted={wishlistedIds.has(ipo.id)} onWishlistToggle={() => toggleWishlist(ipo.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </>
      )}

      {tab === '청약내역/취소' && (
        <div className="px-4 pt-4 space-y-3">
          {IPOS.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo/${ipo.id}`)} isWishlisted={wishlistedIds.has(ipo.id)} onWishlistToggle={() => toggleWishlist(ipo.id)} />
          ))}
        </div>
      )}

      {tab === '청약 일정' && (
        <div className="fixed bottom-[91px] right-4 z-20">
          <div className="flex bg-[#EFEFEF] rounded-[15px] p-0.5 shadow-[1px_1px_10px_0px_rgba(0,0,0,0.25)]">
            {(['전체', '관심'] as BottomFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setBottomFilter(f)}
                className={cn(
                  'px-5 py-1.5 rounded-[15px] text-[13px] transition-colors',
                  bottomFilter === f
                    ? 'bg-white text-black font-semibold shadow-[0_2px_2px_rgba(0,0,0,0.05)]'
                    : 'text-[#999EA4] font-medium',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
