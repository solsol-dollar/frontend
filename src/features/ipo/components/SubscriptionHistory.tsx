import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Info, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs, { Dayjs } from 'dayjs'

type StatusType = '청약신청' | '취소완료' | '배정완료' | '상장완료'
type PeriodMode = '월별' | '기간별'
type PeriodPreset = '1주일' | '1개월' | '3개월' | '6개월' | '직접설정'
type TypeFilter = '전체' | '청약신청/취소완료' | '배정완료' | '상장완료'

const STATUS_BADGE: Record<StatusType, string> = {
  청약신청: 'border border-primary text-primary',
  취소완료: 'border border-border text-text-secondary',
  배정완료: 'border border-primary text-primary',
  상장완료: 'border border-up text-up',
}

const QUICK_PRESETS = ['1주일', '1개월', '3개월', '6개월'] as const
const TYPE_FILTERS: TypeFilter[] = ['전체', '청약신청/취소완료', '배정완료', '상장완료']
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const ITEM_H = 44
const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface FilterState {
  periodMode: PeriodMode
  year: number
  month: number
  preset: PeriodPreset
  rangeStart: Dayjs
  rangeEnd: Dayjs
  typeFilter: TypeFilter
}

interface Subscription {
  id: number
  company: string
  ticker: string
  logoColor: string
  status: StatusType
  amount: string
  date: string
  subscriptionStart: string
  subscriptionEnd: string
  offeringPrice?: number
  confirmedPrice?: number
  listingDate?: string
  currentPrice?: string
  allocatedQty?: number
  returnRate?: string
  returnPositive?: boolean
}

// ─── 스크롤 피커 ──────────────────────────────────────────
function ScrollPicker({
  items,
  selectedIndex,
  onChange,
}: {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selectedIndex * ITEM_H
  }, []) // eslint-disable-line

  const handleScroll = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)))
      el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
      onChangeRef.current(idx)
    }, 120)
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="flex-1 overflow-y-scroll"
      style={{ height: ITEM_H * 3, scrollbarWidth: 'none' }}
    >
      <div style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}>
        {items.map((item, i) => (
          <div
            key={item}
            style={{ height: ITEM_H }}
            className={cn(
              'flex items-center justify-center transition-all duration-150 select-none',
              i === selectedIndex
                ? 'text-base font-bold text-text-primary'
                : 'text-sm text-text-tertiary opacity-40',
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 복권 긁기 카드 ───────────────────────────────────────
const SCRATCH_SIZE = 220

function ScratchCard({
  allocatedQty,
  logoColor,
  abbr,
  onFullyScratch,
}: {
  allocatedQty: number
  logoColor: string
  abbr: string
  onFullyScratch: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const done = useRef(false)
  const cbRef = useRef(onFullyScratch)
  cbRef.current = onFullyScratch

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1B2B5E'
    ctx.fillRect(0, 0, SCRATCH_SIZE, SCRATCH_SIZE)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('여기를 긁어보세요', SCRATCH_SIZE / 2, SCRATCH_SIZE / 2)
  }, [])

  function scratchAt(clientX: number, clientY: number) {
    if (done.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (SCRATCH_SIZE / rect.width)
    const y = (clientY - rect.top) * (SCRATCH_SIZE / rect.height)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 32, 0, Math.PI * 2)
    ctx.fill()

    // sample every 64 bytes (every 16th pixel) for performance
    const data = ctx.getImageData(0, 0, SCRATCH_SIZE, SCRATCH_SIZE).data
    let cleared = 0
    for (let i = 3; i < data.length; i += 64) {
      if (data[i] < 128) cleared++
    }
    if (cleared / (data.length / 64) > 0.5) {
      done.current = true
      ctx.clearRect(0, 0, SCRATCH_SIZE, SCRATCH_SIZE)
      cbRef.current()
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
        style={{ background: 'linear-gradient(135deg, #fce4ec, #e3f2fd, #fffde7, #e8f5e9)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm"
          style={{ backgroundColor: logoColor }}
        >
          {abbr}
        </div>
        <p className="text-4xl font-bold" style={{ color: '#1B2B5E' }}>
          {allocatedQty}주
        </p>
      </div>

      {/* 긁기 캔버스 */}
      <canvas
        ref={canvasRef}
        width={SCRATCH_SIZE}
        height={SCRATCH_SIZE}
        className="absolute inset-0 touch-none"
        style={{ cursor: 'crosshair' }}
        onMouseDown={(e) => { isDrawing.current = true; scratchAt(e.clientX, e.clientY) }}
        onMouseMove={(e) => { if (isDrawing.current) scratchAt(e.clientX, e.clientY) }}
        onMouseUp={() => { isDrawing.current = false }}
        onMouseLeave={() => { isDrawing.current = false }}
        onTouchStart={(e) => { isDrawing.current = true; scratchAt(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchMove={(e) => { e.preventDefault(); if (isDrawing.current) scratchAt(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchEnd={() => { isDrawing.current = false }}
      />
    </div>
  )
}

// ─── 축하 효과 ───────────────────────────────────────────
const CONFETTI_COLORS = ['#FF6B35', '#635BFF', '#FFB3C7', '#29A9F5', '#00C0A0', '#FF4B8B', '#FFD700', '#0922AC']

const CONFETTI_PARTICLES = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: Math.random() * 100,
  delay: Math.random() * 0.7,
  duration: 1.4 + Math.random() * 0.9,
  size: 7 + Math.random() * 7,
  isCircle: Math.random() > 0.5,
  drift: (Math.random() - 0.5) * 120,
}))

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      {CONFETTI_PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '3px',
            animationName: 'confetti-fall',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'ease-in',
            animationFillMode: 'forwards',
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

// ─── 유틸 ────────────────────────────────────────────────
function isInSubscriptionPeriod(sub: Subscription): boolean {
  const today = dayjs().startOf('day')
  return (
    (today.isSame(dayjs(sub.subscriptionStart)) || today.isAfter(dayjs(sub.subscriptionStart))) &&
    (today.isSame(dayjs(sub.subscriptionEnd)) || today.isBefore(dayjs(sub.subscriptionEnd)))
  )
}

function needsReconfirmation(sub: Subscription): boolean {
  if (sub.confirmedPrice == null || sub.offeringPrice == null) return false
  const lower = sub.offeringPrice * 0.8
  const upper = sub.offeringPrice * 1.2
  return sub.confirmedPrice < lower || sub.confirmedPrice > upper
}

function getEffectiveRange(f: FilterState): { start: Dayjs; end: Dayjs } {
  if (f.periodMode === '월별') {
    const start = dayjs(`${f.year}-${String(f.month).padStart(2, '0')}-01`)
    return { start, end: start.endOf('month') }
  }
  if (f.preset === '직접설정') return { start: f.rangeStart, end: f.rangeEnd }
  const now = dayjs().startOf('day')
  const start =
    f.preset === '1주일' ? now.subtract(1, 'week')
    : f.preset === '1개월' ? now.subtract(1, 'month')
    : f.preset === '3개월' ? now.subtract(3, 'month')
    : now.subtract(6, 'month')
  return { start, end: now }
}

function getFilterLabel(f: FilterState): string {
  if (f.periodMode === '월별') return `${f.year}년 ${String(f.month).padStart(2, '0')}월`
  if (f.preset === '직접설정')
    return `${f.rangeStart.format('YY.MM.DD')} ~ ${f.rangeEnd.format('YY.MM.DD')}`
  return f.preset
}

function getCalendarCells(month: Dayjs): (Dayjs | null)[] {
  const cells: (Dayjs | null)[] = Array(month.startOf('month').day()).fill(null)
  for (let d = 1; d <= month.daysInMonth(); d++) cells.push(month.date(d))
  return cells
}

// ─── 목업 데이터 ──────────────────────────────────────────
const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1, company: 'CoreWeave', ticker: 'CRWV', logoColor: '#FF6B35',
    status: '청약신청', amount: 'USD 102',
    date: '2026.06.15', subscriptionStart: '2026-06-15', subscriptionEnd: '2026-06-25',
    offeringPrice: 20, confirmedPrice: 28, listingDate: '2026.07.04',
  },
  {
    id: 2, company: 'Stripe', ticker: 'STRP', logoColor: '#635BFF',
    status: '취소완료', amount: 'USD 280',
    date: '2026.06.10', subscriptionStart: '2026-06-10', subscriptionEnd: '2026-06-20',
    offeringPrice: 28, confirmedPrice: 30, listingDate: '2026.06.29',
  },
  {
    id: 3, company: 'Klarna', ticker: 'KLAR', logoColor: '#FFB3C7',
    status: '배정완료', amount: 'USD 500',
    date: '2026.05.20', subscriptionStart: '2026-05-20', subscriptionEnd: '2026-05-25',
    offeringPrice: 25, confirmedPrice: 25, listingDate: '2026.06.10', allocatedQty: 5,
  },
  {
    id: 4, company: 'CoreWeave', ticker: 'CRWV', logoColor: '#FF6B35',
    status: '상장완료', amount: 'USD 102',
    date: '2026.05.01', subscriptionStart: '2026-05-01', subscriptionEnd: '2026-05-10',
    offeringPrice: 20, confirmedPrice: 20, currentPrice: 'USD 24.80',
    allocatedQty: 3, returnRate: '+24.0%', returnPositive: true,
  },
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-text-secondary w-24 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  )
}

function getAbbr(company: string): string {
  const words = company.split(/(?=[A-Z])|[\s-]/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return company.substring(0, 2).toUpperCase()
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export function SubscriptionHistory() {
  const navigate = useNavigate()
  const today = dayjs().startOf('day')

  const YEARS = Array.from({ length: today.year() - 2020 + 2 }, (_, i) => 2020 + i)

  const defaultFilter: FilterState = {
    periodMode: '기간별',
    year: today.year(),
    month: today.month() + 1,
    preset: '3개월',
    rangeStart: today.subtract(3, 'month'),
    rangeEnd: today,
    typeFilter: '전체',
  }

  const [applied, setApplied] = useState<FilterState>(defaultFilter)
  const [draft, setDraft] = useState<FilterState>(defaultFilter)
  const [showSheet, setShowSheet] = useState(false)

  // 월별 피커
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(today.year())
  const [pickerMonth, setPickerMonth] = useState(today.month() + 1)

  // 날짜 범위 피커
  const [showRangePicker, setShowRangePicker] = useState(false)
  const [pickerStart, setPickerStart] = useState<Dayjs | null>(null)
  const [pickerEnd, setPickerEnd] = useState<Dayjs | null>(null)
  const [pickingField, setPickingField] = useState<'start' | 'end'>('start')
  const [rangePickerMonth, setRangePickerMonth] = useState(today.startOf('month'))

  // 취소 시트
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)
  const cancelItem = SUBSCRIPTIONS.find((s) => s.id === cancelTarget)

  // 청약확정등록 확인 모달
  const [confirmRegTarget, setConfirmRegTarget] = useState<number | null>(null)
  const [confirmedRegIds, setConfirmedRegIds] = useState<Set<number>>(new Set())
  const confirmRegItem = SUBSCRIPTIONS.find((s) => s.id === confirmRegTarget)

  // 배정결과 스크래치
  const [scratchTarget, setScratchTarget] = useState<number | null>(null)
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const scratchItem = SUBSCRIPTIONS.find((s) => s.id === scratchTarget)

  function openSheet() {
    setDraft(applied)
    setShowSheet(true)
  }

  function applyFilter() {
    setApplied(draft)
    setShowSheet(false)
  }

  function openMonthPicker() {
    setPickerYear(draft.year)
    setPickerMonth(draft.month)
    setShowMonthPicker(true)
  }

  function confirmMonthPicker() {
    setDraft((d) => ({ ...d, year: pickerYear, month: pickerMonth }))
    setShowMonthPicker(false)
  }

  function openRangePicker(startFrom: 'start' | 'end' = 'start') {
    setPickerStart(draft.rangeStart)
    setPickerEnd(draft.rangeEnd)
    setRangePickerMonth(
      startFrom === 'start'
        ? draft.rangeStart.startOf('month')
        : draft.rangeEnd.startOf('month'),
    )
    setPickingField(startFrom)
    setShowRangePicker(true)
  }

  function handleRangeCalendarTap(day: Dayjs) {
    if (day.isAfter(today, 'day')) return
    if (pickingField === 'start') {
      setPickerStart(day)
      setPickerEnd(null)
      setPickingField('end')
    } else {
      if (day.isBefore(pickerStart!, 'day')) {
        setPickerStart(day)
        setPickerEnd(null)
        setPickingField('end')
      } else {
        setPickerEnd(day)
      }
    }
  }

  function confirmRangePicker() {
    const start = pickerStart ?? today
    const end = pickerEnd ?? start
    setDraft((d) => ({ ...d, rangeStart: start, rangeEnd: end, preset: '직접설정' }))
    setShowRangePicker(false)
  }

  function triggerConfetti() {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  function confirmScratch() {
    if (scratchTarget != null) {
      setConfirmedIds((prev) => new Set([...prev, scratchTarget]))
    }
    setScratchTarget(null)
  }

  const { start: rangeStart, end: rangeEnd } = getEffectiveRange(applied)
  const draftRange = getEffectiveRange(draft)

  const filtered = SUBSCRIPTIONS.filter((sub) => {
    const date = dayjs(sub.date.replace(/\./g, '-'))
    const dateOk =
      (date.isSame(rangeStart) || date.isAfter(rangeStart)) &&
      (date.isSame(rangeEnd) || date.isBefore(rangeEnd))
    const typeOk =
      applied.typeFilter === '전체' ||
      (applied.typeFilter === '청약신청/취소완료'
        ? sub.status === '청약신청' || sub.status === '취소완료'
        : sub.status === applied.typeFilter)
    return dateOk && typeOk
  })

  const rangePickerCells = getCalendarCells(rangePickerMonth)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F6F9]">
      {/* 계좌 정보 */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm text-text-secondary">270-91-175039[01] CMA 김희선</span>
      </div>

      {/* 조회 조건 버튼 */}
      <div className="px-4 py-3 shrink-0">
        <button
          onClick={openSheet}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-primary"
        >
          <SlidersHorizontal size={15} className="text-text-secondary" />
          <span>{getFilterLabel(applied)}</span>
          {applied.typeFilter !== '전체' && (
            <span className="text-text-secondary font-normal">· {applied.typeFilter}</span>
          )}
          <ChevronDown size={15} />
        </button>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isRevealed = confirmedIds.has(sub.id)
            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: sub.logoColor }}
                      >
                        {getAbbr(sub.company)}
                      </div>
                      <div>
                        <p className="text-base font-bold text-text-primary">{sub.company}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">{sub.ticker}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-xs px-3 py-0.5 rounded-full', STATUS_BADGE[sub.status])}>
                        {sub.status}
                      </span>
                      {sub.returnRate && (
                        <span className={cn('text-sm font-bold', sub.returnPositive ? 'text-up' : 'text-down')}>
                          {sub.returnRate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pl-[52px]">
                    <InfoRow label="청약금액" value={sub.amount} />
                    {sub.status === '상장완료' ? (
                      <>
                        {sub.confirmedPrice != null && <InfoRow label="공모가" value={`USD ${sub.confirmedPrice.toFixed(2)}`} />}
                        {sub.currentPrice && <InfoRow label="현재가" value={sub.currentPrice} />}
                        {sub.allocatedQty != null && <InfoRow label="배정주식 수" value={`${sub.allocatedQty}주`} />}
                      </>
                    ) : sub.status === '배정완료' ? (
                      <>
                        <InfoRow label="청약일자" value={sub.date} />
                        {sub.offeringPrice != null && <InfoRow label="공모가" value={`USD ${sub.offeringPrice.toFixed(2)}`} />}
                        {sub.allocatedQty != null && (
                          <InfoRow
                            label="배정주식 수"
                            value={isRevealed ? `${sub.allocatedQty}주` : '??'}
                          />
                        )}
                        {sub.listingDate && <InfoRow label="상장(예정)일" value={sub.listingDate} />}
                      </>
                    ) : (
                      <>
                        <InfoRow label="청약일자" value={sub.date} />
                        {sub.offeringPrice != null && <InfoRow label="공모(예정)가" value={`USD ${sub.offeringPrice.toFixed(2)}`} />}
                        {sub.listingDate && <InfoRow label="상장(예정)일" value={sub.listingDate} />}
                      </>
                    )}
                  </div>
                </div>

                {/* 버튼 영역 */}
                {sub.status === '청약신청' && (() => {
                  const inPeriod = isInSubscriptionPeriod(sub)
                  const needsConfirm = needsReconfirmation(sub) && !confirmedRegIds.has(sub.id)
                  if (!inPeriod && !needsConfirm) return null
                  return (
                    <div className="px-4 pb-4 flex gap-2">
                      {inPeriod && (
                        <button
                          onClick={() => setCancelTarget(sub.id)}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-[#F0F1F4]"
                        >
                          취소
                        </button>
                      )}
                      {needsConfirm && (
                        <button
                          onClick={() => setConfirmRegTarget(sub.id)}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-primary"
                        >
                          청약확정등록
                        </button>
                      )}
                    </div>
                  )
                })()}

                {sub.status === '배정완료' && (
                  <div className="px-4 pb-4 flex gap-2">
                    {!isRevealed ? (
                      <button
                        onClick={() => setScratchTarget(sub.id)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-primary"
                      >
                        배정결과 보기
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/ipo/${sub.id}/result`)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-[#F0F1F4]"
                      >
                        상세보기
                      </button>
                    )}
                  </div>
                )}

              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-text-tertiary">해당 조건에 내역이 없습니다.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-tertiary px-1 mt-3">
          <Info size={13} />
          <span>청약 취소는 청약 기간 중에만 가능합니다.</span>
        </div>
      </div>

      {/* ── 조회 조건 설정 시트 ── */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSheet(false)} />
          <div className="relative bg-white rounded-t-2xl px-4 pt-5 pb-8 h-[70dvh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <p className="text-base font-bold text-text-primary">조회 조건 설정</p>
              <button onClick={() => setShowSheet(false)}>
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-text-secondary mb-2">조회기간</p>

              <div className="flex bg-[#F0F1F4] rounded-xl p-0.5 mb-4">
                {(['월별', '기간별'] as PeriodMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDraft((d) => ({ ...d, periodMode: mode }))}
                    className={cn(
                      'flex-1 py-2 rounded-[10px] text-sm font-semibold transition-colors',
                      draft.periodMode === mode
                        ? 'bg-white text-text-primary shadow-sm'
                        : 'text-text-secondary',
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {draft.periodMode === '월별' && (
                <button
                  onClick={openMonthPicker}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-white mb-5"
                >
                  <span className="text-sm font-semibold text-text-primary">
                    {draft.year}년 {String(draft.month).padStart(2, '0')}월
                  </span>
                  <ChevronDown size={16} className="text-text-secondary" />
                </button>
              )}

              {draft.periodMode === '기간별' && (
                <div className="mb-5">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {QUICK_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setDraft((d) => ({ ...d, preset: p }))}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                          draft.preset === p
                            ? 'border-primary text-primary'
                            : 'border-border text-text-secondary bg-white',
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setDraft((d) => ({ ...d, preset: '직접설정' }))}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors mb-4',
                      draft.preset === '직접설정'
                        ? 'border-primary text-primary'
                        : 'border-border text-text-secondary bg-white',
                    )}
                  >
                    직접설정
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary flex-1 text-center">
                      {draftRange.start.format('YYYY.MM.DD')}
                    </span>
                    <button onClick={() => openRangePicker('start')} className="p-1">
                      <CalendarDays size={17} className="text-text-secondary" />
                    </button>
                    <span className="text-text-tertiary text-sm">-</span>
                    <span className="text-sm text-text-secondary flex-1 text-center">
                      {draftRange.end.format('YYYY.MM.DD')}
                    </span>
                    <button onClick={() => openRangePicker('end')} className="p-1">
                      <CalendarDays size={17} className="text-text-secondary" />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 mb-6">
                <p className="text-xs font-semibold text-text-secondary mb-3">유형</p>
                <div className="flex flex-wrap gap-2">
                  {TYPE_FILTERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDraft((d) => ({ ...d, typeFilter: t }))}
                      className={cn(
                        'px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors',
                        draft.typeFilter === t
                          ? 'bg-primary text-white'
                          : 'bg-[#F0F1F4] text-text-secondary',
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
      )}

      {/* ── 날짜 범위 피커 ── */}
      {showRangePicker && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRangePicker(false)} />
          <div className="relative bg-white rounded-t-2xl px-4 pt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-text-primary">날짜 범위 선택</p>
              <button onClick={() => setShowRangePicker(false)}>
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 mb-5 bg-[#F0F1F4] rounded-xl py-3 px-4">
              <div className={cn(
                'text-sm font-semibold px-3 py-1 rounded-lg transition-colors',
                pickingField === 'start' ? 'bg-primary text-white' : 'text-text-primary',
              )}>
                {pickerStart ? pickerStart.format('YYYY.MM.DD') : '시작일'}
              </div>
              <span className="text-text-tertiary">–</span>
              <div className={cn(
                'text-sm font-semibold px-3 py-1 rounded-lg transition-colors',
                pickingField === 'end' ? 'bg-primary text-white' : 'text-text-primary',
              )}>
                {pickerEnd ? pickerEnd.format('YYYY.MM.DD') : '종료일'}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setRangePickerMonth((m) => m.subtract(1, 'month'))} className="p-1">
                <ChevronLeft size={20} className="text-text-secondary" />
              </button>
              <span className="text-base font-bold text-text-primary">
                {rangePickerMonth.format('YYYY.MM')}
              </span>
              <button onClick={() => setRangePickerMonth((m) => m.add(1, 'month'))} className="p-1">
                <ChevronRight size={20} className="text-text-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DOW_LABELS.map((d, i) => (
                <div key={d} className={cn('text-center text-sm py-1 font-medium',
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-text-secondary')}>
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 mb-5">
              {rangePickerCells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />
                const isFuture = day.isAfter(today, 'day')
                const isStart = !!pickerStart && day.isSame(pickerStart, 'day')
                const isEnd = !!pickerEnd && day.isSame(pickerEnd, 'day')
                const inRange = !!pickerStart && !!pickerEnd &&
                  day.isAfter(pickerStart, 'day') && day.isBefore(pickerEnd, 'day')
                const isToday = day.isSame(today, 'day')
                const col = i % 7
                return (
                  <button
                    key={day.format('YYYY-MM-DD')}
                    onClick={() => handleRangeCalendarTap(day)}
                    disabled={isFuture}
                    className={cn('flex items-center justify-center h-10',
                      inRange && 'bg-[#E8F0FE]',
                      isStart && !isEnd && 'bg-[#E8F0FE] rounded-l-full',
                      isEnd && !isStart && 'bg-[#E8F0FE] rounded-r-full')}
                  >
                    <span className={cn('w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium',
                      (isStart || isEnd) && 'bg-primary text-white font-bold',
                      !isStart && !isEnd && isToday && 'border border-primary text-primary',
                      !isStart && !isEnd && !isToday && isFuture && 'text-text-tertiary',
                      !isStart && !isEnd && !isToday && !isFuture && col === 0 && 'text-red-500',
                      !isStart && !isEnd && !isToday && !isFuture && col === 6 && 'text-blue-500',
                      !isStart && !isEnd && !isToday && !isFuture && col !== 0 && col !== 6 && 'text-text-primary')}>
                      {day.date()}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={confirmRangePicker}
              disabled={!pickerStart}
              className={cn('w-full py-4 rounded-2xl text-sm font-semibold',
                pickerStart ? 'bg-primary text-white' : 'bg-[#F0F1F4] text-text-tertiary')}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ── 월 선택 피커 모달 ── */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMonthPicker(false)} />
          <div className="relative bg-white rounded-2xl px-5 pt-5 pb-5 w-full max-w-xs">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-text-primary">조회 월 선택</p>
              <button onClick={() => setShowMonthPicker(false)}>
                <X size={18} className="text-text-secondary" />
              </button>
            </div>
            <div className="relative">
              <div
                className="absolute left-0 right-0 bg-[#F0F1F4] rounded-xl pointer-events-none"
                style={{ top: ITEM_H, height: ITEM_H }}
              />
              <div className="flex overflow-hidden">
                <ScrollPicker
                  items={YEARS.map((y) => `${y}년`)}
                  selectedIndex={YEARS.indexOf(pickerYear)}
                  onChange={(i) => setPickerYear(YEARS[i])}
                />
                <ScrollPicker
                  items={MONTHS.map((m) => `${String(m).padStart(2, '0')}월`)}
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
      )}

      {/* ── 배정결과 스크래치 모달 ── */}
      {scratchTarget !== null && scratchItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setScratchTarget(null)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-3 pb-10 flex flex-col items-center">
            <div className="w-10 h-1 rounded-full bg-[#E5E7EB] mb-6" />
            <p className="text-lg font-bold text-text-primary mb-1 text-center">
              청약에 몇 주 성공했을까요?
            </p>
            <p className="text-sm text-text-secondary mb-7 text-center">
              {scratchItem.company}
            </p>
            <ScratchCard
              allocatedQty={scratchItem.allocatedQty ?? 0}
              logoColor={scratchItem.logoColor}
              abbr={getAbbr(scratchItem.company)}
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
      )}

      {/* ── 축하 효과 ── */}
      {showConfetti && <Confetti />}

      {/* ── 청약확정등록 확인 모달 ── */}
      {confirmRegTarget !== null && confirmRegItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmRegTarget(null)} />
          <div className="relative bg-white rounded-2xl px-5 pt-7 pb-6 w-full max-w-xs">
            <p className="text-base font-bold text-text-primary text-center mb-2">
              청약확정등록을 하시겠습니까?
            </p>
            <p className="text-sm text-text-secondary text-center mb-7">{confirmRegItem.company}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRegTarget(null)}
                className="flex-1 py-3.5 bg-[#F0F1F4] rounded-xl text-sm font-semibold text-text-secondary"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setConfirmedRegIds((prev) => new Set([...prev, confirmRegTarget]))
                  setConfirmRegTarget(null)
                }}
                className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 취소 확인 시트 ── */}
      {cancelTarget && cancelItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelTarget(null)} />
          <div className="relative bg-white rounded-t-2xl px-5 pt-6 pb-10">
            <p className="text-sm text-text-secondary text-center mb-1">{cancelItem.company}</p>
            <h3 className="text-xl font-bold text-text-primary text-center mb-4">
              청약 신청을 취소할까요?
            </h3>
            <div className="border-t border-border mb-5" />
            <div className="space-y-4 mb-7">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">환불 금액</span>
                <span className="text-sm font-semibold text-text-primary">{cancelItem.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">환불계좌</span>
                <span className="text-sm font-medium text-text-primary">270-91-175039[01] CMA</span>
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
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-4 bg-primary text-white rounded-xl text-sm font-semibold"
              >
                취소확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
