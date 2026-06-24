import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useCreateSavingsAccount } from '@/features/mypage/hooks/useMyPage'

const ITEM_H = 44
const VISIBLE = 5
const PAD = 2 * ITEM_H

function buildYears() {
  const y = new Date().getFullYear()
  return Array.from({ length: 11 }, (_, i) => `${y + i}년`)
}

function buildMonths() {
  return Array.from({ length: 12 }, (_, i) => `${i + 1}월`)
}

function getDaysInMonth(year: string, month: string): string[] {
  const y = parseInt(year)
  const m = parseInt(month)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${i + 1}일`)
}

const YEARS = buildYears()
const MONTHS = buildMonths()

function DrumColumn({ items, selected, onSelect }: {
  items: string[]
  selected: string
  onSelect: (v: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const idx = items.indexOf(selected)
    if (idx >= 0) el.scrollTop = idx * ITEM_H
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleScroll = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_H)
      const clamped = Math.max(0, Math.min(items.length - 1, idx))
      el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' })
      onSelect(items[clamped])
    }, 120)
  }, [items, onSelect])

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: VISIBLE * ITEM_H }}>
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, white 0%, rgba(255,255,255,0.5) 28%, transparent 42%, transparent 58%, rgba(255,255,255,0.5) 72%, white 100%)' }}
      />
      <div
        ref={ref}
        className="absolute inset-0 overflow-y-scroll"
        style={{ paddingTop: PAD, paddingBottom: PAD, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-center justify-center transition-all duration-100 ${
              item === selected ? 'font-semibold text-text-primary text-lg' : 'text-gray-300 text-base font-semibold'
            }`}
            style={{ height: ITEM_H }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MaturityDatePage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()

  const now = new Date()
  const defaultYear = `${now.getFullYear() + 1}년`
  const defaultMonth = `${now.getMonth() + 1}월`
  const defaultDay = `${now.getDate()}일`

  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(defaultMonth)
  const [day, setDay] = useState(defaultDay)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createSavings = useCreateSavingsAccount()

  const days = getDaysInMonth(year, month)

  useEffect(() => {
    const maxDay = days.length
    const currentDay = parseInt(day)
    if (currentDay > maxDay) setDay(`${maxDay}일`)
  }, [year, month])

  const dateLabel = `${year.replace('년', '')}년 ${month.replace('월', '')}월 ${day.replace('일', '')}일`

  useEffect(() => {
    const t = setTimeout(() => setSheetOpen(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleConfirm = async () => {
    setSheetOpen(false)
    setError(null)
    const y = year.replace('년', '')
    const m = month.replace('월', '').padStart(2, '0')
    const d = day.replace('일', '').padStart(2, '0')
    const maturityDate = `${y}-${m}-${d}`
    try {
      const result = await createSavings.mutateAsync(maturityDate)
      navigate(`/mypage/product/${productId}/complete`, {
        state: { maturityDate: result.maturityDate ?? maturityDate },
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? '오류가 발생했습니다')
    }
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <header className="flex items-center px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <div className="px-5 pt-4">
        <h1 className="text-xl font-bold text-text-primary mb-6">만기일을 입력하세요</h1>

        <button
          onClick={() => setSheetOpen(true)}
          className="w-full flex items-center justify-between px-4 py-4 bg-surface-bg rounded-xl"
        >
          <span className="text-text-primary text-sm">{dateLabel}</span>
          <Calendar size={18} className="text-text-tertiary" />
        </button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>

      {/* dim */}
      <div
        className={`fixed inset-0 z-20 bg-black/20 transition-opacity duration-300 ${sheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSheetOpen(false)}
      />

      {/* sheet */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-3xl z-30 transition-transform duration-300 ease-out ${sheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex px-4">
          <DrumColumn items={YEARS} selected={year} onSelect={setYear} />
          <DrumColumn items={MONTHS} selected={month} onSelect={setMonth} />
          <DrumColumn items={days} selected={day} onSelect={setDay} />
        </div>

        <div className="flex">
          <button
            onClick={() => setSheetOpen(false)}
            className="flex-1 py-5 text-base font-normal text-text-secondary bg-surface-bg"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={createSavings.isPending}
            className="flex-1 py-5 text-base font-normal text-white bg-primary disabled:opacity-60"
          >
            {createSavings.isPending ? '처리 중...' : '확인'}
          </button>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  )
}
