import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { SubscriptionHistory } from "@/features/ipo/components/SubscriptionHistory";

type Tab = "청약 일정" | "청약내역/취소";
type BottomFilter = "전체" | "관심";
type CalendarView = "weekly" | "monthly";

const WEEK_SLIDE_DURATION_MS = 400;
const DATE_SCROLL_TOP_PADDING = 16;

const EVENT_COLORS = {
  청약시작: { bg: "#FFD6DB", bar: "#E2468B" },
  청약마감: { bg: "#C7E5FF", bar: "#3660AC" },
  "상장(예정)일": { bg: "#F0F3EE", bar: "#019989" },
} as const;

type EventType = keyof typeof EVENT_COLORS;

interface CalendarEvent {
  date: string;
  type: EventType;
  name: string;
}

interface Ipo {
  id: number;
  company: string;
  ticker: string;
  logo_color: string;
  status: "closed" | "open" | "upcoming";
  subscription_start: string;
  subscription_end: string;
  listing_date: string;
  price: number;
  price_confirmed: number | null;
  is_favorite: boolean;
  current_price: number | null;
  listing_change_pct: number | null;
}

function getAbbr(company: string): string {
  const words = company.split(/(?=[A-Z])|[\s-]/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return company.substring(0, 2).toUpperCase();
}

function formatPrice(price: number): string {
  return `USD ${price.toFixed(2)}`;
}

function formatPeriod(start: string, end: string): string {
  const s = dayjs(start).format("YYYY.MM.DD");
  const e = dayjs(end);
  return start.substring(0, 4) === end.substring(0, 4)
    ? `${s} ~ ${e.format("MM.DD")}`
    : `${s} ~ ${e.format("YYYY.MM.DD")}`;
}

function deriveCalendarEvents(ipos: Ipo[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const ipo of ipos) {
    if (ipo.listing_date) {
      events.push({
        date: ipo.listing_date,
        type: "상장(예정)일",
        name: ipo.company,
      });
    }
    if (ipo.subscription_start) {
      events.push({
        date: ipo.subscription_start,
        type: "청약시작",
        name: ipo.company,
      });
    }
    if (ipo.subscription_end) {
      events.push({
        date: ipo.subscription_end,
        type: "청약마감",
        name: ipo.company,
      });
    }
  }
  return events;
}

const IPOS: Ipo[] = [
  {
    id: 1,
    company: "CoreWeave",
    ticker: "CRWV",
    logo_color: "#FF6B35",
    status: "open",
    subscription_start: "2026-06-01",
    subscription_end: "2026-06-24",
    listing_date: "2026-07-04",

    price: 20.0,
    price_confirmed: null,
    is_favorite: false,
    current_price: null,
    listing_change_pct: null,
  },
  {
    id: 2,
    company: "SpaceX",
    ticker: "SPCX",
    logo_color: "#1C1FE8",
    status: "closed",
    subscription_start: "2026-06-08",
    subscription_end: "2026-06-23",
    listing_date: "2026-07-12",

    price: 18.0,
    price_confirmed: 20.0,
    is_favorite: false,
    current_price: 24.6,
    listing_change_pct: 23.12,
  },
  {
    id: 3,
    company: "Anthropic",
    ticker: "ANTH",
    logo_color: "#E8632A",
    status: "closed",
    subscription_start: "2026-06-02",
    subscription_end: "2026-06-07",
    listing_date: "2026-06-09",

    price: 13.0,
    price_confirmed: 25.0,
    is_favorite: false,
    current_price: 28.5,
    listing_change_pct: 25.0,
  },
  {
    id: 4,
    company: "Stripe",
    ticker: "STRP",
    logo_color: "#635BFF",
    status: "upcoming",
    subscription_start: "2026-06-19",
    subscription_end: "2026-06-27",
    listing_date: "2026-06-29",

    price: 28.0,
    price_confirmed: null,
    is_favorite: false,
    current_price: null,
    listing_change_pct: null,
  },
  {
    id: 5,
    company: "OpenAI",
    ticker: "OAIX",
    logo_color: "#10A37F",
    status: "closed",
    subscription_start: "2026-06-08",
    subscription_end: "2026-06-13",
    listing_date: "2026-06-20",

    price: 23.0,
    price_confirmed: 25.0,
    is_favorite: false,
    current_price: 31.2,
    listing_change_pct: 24.8,
  },
];

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthWeeks(month: dayjs.Dayjs): dayjs.Dayjs[][] {
  const firstDay = month.startOf("month");
  const lastDay = month.endOf("month");
  const firstMon = firstDay.subtract((firstDay.day() + 6) % 7, "day");
  const weeks: dayjs.Dayjs[][] = [];
  let cur = firstMon;
  while (cur.isBefore(lastDay) || cur.isSame(lastDay, "day")) {
    weeks.push(Array.from({ length: 5 }, (_, i) => cur.add(i, "day")));
    cur = cur.add(7, "day");
  }
  return weeks;
}

function MonthlyCalendarView({
  month,
  events,
  todayStr,
}: {
  month: dayjs.Dayjs;
  events: CalendarEvent[];
  todayStr: string;
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
            return (
              <div key={dateStr} className="flex flex-col pt-[10px] min-w-0">
                {isCurrentMonth && (
                  <>
                    <div className="flex justify-center mb-[6px]">
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
                    {dayEvents.map((event, i) => (
                      <div
                        key={i}
                        className="flex items-center rounded-[5px] overflow-hidden h-[17px] mb-[2px] mr-[4px]"
                        style={{ backgroundColor: EVENT_COLORS[event.type].bg }}
                      >
                        <div
                          className="w-[2px] h-[11px] mx-[3px] shrink-0 rounded-[1px]"
                          style={{
                            backgroundColor: EVENT_COLORS[event.type].bar,
                          }}
                        />
                        <span
                          className="text-[10px] font-medium flex-1 min-w-0"
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

function computeDDay(subscriptionEnd: string): {
  label: string;
  isEnded: boolean;
} {
  const diff = dayjs(subscriptionEnd)
    .startOf("day")
    .diff(dayjs().startOf("day"), "day");
  if (diff < 0) return { label: "", isEnded: true };
  if (diff === 0) return { label: "D-Day", isEnded: false };
  return { label: `D-${diff}`, isEnded: false };
}

function ActiveIpoCard({
  ipo,
  onClick,
  isWishlisted,
  onWishlistToggle,
}: {
  ipo: Ipo;
  onClick: () => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
}) {
  const today = dayjs().startOf("day");
  const isUpcoming = today.isBefore(
    dayjs(ipo.subscription_start).startOf("day"),
  );
  const { label: dDayLabel } = computeDDay(
    isUpcoming ? ipo.subscription_start : ipo.subscription_end,
  );
  const abbr = getAbbr(ipo.company);

  return (
    <button
      onClick={onClick}
      className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[22px] text-left transition-all duration-75 active:scale-[0.97] active:bg-[#F2F3F5] select-none"
    >
      <div className="flex items-center justify-between mb-[13px]">
        <div className="flex items-center gap-[18px]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black flex-shrink-0"
            style={{ backgroundColor: ipo.logo_color }}
          >
            {abbr}
          </div>
          <div className="translate-y-[1px]">
            <p className="text-[15px] font-bold text-[#111827] leading-[17.5px]">
              {ipo.company}
            </p>
            <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">
              {ipo.ticker}
            </p>
          </div>
        </div>
        <img
          src={isUpcoming ? "/icons/IPO_upcoming.svg" : "/icons/IPO_ready.svg"}
          width={50}
          height={17}
          alt={isUpcoming ? "청약예정" : "청약가능"}
          className="absolute top-[17.5px] right-[17px] translate-x-[3px]"
        />
        {!isUpcoming && (
          <span className="absolute top-[39px] right-[17px] text-[11px] font-bold text-[#CA3D40]">
            {dDayLabel}
          </span>
        )}
      </div>
      <div className="pl-[58px] space-y-[8px]">
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">
            공모(예정)가
          </span>
          <span className="ml-[11px] text-[13px] font-semibold text-[#111827]">
            {formatPrice(ipo.price)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">
            청약 기간
          </span>
          <span className="ml-[11px] text-[13px] font-medium text-[#7F858F]">
            {formatPeriod(ipo.subscription_start, ipo.subscription_end)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">
            상장(예정)일
          </span>
          <span className="ml-[11px] text-[13px] font-medium text-[#7F858F]">
            {dayjs(ipo.listing_date).format("YYYY.MM.DD")}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWishlistToggle();
        }}
        className="absolute bottom-[22px] right-[17px]"
      >
        <HeartIcon isActive={isWishlisted} />
      </button>
    </button>
  );
}

function ClosedIpoCard({
  ipo,
  onClick,
  isWishlisted,
  onWishlistToggle,
}: {
  ipo: Ipo;
  onClick: () => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
}) {
  const abbr = getAbbr(ipo.company);
  const isPositive = (ipo.listing_change_pct ?? 0) >= 0;
  const change =
    ipo.current_price != null && ipo.price_confirmed != null
      ? Math.abs(ipo.current_price - ipo.price_confirmed)
      : null;

  return (
    <button
      onClick={onClick}
      className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[30px] text-left transition-all duration-75 active:scale-[0.97] active:bg-[#F2F3F5] select-none"
    >
      <img
        src="/icons/IPO_end.svg"
        width={50}
        height={17}
        alt="청약종료"
        className="absolute top-[17.5px] right-[17px] translate-x-[3px]"
      />
      <div className="flex items-center mb-[13px]">
        <div className="flex items-center gap-[18px]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black flex-shrink-0"
            style={{ backgroundColor: ipo.logo_color }}
          >
            {abbr}
          </div>
          <div className="translate-y-[1px]">
            <p className="text-[15px] font-bold text-[#111827] leading-[17.5px]">
              {ipo.company}
            </p>
            <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">
              {ipo.ticker}
            </p>
          </div>
        </div>
      </div>
      <div className="pl-[58px] space-y-[8px]">
        <div className="flex gap-[30px] mb-[18px]">
          <div>
            <p className="text-[12px] font-medium text-[#7F858F] mb-[4px]">
              공모가(확정)
            </p>
            <p className="text-[13px] font-semibold text-[#111827]">
              {ipo.price_confirmed != null
                ? formatPrice(ipo.price_confirmed)
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#7F858F] mb-[4px]">
              현재가
            </p>
            <p className="text-[13px] font-semibold text-[#111827]">
              {ipo.current_price != null ? formatPrice(ipo.current_price) : "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">
            상장일
          </span>
          <span className="ml-[7px] text-[13px] font-medium text-[#7F858F]">
            {dayjs(ipo.listing_date).format("YYYY.MM.DD")}
          </span>
        </div>
        <div className="flex items-center !mt-[6px]">
          <span className="w-[64px] shrink-0 text-[12px] font-medium text-[#7F858F]">
            상장일 대비
          </span>
          {change != null && ipo.listing_change_pct != null ? (
            <span
              className={cn(
                "ml-[7px] text-[13px] font-medium",
                isPositive ? "text-[#CA3D40]" : "text-down",
              )}
            >
              {ipo.current_price!.toFixed(2)}{" "}
              <span className="text-[9px]">{isPositive ? "▲" : "▼"}</span>
              {change.toFixed(2)}({ipo.listing_change_pct.toFixed(2)}%)
            </span>
          ) : (
            <span className="ml-[7px] text-[13px] font-medium text-[#7F858F]">
              -
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWishlistToggle();
        }}
        className="absolute bottom-[22px] right-[17px]"
      >
        <HeartIcon isActive={isWishlisted} />
      </button>
    </button>
  );
}

function IpoCard({
  ipo,
  onClick,
  isWishlisted,
  onWishlistToggle,
}: {
  ipo: Ipo;
  onClick: () => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
}) {
  const isClosed = dayjs()
    .startOf("day")
    .isAfter(dayjs(ipo.subscription_end).startOf("day"));
  if (isClosed) {
    return (
      <ClosedIpoCard
        ipo={ipo}
        onClick={onClick}
        isWishlisted={isWishlisted}
        onWishlistToggle={onWishlistToggle}
      />
    );
  }
  return (
    <ActiveIpoCard
      ipo={ipo}
      onClick={onClick}
      isWishlisted={isWishlisted}
      onWishlistToggle={onWishlistToggle}
    />
  );
}

export function IpoCalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<Tab>(() => {
    const stateTab = (location.state as { tab?: string } | null)?.tab;
    return stateTab === "청약 일정" || stateTab === "청약내역/취소" ? stateTab : "청약 일정";
  });
  const [bottomFilter, setBottomFilter] = useState<BottomFilter>("전체");
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(
    () => new Set(IPOS.filter((ipo) => ipo.is_favorite).map((ipo) => ipo.id)),
  );
  const [calendarView, setCalendarView] = useState<CalendarView>("weekly");
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));

  const dateSectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthlyContainerRef = useRef<HTMLDivElement>(null);
  const monthlyHeaderRef = useRef<HTMLDivElement>(null);
  const currentMonthSectionRef = useRef<HTMLDivElement | null>(null);
  const todayMonthRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number>(0);

  const scrollToDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const date = dayjs(dateStr);
    changeWeekRef.current(date.subtract((date.day() + 6) % 7, "day"));
    requestAnimationFrame(() => {
      const el = dateSectionRefs.current.get(dateStr);
      const container = scrollContainerRef.current;
      if (el && container) {
        const elTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTop += elTop - containerTop - DATE_SCROLL_TOP_PADDING;
      }
    });
  };

  const weekContainerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const isSwipingRef = useRef(false);
  const touchStartY = useRef<number>(0);
  const swipeDirectionRef = useRef<"horizontal" | "vertical" | null>(null);

  const handleWeekTouchStart = (e: React.TouchEvent) => {
    if (snapping) return;
    isSwipingRef.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeDirectionRef.current = null;
  };

  const handleWeekTouchMove = (e: React.TouchEvent) => {
    if (snapping) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (
      swipeDirectionRef.current === null &&
      (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)
    ) {
      swipeDirectionRef.current =
        Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (swipeDirectionRef.current === "horizontal") {
      setDragOffset(deltaX);
    }
  };

  const handleWeekTouchEnd = (e: React.TouchEvent) => {
    if (snapping) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (swipeDirectionRef.current === "vertical") {
      isSwipingRef.current = false;
      if (deltaY > 50) {
        setCalendarView("monthly");
        setCurrentMonth(displayWeekStart.startOf("month"));
      }
      return;
    }
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const width = weekContainerRef.current?.offsetWidth ?? 375;
    if (Math.abs(delta) < 50) {
      setSnapping(true);
      setDragOffset(0);
      setTimeout(() => {
        setSnapping(false);
        isSwipingRef.current = false;
      }, WEEK_SLIDE_DURATION_MS);
      return;
    }
    const dir = delta < 0 ? "left" : "right";
    setSnapping(true);
    setDragOffset(dir === "left" ? -width : width);
    setTimeout(() => {
      setDisplayWeekStart((prev) =>
        dir === "left" ? prev.add(7, "day") : prev.subtract(7, "day"),
      );
      setDragOffset(0);
      setSnapping(false);
      isSwipingRef.current = false;
    }, WEEK_SLIDE_DURATION_MS);
  };

  const toggleWishlist = (id: number) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dow = today.day();
  const monday = today.subtract((dow + 6) % 7, "day");
  const [displayWeekStart, setDisplayWeekStart] = useState(monday);

  const animIdRef = useRef(0);
  const changeWeekRef = useRef<(newWeek: dayjs.Dayjs) => void>(() => {});
  changeWeekRef.current = (newWeek: dayjs.Dayjs) => {
    if (newWeek.isSame(displayWeekStart, "day")) return;
    const dir = newWeek.isAfter(displayWeekStart) ? "left" : "right";
    const width = weekContainerRef.current?.offsetWidth ?? 375;
    const startOffset = dir === "left" ? width : -width;
    const animId = ++animIdRef.current;
    setSnapping(false);
    setDragOffset(startOffset);
    setDisplayWeekStart(newWeek);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (animIdRef.current !== animId) return;
        setSnapping(true);
        setDragOffset(0);
        setTimeout(() => {
          if (animIdRef.current !== animId) return;
          setSnapping(false);
        }, WEEK_SLIDE_DURATION_MS);
      }),
    );
  };

  const filteredIpos =
    bottomFilter === "전체"
      ? IPOS
      : IPOS.filter((ipo) => wishlistedIds.has(ipo.id));
  const calendarEvents = deriveCalendarEvents(filteredIpos);

  const scrollToTodayMonth = () => {
    const container = monthlyContainerRef.current;
    const section = todayMonthRef.current;
    if (!container || !section) return;
    const headerHeight = monthlyHeaderRef.current?.offsetHeight ?? 0;
    container.scrollTop +=
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      headerHeight -
      30;
  };

  const allIpoDates = filteredIpos.map((ipo) => ipo.subscription_start);
  const uniqueDates =
    bottomFilter === "관심"
      ? Array.from(new Set(allIpoDates)).sort()
      : Array.from(new Set([todayStr, ...allIpoDates])).sort();

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = dateSectionRefs.current.get(todayStr);
      const container = scrollContainerRef.current;
      if (el && container) {
        const elTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTop += elTop - containerTop - DATE_SCROLL_TOP_PADDING;
      }
    });
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const HEADER_OFFSET = 160;
        let closestDate: string | null = null;
        let closestDist = Infinity;
        dateSectionRefs.current.forEach((el, dateStr) => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > HEADER_OFFSET) {
            const dist = Math.abs(rect.top - HEADER_OFFSET);
            if (dist < closestDist) {
              closestDist = dist;
              closestDate = dateStr;
            }
          }
        });
        if (closestDate) {
          const d = dayjs(closestDate);
          const newWeekStart = d.subtract((d.day() + 6) % 7, "day");
          changeWeekRef.current(newWeekStart);
          setSelectedDate(closestDate);
        }
      });
    };
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [calendarView]);

  useEffect(() => {
    if (calendarView !== "monthly") return;
    requestAnimationFrame(() => {
      const container = monthlyContainerRef.current;
      const section = currentMonthSectionRef.current;
      if (container && section) {
        const headerHeight = monthlyHeaderRef.current?.offsetHeight ?? 0;
        container.scrollTop +=
          section.getBoundingClientRect().top -
          container.getBoundingClientRect().top -
          headerHeight -
          30;
      }
    });
  }, [calendarView]);

  return (
    <div className="h-dvh flex flex-col bg-[#F6F6F9]">
      <header className="bg-white flex items-center justify-between px-4 h-[56px] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[18px] font-bold text-[#111111]">
            IPO 캘린더
          </span>
          <button onClick={() => navigate("/ipo/guide")}>
            <img src="/icons/question.svg" width={22} height={22} alt="" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")}>
            <img src="/icons/Bell.svg" width={25} height={25} alt="" />
          </button>
          <button>
            <img src="/icons/search.svg" width={19} height={19} alt="" />
          </button>
        </div>
      </header>

      <div className="flex bg-white relative z-[2] shrink-0">
        {(["청약 일정", "청약내역/취소"] as Tab[]).map((t) => (
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
          <div
            ref={monthlyContainerRef}
            className={cn(
              "relative z-[1] bg-white px-4 pb-[17px] rounded-b-[20px] shadow-[0_1px_10px_rgba(0,0,0,0.2)]",
              calendarView === "monthly"
                ? "flex-1 overflow-y-auto scrollbar-hide"
                : "shrink-0 pt-[9px]",
            )}
            style={
              calendarView === "monthly"
                ? { scrollbarWidth: "none" }
                : undefined
            }
          >
            {calendarView === "weekly" ? (
              <>
                <div className="flex justify-end items-center gap-4 mb-[17px] pr-1">
                  <button
                    className="text-[12px] font-medium text-[#1A1A1A]"
                    onClick={() => {
                      scrollToDate(todayStr);
                    }}
                  >
                    오늘
                  </button>
                  <span className="w-px h-[14px] bg-[#D9DBE0]" />
                  <button
                    className="text-[12px] font-medium text-[#1A1A1A]"
                    onClick={() => {
                      setCalendarView("monthly");
                      setCurrentMonth(dayjs().startOf("month"));
                    }}
                  >
                    월별보기
                  </button>
                </div>
                <div ref={weekContainerRef} className="overflow-hidden">
                  <div
                    style={{
                      display: "flex",
                      width: "300%",
                      transform: `translateX(calc(-33.333% + ${dragOffset}px))`,
                      transition: snapping
                        ? `transform ${WEEK_SLIDE_DURATION_MS}ms ease-out`
                        : "none",
                      willChange: "transform",
                    }}
                    onTouchStart={handleWeekTouchStart}
                    onTouchMove={handleWeekTouchMove}
                    onTouchEnd={handleWeekTouchEnd}
                  >
                    {[
                      displayWeekStart.subtract(7, "day"),
                      displayWeekStart,
                      displayWeekStart.add(7, "day"),
                    ].map((ws, wi) => (
                      <div
                        key={wi}
                        className="grid grid-cols-6"
                        style={{ width: "33.333%" }}
                      >
                        {Array.from({ length: 6 }, (_, i) =>
                          ws.add(i, "day"),
                        ).map((day) => {
                          const dateStr = day.format("YYYY-MM-DD");
                          const isToday = dateStr === todayStr;
                          const isSelected = dateStr === selectedDate;
                          const isSaturday = day.day() === 6;
                          const hasEvents = filteredIpos.some(
                            (ipo) => ipo.subscription_start === dateStr,
                          );
                          return (
                            <button
                              key={dateStr}
                              className="flex flex-col items-center"
                              onClick={() =>
                                (hasEvents || isToday) && scrollToDate(dateStr)
                              }
                              disabled={!hasEvents && !isToday}
                            >
                              <span className="text-[12px] leading-[15px] text-[#9AA0AB]">
                                {isToday ? "오늘" : DAY_NAMES[day.day()]}
                              </span>
                              <div
                                className={cn(
                                  "mt-[10px] w-[33px] h-[33px] flex items-center justify-center rounded-[6px] text-[16px] font-semibold",
                                  isSelected
                                    ? "bg-[#6B7280] text-white"
                                    : isSaturday || !hasEvents
                                      ? "text-[#C8CBD2]"
                                      : "text-[#1A1A1A]",
                                )}
                              >
                                {day.date()}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  ref={monthlyHeaderRef}
                  className="sticky top-0 bg-white z-10 pt-[9px] pb-[9px]"
                >
                  <div className="flex items-center justify-between pr-1">
                    <div className="flex items-center gap-[10px] mt-[2px]">
                      {(
                        [
                          ["청약시작", "#E2468B"],
                          ["청약마감", "#3660AC"],
                          ["상장(예정)일", "#019989"],
                        ] as const
                      ).map(([label, color]) => (
                        <div
                          key={label}
                          className="flex items-center gap-[4px]"
                        >
                          <div
                            className="w-[5px] h-[5px] rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span
                            className="text-[10px] font-medium"
                            style={{ color }}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="text-[12px] font-medium text-[#1A1A1A]"
                        onClick={scrollToTodayMonth}
                      >
                        오늘
                      </button>
                      <span className="w-px h-[14px] bg-[#D9DBE0]" />
                      <button
                        className="text-[12px] font-medium text-[#1A1A1A]"
                        onClick={() => setCalendarView("weekly")}
                      >
                        주별보기
                      </button>
                    </div>
                  </div>
                </div>
                {Array.from({ length: 10 }, (_, i) =>
                  currentMonth.subtract(3 - i, "month"),
                ).map((month) => {
                  const isCurrentMonthSection = month.isSame(
                    currentMonth,
                    "month",
                  );
                  const isTodayMonth = month.isSame(
                    dayjs().startOf("month"),
                    "month",
                  );
                  return (
                    <div
                      key={month.format("YYYY-MM")}
                      ref={(el) => {
                        if (isCurrentMonthSection)
                          currentMonthSectionRef.current = el;
                        if (isTodayMonth) todayMonthRef.current = el;
                      }}
                    >
                      <MonthlyCalendarView
                        month={month}
                        events={calendarEvents}
                        todayStr={todayStr}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {calendarView !== "monthly" && (
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overscroll-none px-4 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {bottomFilter === "관심" && filteredIpos.length === 0 && (
                <div className="flex flex-col items-center pt-[160px]">
                  <div className="w-[64px] h-[64px] rounded-full bg-[#F0F1F4] flex items-center justify-center">
                    <img src="/icons/heart.svg" width={26} height={26} alt="" />
                  </div>
                  <span className="mt-[18px] text-[18px] font-bold text-[#001936]/[0.55]">
                    관심 IPO를 등록해주세요
                  </span>
                </div>
              )}
              {uniqueDates.map((dateStr, idx) => {
                const date = dayjs(dateStr);
                const isToday = dateStr === todayStr;
                const dayIpos = filteredIpos.filter(
                  (ipo) => ipo.subscription_start === dateStr,
                );
                const prevDate = idx > 0 ? dayjs(uniqueDates[idx - 1]) : null;
                const showWeekDivider =
                  !prevDate ||
                  getWeekOfMonth(prevDate) !== getWeekOfMonth(date) ||
                  prevDate.month() !== date.month();
                const nextDate =
                  idx < uniqueDates.length - 1
                    ? dayjs(uniqueDates[idx + 1])
                    : null;
                const hasNextDateInSameWeek =
                  nextDate != null &&
                  getWeekOfMonth(nextDate) === getWeekOfMonth(date) &&
                  nextDate.month() === date.month();

                return (
                  <div
                    key={dateStr}
                    className={cn(!showWeekDivider && idx > 0 && "mt-[24px]")}
                    ref={(el) => {
                      if (el) dateSectionRefs.current.set(dateStr, el);
                      else dateSectionRefs.current.delete(dateStr);
                    }}
                  >
                    {showWeekDivider && (
                      <WeekDivider
                        label={`${date.month() + 1}월 ${getWeekOfMonth(date)}주차`}
                      />
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-3 pl-[6px]">
                        <span className="text-[18px] font-bold text-[#3A3D45]">
                          {date.date()}일
                        </span>
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
                        bottomFilter === "전체" && (
                          <div
                            className={cn(
                              "flex items-center gap-3 ml-[7px] mt-[16px]",
                              hasNextDateInSameWeek ? "mb-[28px]" : "mb-4",
                            )}
                          >
                            <div className="w-11 h-11 rounded-full bg-[#F0F1F4] flex items-center justify-center">
                              <img
                                src="/icons/docs.svg"
                                width={22}
                                height={22}
                                alt=""
                              />
                            </div>
                            <span className="text-[17px] font-bold text-[#3A3D45] ml-1">
                              소식이 없어요
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="space-y-[18px] mb-4">
                          {dayIpos.map((ipo) => (
                            <IpoCard
                              key={ipo.id}
                              ipo={ipo}
                              onClick={() => navigate(`/ipo/${ipo.id}`)}
                              isWishlisted={wishlistedIds.has(ipo.id)}
                              onWishlistToggle={() => toggleWishlist(ipo.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="h-[335px]" />
            </div>
          )}
        </>
      )}

      {tab === "청약내역/취소" && <SubscriptionHistory />}

      {tab === "청약 일정" && (
        <div className="fixed bottom-[91px] right-4 z-20">
          <div className="flex bg-[#EFEFEF] rounded-[15px] p-0.5 shadow-[1px_1px_10px_0px_rgba(0,0,0,0.25)]">
            {(["전체", "관심"] as BottomFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setBottomFilter(f)}
                className={cn(
                  "px-5 py-1.5 rounded-[15px] text-[13px] transition-colors",
                  bottomFilter === f
                    ? "bg-white text-black font-semibold shadow-[0_2px_2px_rgba(0,0,0,0.05)]"
                    : "text-[#999EA4] font-medium",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
