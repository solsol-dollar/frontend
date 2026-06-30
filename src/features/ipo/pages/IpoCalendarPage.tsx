import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BellIcon } from '@/components/common/Header'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import { ipoApi, type IpoListItem } from '@/features/ipo/api/ipoApi'
import { ipoKeys, useIpoList } from '@/features/ipo/hooks/useIpo'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'
import { SubscriptionHistory } from '@/features/ipo/components/SubscriptionHistory'
import { serviceApi } from '@/lib/axios'
import { getInvestmentStatus, markInvestmentCompleted } from '@/lib/auth'
import { InvestmentProfileSheet } from '@/features/mypage/components/InvestmentProfileSheet'

type Tab = '청약 일정' | '청약내역/취소'
type BottomFilter = '전체' | '관심'
type CalendarView = 'weekly' | 'monthly'

const WEEK_SLIDE_DURATION_MS = 400

const EVENT_COLORS = {
  '청약시작': { bg: '#FFD6DB', bar: '#E2468B' },
  '청약마감': { bg: '#C7E5FF', bar: '#3660AC' },
  '상장(예정)일': { bg: '#F0F3EE', bar: '#019989' },
} as const

type EventType = keyof typeof EVENT_COLORS

interface CalendarEvent {
  id: number
  date: string
  type: EventType
  name: string
}

interface Ipo {
  id: number
  company: string
  ticker: string
  logo_color: string
  logo_url: string | null
  status: 'closed' | 'open' | 'upcoming'
  subscription_start: string | null
  subscription_end: string | null
  listing_date: string | null
  price: number
  price_confirmed: number | null
  is_favorite: boolean
  current_price: number | null
  listing_change_pct: number | null
}

function getAbbr(company: string): string {
  const words = company.split(/(?=[A-Z])|[\s-]/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return company.substring(0, 2).toUpperCase()
}

function formatPrice(price: number): string {
  return `USD ${price.toFixed(2)}`
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return '-'
  const s = dayjs(start).format('YYYY.MM.DD')
  const e = dayjs(end)
  return start.substring(0, 4) === end.substring(0, 4)
    ? `${s} ~ ${e.format('MM.DD')}`
    : `${s} ~ ${e.format('YYYY.MM.DD')}`
}

function deriveCalendarEvents(ipos: Ipo[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const ipo of ipos) {
    if (ipo.listing_date) {
      events.push({ id: ipo.id, date: ipo.listing_date, type: '상장(예정)일', name: ipo.company })
    }
    if (ipo.subscription_start) {
      events.push({ id: ipo.id, date: ipo.subscription_start, type: '청약시작', name: ipo.company })
    }
    if (ipo.subscription_end) {
      events.push({ id: ipo.id, date: ipo.subscription_end, type: '청약마감', name: ipo.company })
    }
  }
  return events
}

function mapApiToIpo(raw: IpoListItem): Ipo {
  return {
    id: raw.id,
    company: raw.companyName,
    ticker: raw.ticker,
    logo_color: generateLogoColor(raw.ticker),
    logo_url: raw.logoUrl,
    status: (raw.ipoStatus?.toLowerCase() ?? 'upcoming') as Ipo['status'],
    subscription_start: raw.subscriptionStartDate,
    subscription_end: raw.subscriptionEndDate,
    listing_date: raw.listingDate,
    price: raw.confirmedOfferPrice ?? raw.offerPriceMin ?? 0,
    price_confirmed: raw.confirmedOfferPrice,
    is_favorite: raw.isFavorite,
    current_price: raw.currentPrice ?? null,
    listing_change_pct: raw.priceChangePercent ?? null,
  }
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthWeeks(month: dayjs.Dayjs): dayjs.Dayjs[][] {
  const firstDay = month.startOf("month");
  const lastDay = month.endOf("month");
  const firstMon = firstDay.subtract((firstDay.day() + 6) % 7, "day");
  const weeks: dayjs.Dayjs[][] = [];
  let cur = firstMon;
  while (cur.isBefore(lastDay) || cur.isSame(lastDay, "day")) {
    const week = Array.from({ length: 5 }, (_, i) => cur.add(i, "day"));
    if (week.some((d) => d.month() === month.month())) {
      weeks.push(week);
    }
    cur = cur.add(7, "day");
  }
  return weeks;
}

function MonthlyCalendarView({
  month,
  events,
  todayStr,
  onShowMore,
  onNavigate,
}: {
  month: dayjs.Dayjs;
  events: CalendarEvent[];
  todayStr: string;
  onShowMore: (date: string, events: CalendarEvent[]) => void;
  onNavigate: (id: number) => void;
}) {
  const weeks = getMonthWeeks(month);
  return (
    <div className="pb-[10px]">
      <div className="relative my-[10px] flex items-center justify-center">
        <img
          src="/icons/Line.svg"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full"
          alt=""
        />
        <span className="relative bg-white px-2 text-[14px] font-medium text-[#9AA0AB]">
          {month.format("YYYY년 M월")}
        </span>
      </div>
      {weeks.map((week, wi) => (
        <div
          key={wi}
          className={cn(
            "grid grid-cols-5 h-[100px]",
            wi > 0 && "border-t border-[#f0f1f4]",
          )}
        >
          {week.map((day) => {
            const dateStr = day.format("YYYY-MM-DD");
            const isCurrentMonth = day.month() === month.month();
            const isToday = dateStr === todayStr;
            const dayEvents = events.filter((e) => e.date === dateStr);
            const hasEvents = dayEvents.length > 0;
            const isShowMore = dayEvents.length > 2;
            return (
              <div
                key={dateStr}
                data-date={dateStr}
                className={cn(
                  "flex flex-col pt-[10px] min-w-0 rounded-[6px]",
                  isShowMore && "transition-all duration-200 active:transition-none active:scale-[0.97] active:bg-[#F2F3F5] select-none cursor-pointer",
                )}
                onClick={isShowMore ? () => onShowMore(dateStr, dayEvents) : undefined}
              >
                {isCurrentMonth && (
                  <>
                    <div className="flex justify-center mb-[5px]">
                      <span
                        className={cn(
                          "text-[16px] font-semibold leading-none w-[28px] h-[28px] flex items-center justify-center rounded-[6px]",
                          isToday
                            ? "bg-[#E8E9EC] text-[#1A1A1A]"
                            : hasEvents
                              ? "text-[#1A1A1A]"
                                : "text-[#C8CBD2]",
                        )}
                      >
                        {day.date()}
                      </span>
                    </div>
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div
                        key={i}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          if (isShowMore) return
                          e.stopPropagation()
                          onNavigate(event.id)
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { isShowMore ? onShowMore(dateStr, dayEvents) : onNavigate(event.id) } }}
                        className={cn(
                          "flex items-center rounded-[5px] overflow-hidden h-[17px] mb-[2px] mr-[4px] cursor-pointer",
                          !isShowMore && "transition-all duration-200 active:transition-none active:scale-[0.97] active:opacity-60 select-none",
                        )}
                        style={{ backgroundColor: EVENT_COLORS[event.type].bg }}
                      >
                        <div
                          className="w-[2px] h-[11px] mx-[3px] shrink-0 rounded-[1px]"
                          style={{
                            backgroundColor: EVENT_COLORS[event.type].bar,
                          }}
                        />
                        <span
                          className="text-[10px] font-medium flex-1 min-w-0 overflow-hidden whitespace-nowrap block"
                          style={{
                            color: EVENT_COLORS[event.type].bar,
                            WebkitMaskImage:
                              "linear-gradient(to right, black 70%, transparent 100%)",
                            maskImage:
                              "linear-gradient(to right, black 70%, transparent 100%)",
                          }}
                        >
                          {event.name}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <button
                        className="text-[10px] font-normal text-text-tertiary h-[17px] leading-none pl-[3px] text-left"
                      >
                        +{dayEvents.length - 2}개
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getWeekOfMonth(date: dayjs.Dayjs): number {
  const firstDay = date.startOf("month").day();
  const adjusted = firstDay === 0 ? 6 : firstDay - 1;
  return Math.ceil((date.date() + adjusted) / 7);
}

const failedLogoUrls = new Set<string>()

function IpoLogo({ ipo, size = 40 }: { ipo: Ipo; size?: number }) {
  const [imgError, setImgError] = useState(() => !!ipo.logo_url && failedLogoUrls.has(ipo.logo_url))
  const abbr = getAbbr(ipo.company)
  const cls = `rounded-full flex-shrink-0 overflow-hidden`
  if (ipo.logo_url && !imgError) {
    return (
      <img
        src={ipo.logo_url}
        alt={ipo.company}
        className={cls}
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={() => { failedLogoUrls.add(ipo.logo_url!); setImgError(true) }}
      />
    )
  }
  return (
    <div
      className={`${cls} flex items-center justify-center text-white font-black`}
      style={{ width: size, height: size, backgroundColor: ipo.logo_color, fontSize: size * 0.325 }}
    >
      {abbr}
    </div>
  )
}

function HeartIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.2503 2.40774C15.4111 0.899217 14.004 0 12.4854 0C10.2345 0 9.03662 1.52736 8.49986 2.50765C7.9631 1.52736 6.76523 0 4.51431 0C2.99575 0 1.5894 0.900036 0.749377 2.40774C-0.258193 4.21846 -0.249095 6.54102 0.77288 8.62036C2.26869 11.662 5.5939 14.3342 7.44301 15.6552C7.76446 15.8845 8.1314 16 8.49986 16C8.86832 16 9.23526 15.8845 9.55671 15.6552C11.4051 14.3342 14.731 11.662 16.2268 8.62036C17.2496 6.54102 17.2579 4.21846 16.2503 2.40774Z"
        fill={isActive ? "#CA3D40" : "#001936"}
        fillOpacity={isActive ? 1 : 0.31}
      />
    </svg>
  );
}

function WeekDivider({ label }: { label: string }) {
  return (
    <div className="relative mt-[3px] py-4 flex items-center justify-center">
      <img
        src="/icons/Line.svg"
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full"
        alt=""
      />
      <span className="relative bg-[#F6F6F9] px-2 text-[14px] font-medium text-[#9AA0AB]">
        {label}
      </span>
    </div>
  );
}

function computeDDay(subscriptionEnd: string): { label: string; isEnded: boolean } {
  const d = dayjs(subscriptionEnd)
  if (!subscriptionEnd || !d.isValid()) return { label: '', isEnded: false }
  const diff = d.startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diff < 0) return { label: '', isEnded: true }
  if (diff === 0) return { label: 'D-Day', isEnded: false }
  return { label: `D-${diff}`, isEnded: false }
}

function ActiveIpoCard({ ipo, onClick, isWishlisted, onWishlistToggle }: { ipo: Ipo; onClick: () => void; isWishlisted: boolean; onWishlistToggle: () => void }) {
  const isUpcoming = ipo.status === 'upcoming'
  const { label: dDayLabel } = computeDDay((isUpcoming ? ipo.listing_date : ipo.subscription_end) ?? '')
  const handleKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick() }, [onClick])
  const dragRef = useRef({ startX: 0, startY: 0, moved: false })

  return (
    <div
      role="button" tabIndex={0}
      onPointerDown={(e) => { dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false } }}
      onPointerMove={(e) => { if (Math.abs(e.clientX - dragRef.current.startX) > 5 || Math.abs(e.clientY - dragRef.current.startY) > 5) dragRef.current.moved = true }}
      onClick={(e) => { if (dragRef.current.moved || (e.target as Element).closest('button')) return; onClick() }}
      onKeyDown={handleKey}
      className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[22px] text-left transition-all duration-200 active:transition-none active:scale-[0.97] active:bg-[#F2F3F5] select-none cursor-pointer">
      <div className="flex items-center justify-between mb-[13px]">
        <div className="flex items-center gap-[18px] min-w-0">
          <IpoLogo ipo={ipo} />
          <div className="translate-y-[1px] min-w-0 max-w-[160px]">
            <p className="text-[15px] font-bold text-[#111827] leading-[17.5px] truncate">{ipo.company}</p>
            <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">{ipo.ticker}</p>
          </div>
        </div>
        <img
          src={isUpcoming ? '/icons/IPO_upcoming.svg' : '/icons/IPO_ready.svg'}
          width={50} height={17}
          alt={isUpcoming ? '청약예정' : '청약가능'}
          className="absolute top-[19.5px] right-[17px] translate-x-[3px]"
        />
        {dDayLabel && (
          <span className={`absolute top-[39px] right-[17px] text-[11px] font-bold ${isUpcoming ? 'text-[#3045BB]' : 'text-[#CA3D40]'}`}>{dDayLabel}</span>
        )}
      </div>
      <div className="pl-[58px] space-y-[8px]">
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">공모(예정)가</span>
          <span className="ml-[11px] text-[13px] font-semibold text-[#111827]">
            {formatPrice(ipo.price)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">청약 기간</span>
          <span className="ml-[11px] text-[13px] font-medium text-[#7F858F]">
            {formatPeriod(ipo.subscription_start, ipo.subscription_end)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">상장(예정)일</span>
          <span className="ml-[11px] text-[13px] font-medium text-[#7F858F]">
            {ipo.listing_date ? dayjs(ipo.listing_date).format('YYYY.MM.DD') : '-'}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWishlistToggle();
        }}
        className="absolute bottom-[14px] right-[14px] p-2"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <HeartIcon isActive={isWishlisted} />
      </button>
    </div>
  )
}

function ClosedIpoCard({ ipo, onClick, isWishlisted, onWishlistToggle }: { ipo: Ipo; onClick: () => void; isWishlisted: boolean; onWishlistToggle: () => void }) {
  const isPositive = (ipo.listing_change_pct ?? 0) >= 0
  const change = ipo.current_price != null && ipo.price_confirmed != null
    ? Math.abs(ipo.current_price - ipo.price_confirmed)
    : null

  const handleKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick() }, [onClick])
  const dragRef = useRef({ startX: 0, startY: 0, moved: false })

  return (
    <div
      role="button" tabIndex={0}
      onPointerDown={(e) => { dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false } }}
      onPointerMove={(e) => { if (Math.abs(e.clientX - dragRef.current.startX) > 5 || Math.abs(e.clientY - dragRef.current.startY) > 5) dragRef.current.moved = true }}
      onClick={(e) => { if (dragRef.current.moved || (e.target as Element).closest('button')) return; onClick() }}
      onKeyDown={handleKey}
      className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[30px] text-left transition-all duration-200 active:transition-none active:scale-[0.97] active:bg-[#F2F3F5] select-none cursor-pointer">
      <img src="/icons/IPO_end.svg" width={50} height={17} alt="청약종료" className="absolute top-[19.5px] right-[17px] translate-x-[3px]" />
      <div className="flex items-center mb-[13px]">
        <div className="flex items-center gap-[18px] min-w-0">
          <IpoLogo ipo={ipo} />
          <div className="translate-y-[1px] min-w-0 max-w-[160px]">
            <p className="text-[15px] font-bold text-[#111827] leading-[17.5px] truncate">{ipo.company}</p>
            <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">{ipo.ticker}</p>
          </div>
        </div>
      </div>
      <div className="pl-[58px] space-y-[8px]">
        <div className="flex gap-[30px] mb-[18px]">
          <div>
            <p className="text-[12px] font-medium text-[#7F858F] mb-[4px]">공모가(확정)</p>
            <p className="text-[13px] font-semibold text-[#111827]">
              {ipo.price_confirmed != null ? formatPrice(ipo.price_confirmed) : '-'}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#7F858F] mb-[4px]">현재가</p>
            <p className="text-[13px] font-semibold text-[#111827]">
              {ipo.current_price != null ? formatPrice(ipo.current_price) : '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center !mt-[6px]">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">상장일 대비</span>
          {change != null && ipo.listing_change_pct != null ? (
            <span className={cn('ml-[7px] text-[13px] font-medium', isPositive ? 'text-[#CA3D40]' : 'text-down')}>
              <span className="text-[9px]">{isPositive ? '▲' : '▼'}</span>{isPositive ? '+' : '-'}{change.toFixed(2)} ({isPositive ? '+' : ''}{ipo.listing_change_pct.toFixed(2)}%)
            </span>
          ) : (
            <span className="ml-[7px] text-[13px] font-medium text-[#7F858F]">-</span>
          )}
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">상장일</span>
          <span className="ml-[7px] text-[13px] font-medium text-[#7F858F]">
            {ipo.listing_date ? dayjs(ipo.listing_date).format('YYYY.MM.DD') : '-'}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWishlistToggle();
        }}
        className="absolute bottom-[14px] right-[14px] p-2"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <HeartIcon isActive={isWishlisted} />
      </button>
    </div>
  )
}

function IpoCard({ ipo, onClick, isWishlisted, onWishlistToggle }: { ipo: Ipo; onClick: () => void; isWishlisted: boolean; onWishlistToggle: () => void }) {
  if (ipo.status === 'closed') {
    return <ClosedIpoCard ipo={ipo} onClick={onClick} isWishlisted={isWishlisted} onWishlistToggle={onWishlistToggle} />
  }
  return <ActiveIpoCard ipo={ipo} onClick={onClick} isWishlisted={isWishlisted} onWishlistToggle={onWishlistToggle} />
}

export function IpoCalendarPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const initialTab = (state as { tab?: Tab })?.tab
  const [tab, setTab] = useState<Tab>(initialTab ?? '청약 일정')
  const initialFilter = (state as { bottomFilter?: string })?.bottomFilter
  const [bottomFilter, setBottomFilter] = useState<BottomFilter>(initialFilter === '관심' ? '관심' : '전체')

  useEffect(() => {
    if ((state as { tab?: Tab })?.tab) {
      navigate('.', { replace: true, state: {} })
    }
  }, [])
  const filterTabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [filterIndicator, setFilterIndicator] = useState({ left: 0, width: 0 })
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set())
  const [calendarView, setCalendarViewRaw] = useState<CalendarView>(
    () => (sessionStorage.getItem('ipoCalendarView') as CalendarView | null) ?? 'weekly'
  )
  const setCalendarView = useCallback((view: CalendarView) => {
    sessionStorage.setItem('ipoCalendarView', view)
    setCalendarViewRaw(view)
  }, [])
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'))
  const [daySheet, setDaySheet] = useState<{ date: string; events: CalendarEvent[] } | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)
  const [sheetDragY, setSheetDragY] = useState(0)
  const sheetTouchStartY = useRef(0)
  const sheetIsDragging = useRef(false)
  const sheetPanelRef = useRef<HTMLDivElement>(null)

  const [showDiagnosis, setShowDiagnosis] = useState(() => getInvestmentStatus() === 'REQUIRED')
  const submitDiagnosis = async (data: { hope: string; provide: string }) => {
    try {
      await serviceApi.post('/api/service/api/v1/mypage/investment-profile', data)
      markInvestmentCompleted()
      setShowDiagnosis(false)
    } catch (e) {
      console.error(e)
    }
  }

  const dateSectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const monthlyContainerRef = useRef<HTMLDivElement>(null)
  const monthlyHeaderRef = useRef<HTMLDivElement>(null)
  const currentMonthSectionRef = useRef<HTMLDivElement | null>(null)
  const todayMonthRef = useRef<HTMLDivElement | null>(null)
  const monthSectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const isMonthlyTransitioning = useRef(false)
  const touchStartX = useRef<number>(0)

  const scrollToDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    const date = dayjs(dateStr)
    changeWeekRef.current(date.subtract((date.day() + 6) % 7, 'day'))
    requestAnimationFrame(() => {
      const el = dateSectionRefs.current.get(dateStr)
      const container = scrollContainerRef.current
      if (el && container) {
        const elTop = el.getBoundingClientRect().top
        const containerTop = container.getBoundingClientRect().top
        container.scrollTop += elTop - containerTop - 8
      }
    })
  }

  const weekContainerRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [snapping, setSnapping] = useState(false)
  const isSwipingRef = useRef(false)
  const touchStartY = useRef<number>(0)
  const swipeDirectionRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleWeekTouchStart = (e: React.TouchEvent) => {
    if (snapping) return
    isSwipingRef.current = true
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    swipeDirectionRef.current = null
  }

  const handleWeekTouchMove = (e: React.TouchEvent) => {
    if (snapping) return
    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current
    if (swipeDirectionRef.current === null && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
      swipeDirectionRef.current = Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'
    }
    if (swipeDirectionRef.current === 'horizontal') {
      setDragOffset(deltaX)
    }
  }

  const handleWeekTouchEnd = (e: React.TouchEvent) => {
    if (snapping) return
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (swipeDirectionRef.current === 'vertical') {
      isSwipingRef.current = false
      if (deltaY > 50) {
        setCalendarView('monthly')
        setCurrentMonth(displayWeekStart.startOf('month'))
      }
      return
    }
    const delta = e.changedTouches[0].clientX - touchStartX.current
    const width = weekContainerRef.current?.offsetWidth ?? 375
    if (Math.abs(delta) < 50) {
      setSnapping(true)
      setDragOffset(0)
      setTimeout(() => { setSnapping(false); isSwipingRef.current = false }, WEEK_SLIDE_DURATION_MS)
      return
    }
    const dir = delta < 0 ? 'left' : 'right'
    setSnapping(true)
    setDragOffset(dir === 'left' ? -width : width)
    setTimeout(() => {
      setDisplayWeekStart((prev) => dir === 'left' ? prev.add(7, 'day') : prev.subtract(7, 'day'))
      setDragOffset(0)
      setSnapping(false)
      isSwipingRef.current = false
    }, WEEK_SLIDE_DURATION_MS)
  }

  const queryClient = useQueryClient()
  const { data: queryData } = useIpoList()

  const ipos = useMemo(
    () => queryData?.data.ipos.map(mapApiToIpo) ?? [],
    [queryData],
  )

  useEffect(() => {
    if (queryData?.data.ipos) {
      setWishlistedIds(new Set(queryData.data.ipos.filter((i) => i.isFavorite).map((i) => i.id)))
    }
  }, [queryData])

  const { mutate: toggleFavMutation } = useMutation({
    mutationFn: ({ ipoId, isCurrent }: { ipoId: number; isCurrent: boolean }) =>
      isCurrent ? ipoApi.removeFavorite(ipoId) : ipoApi.addFavorite(ipoId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ipoKeys.all }),
    onError: (_, { ipoId, isCurrent }) => {
      setWishlistedIds((prev) => {
        const next = new Set(prev)
        isCurrent ? next.add(ipoId) : next.delete(ipoId)
        return next
      })
    },
  })

  const toggleWishlist = (id: number) => {
    const isCurrent = wishlistedIds.has(id)
    setWishlistedIds((prev) => {
      const next = new Set(prev)
      isCurrent ? next.delete(id) : next.add(id)
      return next
    })
    toggleFavMutation({ ipoId: id, isCurrent })
  }

  useEffect(() => {
    const idx = bottomFilter === '전체' ? 0 : 1
    const el = filterTabRefs.current[idx]
    if (el) setFilterIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [bottomFilter])

  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");

  const [selectedDate, setSelectedDate] = useState(
    () => sessionStorage.getItem('ipoSelectedDate') ?? todayStr
  )

  const dow = today.day()
  const monday = today.subtract((dow + 6) % 7, 'day')
  const [displayWeekStart, setDisplayWeekStart] = useState(() => {
    const saved = sessionStorage.getItem('ipoDisplayWeekStart')
    return saved ? dayjs(saved) : monday
  })

  const animIdRef = useRef(0)
  const changeWeekRef = useRef<(newWeek: dayjs.Dayjs) => void>(() => {})
  changeWeekRef.current = (newWeek: dayjs.Dayjs) => {
    if (newWeek.isSame(displayWeekStart, 'day')) return
    const dir = newWeek.isAfter(displayWeekStart) ? 'left' : 'right'
    const width = weekContainerRef.current?.offsetWidth ?? 375
    const startOffset = dir === 'left' ? width : -width
    const animId = ++animIdRef.current
    setSnapping(false)
    setDragOffset(startOffset)
    setDisplayWeekStart(newWeek)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (animIdRef.current !== animId) return
      setSnapping(true)
      setDragOffset(0)
      setTimeout(() => {
        if (animIdRef.current !== animId) return
        setSnapping(false)
      }, WEEK_SLIDE_DURATION_MS)
    }))
  }

  const filteredIpos = bottomFilter === '전체' ? ipos : ipos.filter((ipo) => wishlistedIds.has(ipo.id))
  const calendarEvents = deriveCalendarEvents(filteredIpos)

  const scrollToTodayMonth = () => {
    const container = monthlyContainerRef.current
    const section = todayMonthRef.current
    if (!container || !section) return
    const headerHeight = monthlyHeaderRef.current?.offsetHeight ?? 0
    container.scrollTop += section.getBoundingClientRect().top - container.getBoundingClientRect().top - headerHeight - 10
  }

  const undatedIpos = filteredIpos.filter((ipo) => ipo.subscription_start === null)
  const allIpoDates = filteredIpos.map((ipo) => ipo.subscription_start).filter((d): d is string => d !== null)
  const uniqueDates = Array.from(new Set(bottomFilter === '관심' ? allIpoDates : [todayStr, ...allIpoDates])).sort()
  const uniqueDatesRef = useRef(uniqueDates)
  uniqueDatesRef.current = uniqueDates

  const scrollRestored = useRef(false)

  useEffect(() => {
    if (filteredIpos.length === 0) return
    if (scrollRestored.current) return
    scrollRestored.current = true

    requestAnimationFrame(() => {
      const container = scrollContainerRef.current
      if (!container) return
      const savedMonthly = sessionStorage.getItem('ipoMonthlyScrollTop')
      if (savedMonthly && monthlyContainerRef.current) {
        monthlyContainerRef.current.scrollTop = Number(savedMonthly)
        sessionStorage.removeItem('ipoMonthlyScrollTop')
        sessionStorage.removeItem('ipoListScrollTop')
        sessionStorage.removeItem('ipoSelectedDate')
        sessionStorage.removeItem('ipoDisplayWeekStart')
        return
      }
      const saved = sessionStorage.getItem('ipoListScrollTop')
      if (saved) {
        container.scrollTop = Number(saved)
        sessionStorage.removeItem('ipoListScrollTop')
        sessionStorage.removeItem('ipoSelectedDate')
        sessionStorage.removeItem('ipoDisplayWeekStart')
        return
      }
      const el = dateSectionRefs.current.get(todayStr)
      if (el) {
        const elTop = el.getBoundingClientRect().top
        const containerTop = container.getBoundingClientRect().top
        container.scrollTop += elTop - containerTop - 8
      }
    })
  }, [filteredIpos])

  useEffect(() => {
    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const HEADER_OFFSET = 160
        let topDate: string | null = null
        let topPos: number | null = null
        dateSectionRefs.current.forEach((el, dateStr) => {
          const rect = el.getBoundingClientRect()
          const hasIpos = filteredIpos.some((ipo) => ipo.subscription_start === dateStr)
          const effectiveBottom = hasIpos ? rect.bottom - 80 : rect.bottom
          if (effectiveBottom > HEADER_OFFSET && rect.top < window.innerHeight) {
            if (topPos === null || effectiveBottom < topPos) {
              topPos = effectiveBottom
              topDate = dateStr
            }
          }
        })
        if (topDate) {
          const d = dayjs(topDate)
          const newWeekStart = d.subtract((d.day() + 6) % 7, 'day')
          changeWeekRef.current(newWeekStart)
          setSelectedDate(topDate)
        }
      })
    }
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [calendarView])

  useEffect(() => {
    if (calendarView !== 'monthly') return
    isMonthlyTransitioning.current = true
    requestAnimationFrame(() => {
      const container = monthlyContainerRef.current
      const section = currentMonthSectionRef.current
      if (container && section) {
        const headerHeight = monthlyHeaderRef.current?.offsetHeight ?? 0
        container.scrollTop += section.getBoundingClientRect().top - container.getBoundingClientRect().top - headerHeight - 10
      }
      requestAnimationFrame(() => {
        isMonthlyTransitioning.current = false
      })
    })
  }, [calendarView])

  useEffect(() => {
    if (calendarView !== 'monthly') return
    const container = monthlyContainerRef.current
    if (!container) return
    const handleMonthlyScroll = () => {
      if (isMonthlyTransitioning.current) return
      const headerHeight = monthlyHeaderRef.current?.offsetHeight ?? 0
      const containerTop = container.getBoundingClientRect().top + headerHeight
      let found: string | null = null
      let maxVisible = 0
      const containerBottom = container.getBoundingClientRect().bottom
      monthSectionRefs.current.forEach((el, monthStr) => {
        const rect = el.getBoundingClientRect()
        const visibleHeight = Math.max(0, Math.min(rect.bottom, containerBottom) - Math.max(rect.top, containerTop))
        if (visibleHeight > maxVisible) {
          maxVisible = visibleHeight
          found = monthStr
        }
      })
      if (found) setCurrentMonth(dayjs(found))
    }
    container.addEventListener('scroll', handleMonthlyScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleMonthlyScroll)
  }, [calendarView])

  const closeSheet = () => {
    sheetIsDragging.current = false
    setSheetDragY(window.innerHeight)
    setTimeout(() => {
      setSheetDragY(0)
      setSheetVisible(false)
      setDaySheet(null)
    }, 260)
  }

  const handleSheetEventClick = (ipoId: number) => {
    if (monthlyContainerRef.current) {
      sessionStorage.setItem('ipoMonthlyScrollTop', String(monthlyContainerRef.current.scrollTop))
    }
    navigate(`/ipo/${ipoId}`)
  }

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    sheetTouchStartY.current = e.touches[0].clientY
    sheetIsDragging.current = true
  }

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (!sheetIsDragging.current) return
    const dy = e.touches[0].clientY - sheetTouchStartY.current
    if (dy > 0) setSheetDragY(dy)
  }

  const handleSheetTouchEnd = () => {
    sheetIsDragging.current = false
    if (sheetDragY > 80) {
      setSheetDragY(window.innerHeight)
      setTimeout(() => {
        setSheetDragY(0)
        setSheetVisible(false)
        setDaySheet(null)
      }, 260)
    } else {
      setSheetDragY(0)
    }
  }

  useEffect(() => {
    if (!daySheet) return
    const id = requestAnimationFrame(() => {
      setSheetVisible(true)
      const container = monthlyContainerRef.current
      const panel = sheetPanelRef.current
      if (!container || !panel) return
      const dayEl = container.querySelector(`[data-date="${daySheet.date}"]`) as HTMLElement | null
      if (!dayEl) return
      const headerHeight = monthlyHeaderRef.current?.offsetHeight ?? 0
      const visibleTop = container.getBoundingClientRect().top + headerHeight
      const sheetTop = window.innerHeight - panel.offsetHeight
      const dayTop = dayEl.getBoundingClientRect().top
      const dayBottom = dayEl.getBoundingClientRect().bottom
      if (dayBottom > sheetTop - 16 || dayTop < visibleTop - 20) {
        container.scrollBy({ top: dayBottom - (sheetTop - 16), behavior: 'smooth' })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [daySheet])

  return (
    <div className="h-dvh flex flex-col bg-[#F6F6F9]">
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-[56px] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] font-bold text-[#111111]">
            IPO 캘린더
          </span>
          <button onClick={() => navigate("/ipo/guide")}>
            <img src="/icons/question.svg" width={22} height={22} alt="" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/notifications")}>
            <BellIcon />
          </button>
          <button onClick={() => navigate('/ipo/search')} className="ml-[9px] mr-[4px]">
            <img src="/icons/search.svg" width={19} height={19} alt="" />
          </button>
        </div>
      </header>

      <div className="flex bg-white relative z-[2] shrink-0">
        {(['청약 일정', '청약내역/취소'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 h-[47px] text-[15px] font-bold border-b-2 transition-colors",
              tab === t
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#999EA4]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "청약 일정" && (
        <>
          <div ref={monthlyContainerRef} className={cn(
            'relative z-[1] bg-white px-4 pb-[17px] rounded-b-[20px] shadow-[0_1px_10px_rgba(0,0,0,0.2)]',
            calendarView === 'monthly' ? 'flex-1 overflow-y-auto scrollbar-hide' : 'shrink-0 pt-[9px]',
          )} style={calendarView === 'monthly' ? { scrollbarWidth: 'none' } : undefined}>
            {calendarView === 'weekly' ? (
              <>
                <div className="flex justify-end items-center gap-4 mb-[17px] pr-1">
                  <button className="text-[12px] font-medium text-[#1A1A1A]" onClick={() => {
                    scrollToDate(todayStr)
                  }}>오늘</button>
                  <span className="w-px h-[14px] bg-[#D9DBE0]" />
                  <button
                    className="text-[12px] font-medium text-[#1A1A1A]"
                    onClick={() => { setCalendarView('monthly'); setCurrentMonth(dayjs(selectedDate).startOf('month')) }}
                  >
                    월별보기
                  </button>
                </div>
                <div ref={weekContainerRef} className="overflow-hidden">
                  <div
                    style={{
                      display: 'flex',
                      width: '300%',
                      transform: `translateX(calc(-33.333% + ${dragOffset}px))`,
                      transition: snapping ? `transform ${WEEK_SLIDE_DURATION_MS}ms ease-out` : 'none',
                      willChange: 'transform',
                    }}
                    onTouchStart={handleWeekTouchStart}
                    onTouchMove={handleWeekTouchMove}
                    onTouchEnd={handleWeekTouchEnd}
                  >
                    {[displayWeekStart.subtract(7, 'day'), displayWeekStart, displayWeekStart.add(7, 'day')].map((ws, wi) => (
                      <div
                        key={wi}
                        className="grid grid-cols-6"
                        style={{ width: '33.333%' }}
                      >
                        {Array.from({ length: 6 }, (_, i) => ws.add(i, 'day')).map((day) => {
                          const dateStr = day.format('YYYY-MM-DD')
                          const isToday = dateStr === todayStr
                          const isSelected = dateStr === selectedDate
                          const isSaturday = day.day() === 6
                          const hasEvents = filteredIpos.some((ipo) => ipo.subscription_start === dateStr)
                          return (
                            <button key={dateStr} className="flex flex-col items-center" onClick={() => (hasEvents || isToday) && scrollToDate(dateStr)} disabled={!hasEvents && !isToday}>
                              <span className="text-[12px] leading-[15px] text-[#9AA0AB]">
                                {isToday ? '오늘' : DAY_NAMES[day.day()]}
                              </span>
                              <div className={cn(
                                'mt-[10px] w-[33px] h-[33px] flex items-center justify-center rounded-[6px] text-[16px] font-semibold',
                                isSelected ? 'bg-[#6B7280] text-white' : isToday ? 'bg-[#E8E9EC] text-[#1A1A1A]' : isSaturday || !hasEvents ? 'text-[#C8CBD2]' : 'text-[#1A1A1A]',
                              )}>
                                {day.date()}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div ref={monthlyHeaderRef} className="sticky top-0 bg-white z-10 pt-[9px] pb-[9px]">
                  <div className="flex items-center justify-between pr-1">
                    <div className="flex items-center gap-[10px] mt-[2px]">
                      {([['청약시작', '#E2468B'], ['청약마감', '#3660AC'], ['상장(예정)일', '#019989']] as const).map(([label, color]) => (
                        <div key={label} className="flex items-center gap-[4px]">
                          <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-[12px] font-medium text-[#1A1A1A]" onClick={scrollToTodayMonth}>오늘</button>
                      <span className="w-px h-[14px] bg-[#D9DBE0]" />
                      <button className="text-[12px] font-medium text-[#1A1A1A]" onClick={() => {
                        const monthStart = currentMonth.format('YYYY-MM-DD')
                        const firstTargetDate = uniqueDatesRef.current.find(d => d >= monthStart) ?? monthStart
                        const target = dayjs(firstTargetDate)
                        const newWeekStart = target.subtract((target.day() + 6) % 7, 'day')
                        setSelectedDate(firstTargetDate)
                        changeWeekRef.current(newWeekStart)
                        setCalendarView('weekly')
                        requestAnimationFrame(() => {
                          const el = dateSectionRefs.current.get(firstTargetDate)
                          const container = scrollContainerRef.current
                          if (el && container) {
                            const elTop = el.getBoundingClientRect().top
                            const containerTop = container.getBoundingClientRect().top
                            container.scrollTop += elTop - containerTop - 8
                          }
                        })
                      }}>주별보기</button>
                    </div>
                  </div>
                </div>
                <div className="pt-[10px]" />
                {Array.from({ length: 12 }, (_, i) => dayjs('2026-01-01').add(i, 'month')).map((month) => {
                  const isCurrentMonthSection = month.isSame(currentMonth, 'month')
                  const isTodayMonth = month.isSame(dayjs().startOf('month'), 'month')
                  return (
                    <div key={month.format('YYYY-MM')} ref={(el) => {
                      if (el) monthSectionRefs.current.set(month.format('YYYY-MM'), el)
                      else monthSectionRefs.current.delete(month.format('YYYY-MM'))
                      if (isCurrentMonthSection) currentMonthSectionRef.current = el
                      if (isTodayMonth) todayMonthRef.current = el
                    }}>
                      <MonthlyCalendarView month={month} events={calendarEvents} todayStr={todayStr} onShowMore={(date, evts) => setDaySheet({ date, events: evts })} onNavigate={handleSheetEventClick} />
                    </div>
                  )
                })}
                <div className="h-[110px]" />
              </>
            )}
          </div>

          {calendarView !== 'monthly' && <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-none px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {bottomFilter === '관심' && filteredIpos.length === 0 && (
              <div className="flex flex-col items-center pt-[160px]">
                <div className="w-[64px] h-[64px] rounded-full bg-[#F0F1F4] flex items-center justify-center">
                  <img src="/icons/heart.svg" width={26} height={26} alt="" />
                </div>
                <span className="mt-[20px] text-[20px] font-bold text-[#001936]/[0.55]">관심 IPO를 등록해주세요</span>
              </div>
            )}
            {uniqueDates.map((dateStr, idx) => {
              const date = dayjs(dateStr)
              const isToday = dateStr === todayStr
              const dayIpos = filteredIpos.filter((ipo) => ipo.subscription_start === dateStr)
              const prevDate = idx > 0 ? dayjs(uniqueDates[idx - 1]) : null
              const showWeekDivider =
                !prevDate ||
                getWeekOfMonth(prevDate) !== getWeekOfMonth(date) ||
                prevDate.month() !== date.month()
              const nextDate = idx < uniqueDates.length - 1 ? dayjs(uniqueDates[idx + 1]) : null
              const hasNextDateInSameWeek =
                nextDate != null &&
                getWeekOfMonth(nextDate) === getWeekOfMonth(date) &&
                nextDate.month() === date.month()

              return (
                <div key={dateStr}>
                  <div className={cn(!showWeekDivider && idx > 0 && 'mt-[24px]')} ref={(el) => { if (el) dateSectionRefs.current.set(dateStr, el); else dateSectionRefs.current.delete(dateStr) }}>
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
                          <div className={cn(
                            'flex items-center gap-3 ml-[7px] mt-[16px]',
                            hasNextDateInSameWeek ? 'mb-[28px]' : 'mb-4',
                          )}>
                            <div className="w-[52px] h-[52px] rounded-full bg-[#F0F1F4] flex items-center justify-center">
                              <img src="/icons/docs.svg" width={26} height={26} alt="" />
                            </div>
                            <span className="text-[19px] font-bold text-[#3A3D45] ml-1">소식이 없어요</span>
                          </div>
                        )
                      ) : (
                        <div className="space-y-[18px] mb-4">
                          {dayIpos.map((ipo) => (
                            <IpoCard key={ipo.id} ipo={ipo} onClick={() => {
                              if (scrollContainerRef.current) sessionStorage.setItem('ipoListScrollTop', String(scrollContainerRef.current.scrollTop))
                              sessionStorage.setItem('ipoSelectedDate', selectedDate)
                              sessionStorage.setItem('ipoDisplayWeekStart', displayWeekStart.format('YYYY-MM-DD'))
                              navigate(`/ipo/${ipo.id}`)
                            }} isWishlisted={wishlistedIds.has(ipo.id)} onWishlistToggle={() => toggleWishlist(ipo.id)} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isToday && undatedIpos.length > 0 && (
                    <div>
                      <WeekDivider label="2026년 하반기" />
                      <div className="flex items-center gap-2 mb-3 pl-[6px]">
                        <span className="text-[18px] font-bold text-[#3A3D45]">7~12월</span>
                      </div>
                      <div className="space-y-[18px] mb-4">
                        {undatedIpos.map((ipo) => (
                          <IpoCard key={ipo.id} ipo={ipo} onClick={() => {
                            if (scrollContainerRef.current) sessionStorage.setItem('ipoListScrollTop', String(scrollContainerRef.current.scrollTop))
                            sessionStorage.setItem('ipoSelectedDate', selectedDate)
                            sessionStorage.setItem('ipoDisplayWeekStart', displayWeekStart.format('YYYY-MM-DD'))
                            navigate(`/ipo/${ipo.id}`)
                          }} isWishlisted={wishlistedIds.has(ipo.id)} onWishlistToggle={() => toggleWishlist(ipo.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {bottomFilter === '전체' ? (
              <div className="h-[450px] flex flex-col justify-end px-[6px] pb-[140px]">
                <p className="text-[12px] font-medium text-[#9AA0AB] mb-[8px]">유의사항</p>
                <ul className="space-y-[6px]">
                  {[
                    '미국 공모주 청약에 대한 배정은 국내의 균등/비례 배정 방식과 달라 미국 현지 IPO 중개회사 내부 기준에 따라 진행되며, 배정받지 못할 수도 있습니다.',
                    '현지 사정으로 청약이 취소(중단)될 수 있습니다.',
                    '청약 취소는 청약 기간 중에만 가능합니다.',
                  ].map((text, i) => (
                    <li key={i} className="flex gap-[6px] text-[11px] text-[#9AA0AB] leading-[1.5]">
                      <span className="shrink-0">•</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="h-[280px]" />
            )}
          </div>}

        </>
      )}

      {tab === '청약내역/취소' && <SubscriptionHistory />}


      {daySheet && (
        <>
          <div className="fixed inset-0 z-50" onClick={closeSheet} />
          <div
            ref={sheetPanelRef}
            className="fixed left-1/2 w-full max-w-mobile bottom-0 z-50 bg-white rounded-t-2xl px-5 pt-4 pb-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            style={{
              transform: `translateX(-50%) translateY(${sheetVisible ? sheetDragY : window.innerHeight}px)`,
              transition: sheetIsDragging.current ? 'none' : 'transform 0.26s ease',
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
          >
            <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-4" />
            <p className="text-base font-bold text-text-primary mb-3">
              {dayjs(daySheet.date).format('M월 D일')} 청약 일정
            </p>
            <div className="space-y-2">
              {daySheet.events.map((event, i) => (
                <button
                  key={i}
                  onClick={() => handleSheetEventClick(event.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F6F6F9] text-left transition-all duration-200 active:transition-none active:scale-[0.97] active:bg-[#ECEDF1] select-none"
                >
                  <div
                    className="w-[3px] h-[18px] rounded-[2px] shrink-0"
                    style={{ backgroundColor: EVENT_COLORS[event.type].bar }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{event.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: EVENT_COLORS[event.type].bar }}>
                      {event.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "청약 일정" && calendarView !== 'monthly' && (
        <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 w-full max-w-mobile px-4 flex justify-end z-20 pointer-events-none">
          <div className="relative flex bg-[#EFEFEF] rounded-[15px] p-0.5 shadow-[1px_1px_10px_0px_rgba(0,0,0,0.25)] pointer-events-auto">
            <div
              className="absolute top-0.5 bottom-0.5 rounded-[13px] bg-white shadow-[0_2px_2px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out"
              style={{ left: filterIndicator.left, width: filterIndicator.width }}
            />
            {(["전체", "관심"] as BottomFilter[]).map((f, i) => (
              <button
                key={f}
                ref={el => { filterTabRefs.current[i] = el }}
                onClick={() => setBottomFilter(f)}
                className={cn(
                  "relative z-10 px-5 py-1.5 rounded-[15px] text-[13px] transition-colors duration-200",
                  bottomFilter === f ? "text-black font-semibold" : "text-[#999EA4] font-medium",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {showDiagnosis && (
        <InvestmentProfileSheet
          onConfirm={submitDiagnosis}
          onClose={() => setShowDiagnosis(false)}
        />
      )}
    </div>
  );
}
