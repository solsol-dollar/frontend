import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  year: number
  month: number
  onClose: () => void
  onConfirm: (year: number, month: number) => void
}

const ITEM_H = 44
const VISIBLE_ROWS = 3
const LIST_HEIGHT = ITEM_H * VISIBLE_ROWS

const YEARS = Array.from({ length: 10 }, (_, i) => 2021 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function PickerColumn<T extends number>({
  items,
  selectedIndex,
  onChange,
  format,
}: {
  items: T[]
  selectedIndex: number
  onChange: (index: number) => void
  format: (value: T) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selectedIndex * ITEM_H
  }, []) // eslint-disable-line

  const handleScroll = () => {
    if (!ref.current) return
    clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)))
      el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
      onChange(idx)
    }, 120)
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="flex-1 overflow-y-scroll scrollbar-hide"
      style={{ height: LIST_HEIGHT }}
    >
      <div style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}>
        {items.map((item, i) => (
          <button
            key={item}
            onClick={() => onChange(i)}
            style={{ height: ITEM_H }}
            className={cn(
              'w-full flex items-center justify-center transition-all duration-150 select-none',
              i === selectedIndex
                ? 'text-base font-bold text-text-primary'
                : 'text-sm text-text-tertiary opacity-40',
            )}
          >
            {format(item)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MonthPickerSheet({ open, year, month, onClose, onConfirm }: Props) {
  const [tempYear, setTempYear] = useState(year)
  const [tempMonth, setTempMonth] = useState(month)

  useEffect(() => {
    if (open) {
      setTempYear(year)
      setTempMonth(month)
    }
  }, [open, year, month])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-[60] transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-[calc(100%+1rem)] pointer-events-none',
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-7 pt-3">
          <p className="text-sm font-bold text-text-primary mb-4">조회 월 선택</p>
          <div className="relative">
            <div
              className="absolute left-0 right-0 -z-10 bg-surface-bg rounded-xl pointer-events-none"
              style={{ top: ITEM_H, height: ITEM_H }}
            />
            <div className="flex overflow-hidden">
              <PickerColumn
                key={`year-${open}`}
                items={YEARS}
                selectedIndex={YEARS.indexOf(tempYear)}
                onChange={(i) => setTempYear(YEARS[i])}
                format={(v) => `${v}년`}
              />
              <PickerColumn
                key={`month-${open}`}
                items={MONTHS}
                selectedIndex={tempMonth - 1}
                onChange={(i) => setTempMonth(MONTHS[i])}
                format={(v) => `${v}월`}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-surface-bg rounded-xl text-sm font-semibold text-text-secondary"
            >
              취소
            </button>
            <button
              onClick={() => onConfirm(tempYear, tempMonth)}
              className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
