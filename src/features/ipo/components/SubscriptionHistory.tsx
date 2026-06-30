import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IpoStockHeader } from "@/features/ipo/components/IpoStockHeader";
import dayjs, { Dayjs } from "dayjs";
import {
  useSubscriptionList,
  useCancelSubscription,
  useRevealScratch,
} from "@/features/ipo/hooks/useSubscriptions";
import { useIpoList } from "@/features/ipo/hooks/useIpo";
import {
  subscriptionResultQueryKey,
  fetchSubscriptionResult,
} from "@/features/ipo/hooks/useSubscriptionResultDetail";
import type { SubscriptionRes } from "@/features/ipo/api/subscriptionApi";
import type { AllocationResultDetail } from "@/features/ipo/types/allocation";
import { generateLogoColor } from "@/features/ipo/utils/ipoUtils";
import { useHomeAssets } from "@/features/home/hooks/useHomeAssets";
import { useReturnPlans } from "@/features/return-plan/hooks/useReturnPlans";

type StatusType = "청약신청" | "취소완료" | "배정완료" | "입고완료";
type PeriodMode = "월별" | "기간별";
type PeriodPreset = "1주일" | "1개월" | "3개월" | "6개월" | "직접설정";
type TypeFilter = "전체" | "청약신청/취소완료" | "배정완료" | "입고완료";

const STATUS_BADGE: Record<StatusType, string> = {
  청약신청: "border-primary text-primary",
  취소완료: "border-border text-text-secondary",
  배정완료: "border-primary text-primary",
  입고완료: "border-up text-up",
};

const QUICK_PRESETS = ["1주일", "1개월", "3개월", "6개월"] as const;
const TYPE_FILTERS: TypeFilter[] = ["전체", "청약신청/취소완료", "배정완료", "입고완료"];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const ITEM_H = 44;
const DOW_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface FilterState {
  periodMode: PeriodMode;
  year: number;
  month: number;
  preset: PeriodPreset;
  rangeStart: Dayjs;
  rangeEnd: Dayjs;
  typeFilter: TypeFilter;
}

interface Subscription {
  id: number;
  company: string;
  ticker: string;
  logoUrl: string | null;
  logoColor: string;
  status: StatusType;
  amount: string;
  agencyDeposit: string;
  date: string;
  offeringPrice?: number;
  confirmedPrice?: number;
  listingDate?: string;
  currentPrice?: string;
  allocatedQty?: number;
  allocationResultState?: "pending" | "loading" | "ready" | "error";
  returnRate?: string;
  returnPositive?: boolean;
  canCancel: boolean;
}

// ─── 스크롤 피커 ──────────────────────────────────────────
function ScrollPicker({
  items,
  selectedIndex,
  onChange,
}: {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selectedIndex * ITEM_H;
  }, []); // eslint-disable-line

  const handleScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)),
      );
      el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
      onChangeRef.current(idx);
    }, 120);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="flex-1 overflow-y-scroll"
      style={{ height: ITEM_H * 3, scrollbarWidth: "none" }}
    >
      <div style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}>
        {items.map((item, i) => (
          <div
            key={item}
            style={{ height: ITEM_H }}
            className={cn(
              "flex items-center justify-center transition-all duration-150 select-none",
              i === selectedIndex
                ? "text-base font-bold text-text-primary"
                : "text-sm text-text-tertiary opacity-40",
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 복권 긁기 카드 ───────────────────────────────────────
const SCRATCH_SIZE = 220;

function ScratchCard({
  allocatedQty,
  logoColor,
  abbr,
  onFullyScratch,
}: {
  allocatedQty: number;
  logoColor: string;
  abbr: string;
  onFullyScratch: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const done = useRef(false);
  const cbRef = useRef(onFullyScratch);
  cbRef.current = onFullyScratch;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1B2B5E";
    ctx.fillRect(0, 0, SCRATCH_SIZE, SCRATCH_SIZE);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("여기를 긁어보세요", SCRATCH_SIZE / 2, SCRATCH_SIZE / 2);
  }, []);

  function scratchAt(clientX: number, clientY: number) {
    if (done.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (SCRATCH_SIZE / rect.width);
    const y = (clientY - rect.top) * (SCRATCH_SIZE / rect.height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // sample every 64 bytes (every 16th pixel) for performance
    const data = ctx.getImageData(0, 0, SCRATCH_SIZE, SCRATCH_SIZE).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 64) {
      if (data[i] < 128) cleared++;
    }
    if (cleared / (data.length / 64) > 0.65) {
      done.current = true;
      ctx.clearRect(0, 0, SCRATCH_SIZE, SCRATCH_SIZE);
      cbRef.current();
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-lg"
      style={{ width: SCRATCH_SIZE, height: SCRATCH_SIZE }}
    >
      {/* 공개 레이어 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, #fce4ec, #e3f2fd, #fffde7, #e8f5e9)",
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm"
          style={{ backgroundColor: logoColor }}
        >
          {abbr}
        </div>
        <p className="text-4xl font-bold" style={{ color: "#1B2B5E" }}>
          {allocatedQty}주
        </p>
      </div>

      {/* 긁기 캔버스 */}
      <canvas
        ref={canvasRef}
        width={SCRATCH_SIZE}
        height={SCRATCH_SIZE}
        className="absolute inset-0 touch-none"
        style={{ cursor: "crosshair" }}
        onMouseDown={(e) => {
          isDrawing.current = true;
          scratchAt(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (isDrawing.current) scratchAt(e.clientX, e.clientY);
        }}
        onMouseUp={() => {
          isDrawing.current = false;
        }}
        onMouseLeave={() => {
          isDrawing.current = false;
        }}
        onTouchStart={(e) => {
          isDrawing.current = true;
          scratchAt(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (isDrawing.current)
            scratchAt(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={() => {
          isDrawing.current = false;
        }}
      />
    </div>
  );
}

// ─── 축하 효과 ───────────────────────────────────────────
const CONFETTI_COLORS = [
  "#FF6B35",
  "#635BFF",
  "#FFB3C7",
  "#29A9F5",
  "#00C0A0",
  "#FF4B8B",
  "#FFD700",
  "#0922AC",
];

const CONFETTI_PARTICLES = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: Math.random() * 100,
  delay: Math.random() * 0.7,
  duration: 1.4 + Math.random() * 0.9,
  size: 7 + Math.random() * 7,
  isCircle: Math.random() > 0.5,
  drift: (Math.random() - 0.5) * 120,
}));

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      {CONFETTI_PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "3px",
            animationName: "confetti-fall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "ease-in",
            animationFillMode: "forwards",
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── 유틸 ────────────────────────────────────────────────

function getEffectiveRange(f: FilterState): { start: Dayjs; end: Dayjs } {
  if (f.periodMode === "월별") {
    const start = dayjs(`${f.year}-${String(f.month).padStart(2, "0")}-01`);
    return { start, end: start.endOf("month") };
  }
  if (f.preset === "직접설정") return { start: f.rangeStart, end: f.rangeEnd };
  const now = dayjs().startOf("day");
  const start =
    f.preset === "1주일"
      ? now.subtract(1, "week")
      : f.preset === "1개월"
        ? now.subtract(1, "month")
        : f.preset === "3개월"
          ? now.subtract(3, "month")
          : now.subtract(6, "month");
  return { start, end: now };
}

function getFilterLabel(f: FilterState): string {
  if (f.periodMode === "월별")
    return `${f.year}년 ${String(f.month).padStart(2, "0")}월`;
  if (f.preset === "직접설정")
    return `${f.rangeStart.format("YY.MM.DD")} ~ ${f.rangeEnd.format("YY.MM.DD")}`;
  return f.preset;
}

function getCalendarCells(month: Dayjs): (Dayjs | null)[] {
  const cells: (Dayjs | null)[] = Array(month.startOf("month").day()).fill(
    null,
  );
  for (let d = 1; d <= month.daysInMonth(); d++) cells.push(month.date(d));
  return cells;
}

// ─── API 데이터 → 화면 모델 매핑 ───────────────────────────
function deriveStatus(
  sub: SubscriptionRes,
  hasAllocationResult: boolean,
): StatusType {
  if (sub.subscriptionStatus === "CANCELLED") return "취소완료";
  // 입고완료(DEPOSITED) = 상장 후 주식이 계좌에 입고된 상태 → 입고완료
  if (sub.resultStatus === "DEPOSITED") return "입고완료";
  // 배정만 확정(COMPLETED)되고 아직 입고 전 → 배정완료
  if (sub.resultStatus === "COMPLETED") return "배정완료";
  if (sub.subscriptionStatus === "CONFIRMED") return "배정완료";
  if (hasAllocationResult) return "배정완료";
  return "청약신청";
}

function toSubscription(
  sub: SubscriptionRes,
  result: AllocationResultDetail | undefined,
  allocationResultState?: Subscription["allocationResultState"],
  ipoCurrentPrice: number | null = null,
): Subscription {
  const today = dayjs().startOf("day");
  const listingDayReached =
    sub.listingDate != null && !dayjs(sub.listingDate).isAfter(today, "day");
  const hasAllocationResult = sub.subscriptionResultId != null;
  const status = deriveStatus(sub, hasAllocationResult);
  const offeringPrice =
    sub.confirmedOfferPrice ??
    sub.offerPriceMax ??
    sub.offerPriceMin ??
    undefined;
  const confirmedPrice = sub.confirmedOfferPrice ?? offeringPrice;

  // 현재가/수익률은 입고완료에서만 의미가 있으므로 그 외 상태에서는 노출하지 않는다.
  // 입고완료일 때는 청약 일정과 동일하게 IPO 목록 현재가를 우선 사용하고, 없으면 배정 결과 현재가로 fallback.
  const effectiveCurrentPrice =
    status === "입고완료" ? (ipoCurrentPrice ?? result?.currentPrice ?? null) : null;

  let returnRate: string | undefined;
  let returnPositive: boolean | undefined;
  if (effectiveCurrentPrice != null && confirmedPrice) {
    const rate =
      ((effectiveCurrentPrice - confirmedPrice) / confirmedPrice) * 100;
    returnPositive = rate >= 0;
    returnRate = `${rate >= 0 ? "+" : ""}${rate.toFixed(1)}%`;
  }

  return {
    id: sub.subscriptionId,
    company: sub.companyName,
    ticker: sub.ticker,
    logoUrl: sub.logoUrl ?? null,
    logoColor: generateLogoColor(sub.ticker),
    status,
    amount: `${sub.currency} ${sub.subscriptionAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    agencyDeposit: `USD ${sub.subscriptionAgencyDeposit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    date: dayjs(sub.subscribedAt).format("YYYY.MM.DD"),
    offeringPrice,
    confirmedPrice,
    listingDate: sub.listingDate
      ? dayjs(sub.listingDate).format("YYYY.MM.DD")
      : undefined,
    currentPrice:
      effectiveCurrentPrice != null
        ? `USD ${effectiveCurrentPrice.toFixed(2)}`
        : undefined,
    allocatedQty: result ? (result.allocatedShares ?? 0) : undefined,
    allocationResultState:
      status === "배정완료" && allocationResultState == null
        ? "pending"
        : status === "입고완료" && allocationResultState == null
          ? "ready"
          : allocationResultState,
    returnRate,
    returnPositive,
    canCancel:
      sub.subscriptionStatus === "REQUESTED" &&
      !hasAllocationResult &&
      !listingDayReached &&
      (sub.subscriptionEndDate == null || dayjs().isBefore(dayjs(sub.subscriptionEndDate).hour(17).minute(0).second(0))),
  };
}

function InfoRow({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={cn(
          "w-24 flex-shrink-0",
          small ? "text-xs text-text-tertiary" : "text-sm text-text-secondary",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          small
            ? "text-xs text-text-tertiary"
            : "text-sm font-medium text-text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function getAbbr(company: string): string {
  const words = company.split(/(?=[A-Z])|[\s-]/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return company.substring(0, 2).toUpperCase();
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export function SubscriptionHistory() {
  const navigate = useNavigate();
  const today = dayjs().startOf("day");

  const { data: listData, isLoading: isListLoading } = useSubscriptionList();
  const { data: assets } = useHomeAssets();
  const { data: returnPlans = [] } = useReturnPlans();
  const reservedSubscriptionIds = new Set(returnPlans.map((p) => p.subscriptionId));
  const cancelSubscription = useCancelSubscription();
  const revealScratch = useRevealScratch();
  const rawSubscriptions = listData?.data.subscriptions ?? [];
  const accountNumberMasked = assets?.securities.accountNumberMasked ?? "-";

  // 청약 일정과 동일하게 IPO 목록에서 ticker → 현재가 매핑 (입고완료 현재가 출처 통일)
  const { data: ipoListRes } = useIpoList();
  const currentPriceByTicker = new Map(
    (ipoListRes?.data.ipos ?? []).map((ipo) => [ipo.ticker, ipo.currentPrice]),
  );

  const pendingItems = rawSubscriptions.filter(
    (s) =>
      s.subscriptionStatus !== "CANCELLED" && s.subscriptionResultId != null,
  );

  const resultQueries = useQueries({
    queries: pendingItems.map((s) => ({
      queryKey: subscriptionResultQueryKey(s.subscriptionResultId!),
      queryFn: () => fetchSubscriptionResult(s.subscriptionResultId!),
    })),
  });

  const resultMap = new Map<number, AllocationResultDetail>();
  const resultStateMap = new Map<
    number,
    Subscription["allocationResultState"]
  >();
  pendingItems.forEach((s, i) => {
    const query = resultQueries[i];
    const data = query?.data;
    if (data) resultMap.set(s.subscriptionId, data);
    resultStateMap.set(
      s.subscriptionId,
      query?.isError ? "error" : data ? "ready" : "loading",
    );
  });

  useEffect(() => {
    const revealedIds = rawSubscriptions
      .filter((s) => s.scratchRevealed)
      .map((s) => s.subscriptionId);
    // 서버 데이터를 낙관적 상태에 머지 (PATCH 반영 전 stale 데이터로 덮이는 레이스 방지)
    setConfirmedIds((prev) => new Set([...prev, ...revealedIds]));
  }, [listData]);

  const SUBSCRIPTIONS = rawSubscriptions.map((sub) =>
    toSubscription(
      sub,
      resultMap.get(sub.subscriptionId),
      resultStateMap.get(sub.subscriptionId),
      currentPriceByTicker.get(sub.ticker) ?? null,
    ),
  );

  const YEARS = Array.from(
    { length: today.year() - 2020 + 2 },
    (_, i) => 2020 + i,
  );

  const defaultFilter: FilterState = {
    periodMode: "기간별",
    year: today.year(),
    month: today.month() + 1,
    preset: "3개월",
    rangeStart: today.subtract(3, "month"),
    rangeEnd: today,
    typeFilter: "전체",
  };

  const [applied, setApplied] = useState<FilterState>(defaultFilter);
  const [draft, setDraft] = useState<FilterState>(defaultFilter);
  const [showSheet, setShowSheet] = useState(false);

  // 월별 피커
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.year());
  const [pickerMonth, setPickerMonth] = useState(today.month() + 1);

  // 날짜 범위 피커
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [pickerStart, setPickerStart] = useState<Dayjs | null>(null);
  const [pickerEnd, setPickerEnd] = useState<Dayjs | null>(null);
  const [pickingField, setPickingField] = useState<"start" | "end">("start");
  const [rangePickerMonth, setRangePickerMonth] = useState(
    today.startOf("month"),
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('subscription-history-scroll');
    if (saved && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = parseInt(saved, 10);
      });
      sessionStorage.removeItem('subscription-history-scroll');
    }
  }, []);

  function navigateToDetail(id: number) {
    if (scrollContainerRef.current) {
      sessionStorage.setItem('subscription-history-scroll', String(scrollContainerRef.current.scrollTop));
    }
    navigate(`/ipo/${id}/result`);
  }

  // 취소 시트
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const cancelItem = SUBSCRIPTIONS.find((s) => s.id === cancelTarget);

  // 배정결과 스크래치
  const [scratchTarget, setScratchTarget] = useState<number | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(() => new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const scratchItem = SUBSCRIPTIONS.find((s) => s.id === scratchTarget);

  function openSheet() {
    setDraft(applied);
    setShowSheet(true);
  }

  function applyFilter() {
    setApplied(draft);
    setShowSheet(false);
  }

  function openMonthPicker() {
    setPickerYear(draft.year);
    setPickerMonth(draft.month);
    setShowMonthPicker(true);
  }

  function confirmMonthPicker() {
    setDraft((d) => ({ ...d, year: pickerYear, month: pickerMonth }));
    setShowMonthPicker(false);
  }

  function openRangePicker(startFrom: "start" | "end" = "start") {
    setPickerStart(draft.rangeStart);
    setPickerEnd(draft.rangeEnd);
    setRangePickerMonth(
      startFrom === "start"
        ? draft.rangeStart.startOf("month")
        : draft.rangeEnd.startOf("month"),
    );
    setPickingField(startFrom);
    setShowRangePicker(true);
  }

  function handleRangeCalendarTap(day: Dayjs) {
    if (day.isAfter(today, "day")) return;
    if (pickingField === "start") {
      setPickerStart(day);
      setPickerEnd(null);
      setPickingField("end");
    } else {
      if (day.isBefore(pickerStart!, "day")) {
        setPickerStart(day);
        setPickerEnd(null);
        setPickingField("end");
      } else {
        setPickerEnd(day);
      }
    }
  }

  function confirmRangePicker() {
    const start = pickerStart ?? today;
    const end = pickerEnd ?? start;
    setDraft((d) => ({
      ...d,
      rangeStart: start,
      rangeEnd: end,
      preset: "직접설정",
    }));
    setShowRangePicker(false);
  }

  function triggerConfetti() {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }

  async function confirmScratch() {
    if (scratchTarget == null) { setScratchTarget(null); return; }
    const id = scratchTarget;
    setConfirmedIds((prev) => new Set([...prev, id]));
    setScratchTarget(null);
    try {
      await revealScratch.mutateAsync(id);
    } catch { /* 실패해도 navigate */ }
    navigateToDetail(id);
  }

  const { start: rangeStart, end: rangeEnd } = getEffectiveRange(applied);
  const draftRange = getEffectiveRange(draft);

  const filtered = SUBSCRIPTIONS.filter((sub) => {
    const date = dayjs(sub.date.replace(/\./g, "-"));
    const dateOk =
      (date.isSame(rangeStart) || date.isAfter(rangeStart)) &&
      (date.isSame(rangeEnd) || date.isBefore(rangeEnd));
    const typeOk =
      applied.typeFilter === "전체" ||
      (applied.typeFilter === "청약신청/취소완료"
        ? sub.status === "청약신청" || sub.status === "취소완료"
        : sub.status === applied.typeFilter);
    return dateOk && typeOk;
  });

  const rangePickerCells = getCalendarCells(rangePickerMonth);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F6F9]">
      {/* 계좌 정보 */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm text-text-secondary">
          {accountNumberMasked}
        </span>
      </div>

      {/* 조회 조건 버튼 */}
      <div className="px-4 py-3 shrink-0">
        <button
          onClick={openSheet}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-primary"
        >
          <SlidersHorizontal size={15} className="text-text-secondary" />
          <span>{getFilterLabel(applied)}</span>
          {applied.typeFilter !== "전체" && (
            <span className="text-text-secondary font-normal">
              · {applied.typeFilter}
            </span>
          )}
          <ChevronDown size={15} />
        </button>
      </div>

      {/* 카드 목록 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isRevealed = confirmedIds.has(sub.id) || reservedSubscriptionIds.has(sub.id);
            const allocationQtyText =
              sub.allocationResultState === "error"
                ? "조회 실패"
                : sub.allocationResultState === "pending"
                  ? "결과 준비 중..."
                  : sub.allocationResultState !== "ready"
                    ? "불러오는 중..."
                    : isRevealed
                      ? `${sub.allocatedQty ?? 0}주`
                      : "??";
            return (
              <div
                key={sub.id}
                className="bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[22px]"
              >
                <div>
                  <div className="mb-[13px]">
                    <IpoStockHeader
                      avatarText={getAbbr(sub.company)}
                      avatarColor={sub.logoColor}
                      logoUrl={sub.logoUrl}
                      name={sub.company}
                      ticker={sub.ticker}
                      status={sub.status}
                      statusClassName={STATUS_BADGE[sub.status]}
                      secondaryText={sub.returnRate}
                      secondaryClassName="text-[#2563EB]"
                      align="start"
                      size="sm"
                    />
                  </div>

                  <div className="space-y-2 pl-[52px]">
                    {sub.status === "입고완료" ? (
                      <>
                        <InfoRow label="청약신청금액" value={sub.amount} />
                        {sub.offeringPrice != null && (
                          <InfoRow
                            label="공모가"
                            value={`USD ${sub.offeringPrice.toFixed(2)}`}
                          />
                        )}
                        <InfoRow label="현재가" value={sub.currentPrice ?? "-"} />
                        <InfoRow
                          label="배정주식 수"
                          value={`${sub.allocatedQty ?? 0}주`}
                        />
                      </>
                    ) : (
                      <>
                        <InfoRow label="청약신청금액" value={sub.amount} />
                        <InfoRow
                          label="청약대행증거금"
                          value={sub.agencyDeposit}
                          small
                        />
                        {sub.status === "배정완료" ? (
                          <>
                            <InfoRow label="청약일자" value={sub.date} />
                            {sub.offeringPrice != null && (
                              <InfoRow
                                label="공모가"
                                value={`USD ${sub.offeringPrice.toFixed(2)}`}
                              />
                            )}
                            <InfoRow
                              label="배정주식 수"
                              value={allocationQtyText}
                            />
                          </>
                        ) : (
                          <>
                            <InfoRow label="청약일자" value={sub.date} />
                            {sub.offeringPrice != null && (
                              <InfoRow
                                label="공모(예정)가"
                                value={`USD ${sub.offeringPrice.toFixed(2)}`}
                              />
                            )}
                            {sub.listingDate && (
                              <InfoRow
                                label="상장(예정)일"
                                value={sub.listingDate}
                              />
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 버튼 영역 */}
                {sub.status === "청약신청" && sub.canCancel && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setCancelTarget(sub.id)}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-[#F0F1F4]"
                    >
                      취소
                    </button>
                  </div>
                )}

                {sub.status === "배정완료" && (
                  <div className="mt-4 flex gap-2">
                    {!isRevealed ? (
                      <button
                        onClick={() => setScratchTarget(sub.id)}
                        disabled={sub.allocationResultState !== "ready"}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-primary disabled:opacity-50"
                      >
                        {sub.allocationResultState === "error"
                          ? "결과 조회 실패"
                          : sub.allocationResultState === "pending"
                            ? "결과 준비 중..."
                            : sub.allocationResultState === "ready"
                              ? "배정결과 보기"
                              : "결과 불러오는 중..."}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigateToDetail(sub.id)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-[#F0F1F4]"
                      >
                        {reservedSubscriptionIds.has(sub.id) ? "예약 상세보기" : "상세보기"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isListLoading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-text-tertiary">불러오는 중...</p>
            </div>
          )}

          {!isListLoading && filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-text-tertiary">
                해당 조건에 내역이 없습니다.
              </p>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary px-1 mt-3 mb-6">
            <Info size={13} />
            <span>청약 취소는 청약 기간 중에만 가능합니다.</span>
          </div>
        )}
      </div>

      {/* ── 조회 조건 설정 시트 ── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          showSheet ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setShowSheet(false)}
      />
      <div
        aria-hidden={!showSheet}
        {...(!showSheet ? { inert: "" } : {})}
        className={cn(
          "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-2xl z-[60] transition-transform duration-300 ease-out h-auto max-h-[70dvh] flex flex-col",
          showSheet ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex-1 flex flex-col overflow-hidden">
          <p className="text-base font-bold text-text-primary mb-5 shrink-0">
            조회 조건 설정
          </p>

          <div className="flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-text-secondary mb-2">
              조회기간
            </p>

            <div className="flex bg-[#F0F1F4] rounded-xl p-0.5 mb-4">
              {(["월별", "기간별"] as PeriodMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDraft((d) => ({ ...d, periodMode: mode }))}
                  className={cn(
                    "flex-1 py-2 rounded-[10px] text-sm font-semibold transition-colors",
                    draft.periodMode === mode
                      ? "bg-white text-text-primary shadow-sm"
                      : "text-text-secondary",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {draft.periodMode === "월별" && (
              <button
                onClick={openMonthPicker}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-white mb-5"
              >
                <span className="text-sm font-semibold text-text-primary">
                  {draft.year}년 {String(draft.month).padStart(2, "0")}월
                </span>
                <ChevronDown size={16} className="text-text-secondary" />
              </button>
            )}

            {draft.periodMode === "기간별" && (
              <div className="mb-5">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {QUICK_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setDraft((d) => ({ ...d, preset: p }))}
                      className={cn(
                        "py-1.5 rounded-xl text-sm font-semibold border transition-colors",
                        draft.preset === p
                          ? "border-primary text-primary"
                          : "border-border text-text-secondary bg-white",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setDraft((d) => ({ ...d, preset: "직접설정" }))
                  }
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors mb-4",
                    draft.preset === "직접설정"
                      ? "border-primary text-primary"
                      : "border-border text-text-secondary bg-white",
                  )}
                >
                  직접설정
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary flex-1 text-center">
                    {draftRange.start.format("YYYY.MM.DD")}
                  </span>
                  <button
                    onClick={() => openRangePicker("start")}
                    className="p-1"
                  >
                    <CalendarDays size={17} className="text-text-secondary" />
                  </button>
                  <span className="text-text-tertiary text-sm">-</span>
                  <span className="text-sm text-text-secondary flex-1 text-center">
                    {draftRange.end.format("YYYY.MM.DD")}
                  </span>
                  <button
                    onClick={() => openRangePicker("end")}
                    className="p-1"
                  >
                    <CalendarDays size={17} className="text-text-secondary" />
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 mb-6">
              <p className="text-xs font-semibold text-text-secondary mb-3">
                유형
              </p>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setDraft((d) => ({ ...d, typeFilter: t }))}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors",
                      draft.typeFilter === t
                        ? "bg-primary text-white"
                        : "bg-[#F0F1F4] text-text-secondary",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={applyFilter}
            className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-semibold shrink-0"
          >
            조회
          </button>
        </div>
      </div>

      {/* ── 날짜 범위 피커 ── */}
      {showRangePicker && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowRangePicker(false)}
          />
          <div className="relative w-full max-w-mobile bg-white rounded-t-2xl px-4 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-text-primary">
                날짜 범위 선택
              </p>
              <button onClick={() => setShowRangePicker(false)}>
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 mb-5 bg-[#F0F1F4] rounded-xl py-3 px-4">
              <div
                className={cn(
                  "text-sm font-semibold px-3 py-1 rounded-lg transition-colors",
                  pickingField === "start"
                    ? "bg-primary text-white"
                    : "text-text-primary",
                )}
              >
                {pickerStart ? pickerStart.format("YYYY.MM.DD") : "시작일"}
              </div>
              <span className="text-text-tertiary">–</span>
              <div
                className={cn(
                  "text-sm font-semibold px-3 py-1 rounded-lg transition-colors",
                  pickingField === "end"
                    ? "bg-primary text-white"
                    : "text-text-primary",
                )}
              >
                {pickerEnd ? pickerEnd.format("YYYY.MM.DD") : "종료일"}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() =>
                  setRangePickerMonth((m) => m.subtract(1, "month"))
                }
                className="p-1"
              >
                <ChevronLeft size={20} className="text-text-secondary" />
              </button>
              <span className="text-base font-bold text-text-primary">
                {rangePickerMonth.format("YYYY.MM")}
              </span>
              <button
                onClick={() => setRangePickerMonth((m) => m.add(1, "month"))}
                className="p-1"
              >
                <ChevronRight size={20} className="text-text-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DOW_LABELS.map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "text-center text-sm py-1 font-medium",
                    i === 0
                      ? "text-red-500"
                      : i === 6
                        ? "text-blue-500"
                        : "text-text-secondary",
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 mb-5">
              {rangePickerCells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const isFuture = day.isAfter(today, "day");
                const isStart = !!pickerStart && day.isSame(pickerStart, "day");
                const isEnd = !!pickerEnd && day.isSame(pickerEnd, "day");
                const inRange =
                  !!pickerStart &&
                  !!pickerEnd &&
                  day.isAfter(pickerStart, "day") &&
                  day.isBefore(pickerEnd, "day");
                const isToday = day.isSame(today, "day");
                const col = i % 7;
                return (
                  <button
                    key={day.format("YYYY-MM-DD")}
                    onClick={() => handleRangeCalendarTap(day)}
                    disabled={isFuture}
                    className={cn(
                      "flex items-center justify-center h-10",
                      inRange && "bg-[#E8F0FE]",
                      isStart && !isEnd && "bg-[#E8F0FE] rounded-l-full",
                      isEnd && !isStart && "bg-[#E8F0FE] rounded-r-full",
                    )}
                  >
                    <span
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium",
                        (isStart || isEnd) && "bg-primary text-white font-bold",
                        !isStart &&
                          !isEnd &&
                          isToday &&
                          "border border-primary text-primary",
                        !isStart &&
                          !isEnd &&
                          !isToday &&
                          isFuture &&
                          "text-text-tertiary",
                        !isStart &&
                          !isEnd &&
                          !isToday &&
                          !isFuture &&
                          col === 0 &&
                          "text-red-500",
                        !isStart &&
                          !isEnd &&
                          !isToday &&
                          !isFuture &&
                          col === 6 &&
                          "text-blue-500",
                        !isStart &&
                          !isEnd &&
                          !isToday &&
                          !isFuture &&
                          col !== 0 &&
                          col !== 6 &&
                          "text-text-primary",
                      )}
                    >
                      {day.date()}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={confirmRangePicker}
              disabled={!pickerStart}
              className={cn(
                "w-full py-4 rounded-2xl text-sm font-semibold",
                pickerStart
                  ? "bg-primary text-white"
                  : "bg-[#F0F1F4] text-text-tertiary",
              )}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ── 월 선택 피커 모달 ── */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300",
          showMonthPicker ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setShowMonthPicker(false)}
      />
      <div
        aria-hidden={!showMonthPicker}
        {...(!showMonthPicker ? { inert: "" } : {})}
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-[70] transition-transform duration-300 ease-out",
          showMonthPicker ? "translate-y-0" : "translate-y-[calc(100%+1rem)]",
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-7 pt-3">
          <p className="text-sm font-bold text-text-primary mb-4">
            조회 월 선택
          </p>
          <div className="relative">
            <div
              className="absolute left-0 right-0 -z-10 bg-[#F0F1F4] rounded-xl pointer-events-none"
              style={{ top: ITEM_H, height: ITEM_H }}
            />
            <div className="flex overflow-hidden">
              <ScrollPicker
                key={`year-${showMonthPicker}`}
                items={YEARS.map((y) => `${y}년`)}
                selectedIndex={YEARS.indexOf(pickerYear)}
                onChange={(i) => setPickerYear(YEARS[i])}
              />
              <ScrollPicker
                key={`month-${showMonthPicker}`}
                items={MONTHS.map((m) => `${String(m).padStart(2, "0")}월`)}
                selectedIndex={pickerMonth - 1}
                onChange={(i) => setPickerMonth(i + 1)}
              />
            </div>
          </div>
          <button
            onClick={confirmMonthPicker}
            className="w-full mt-4 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold"
          >
            조회
          </button>
        </div>
      </div>

      {/* ── 배정결과 스크래치 모달 ── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          scratchTarget !== null
            ? "opacity-100"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setScratchTarget(null)}
      />
      <div
        aria-hidden={scratchTarget === null}
        {...(scratchTarget === null ? { inert: "" } : {})}
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-[60] transition-transform duration-300 ease-out",
          scratchTarget !== null
            ? "translate-y-0"
            : "translate-y-[calc(100%+1rem)]",
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="px-5 pb-7 pt-3 flex flex-col items-center">
          <p className="text-lg font-bold text-text-primary mb-1 text-center">
            청약에 몇 주 성공했을까요?
          </p>
          <p className="text-sm text-text-secondary mb-7 text-center">
            {scratchItem?.company}
          </p>
          <ScratchCard
            key={scratchItem?.id ?? "none"}
            allocatedQty={scratchItem?.allocatedQty ?? 0}
            logoColor={scratchItem?.logoColor ?? ""}
            abbr={getAbbr(scratchItem?.company ?? "")}
            onFullyScratch={triggerConfetti}
          />
          <button
            onClick={confirmScratch}
            className="w-full mt-7 py-4 bg-primary text-white rounded-2xl text-sm font-semibold"
          >
            확인
          </button>
        </div>
      </div>

      {/* ── 축하 효과 ── */}
      {showConfetti && <Confetti />}

      {/* ── 취소 확인 시트 ── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          cancelTarget !== null
            ? "opacity-100"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setCancelTarget(null)}
      />
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-[60] transition-transform duration-300 ease-out",
          cancelTarget !== null
            ? "translate-y-0"
            : "translate-y-[calc(100%+1rem)]",
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pt-3 pb-7">
          <p className="text-sm text-text-secondary text-center mb-1">
            {cancelItem?.company}
          </p>
          <h3 className="text-xl font-bold text-text-primary text-center mb-4">
            청약 신청을 취소할까요?
          </h3>
          <div className="border-t border-border mb-5" />
          <div className="space-y-4 mb-7">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">환불 금액</span>
              <span className="text-sm font-semibold text-text-primary">
                {cancelItem?.agencyDeposit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">환불계좌</span>
              <span className="text-sm font-medium text-text-primary">
                {accountNumberMasked}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCancelTarget(null)}
              className="flex-1 py-4 bg-[#F0F1F4] rounded-xl text-sm font-semibold text-text-secondary"
            >
              돌아가기
            </button>
            <button
              onClick={() => {
                if (cancelTarget == null) return;
                cancelSubscription.mutate(cancelTarget, {
                  onError: () =>
                    alert("청약 취소에 실패했어요. 잠시 후 다시 시도해주세요."),
                });
                setCancelTarget(null);
              }}
              disabled={cancelSubscription.isPending}
              className="flex-1 py-4 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              취소확정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
