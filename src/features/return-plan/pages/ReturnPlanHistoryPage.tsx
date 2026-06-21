import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'
import { MonthPickerSheet } from '../components/MonthPickerSheet'

const SUMMARY = [
  { label: '총 분배액', value: '$700.00' },
  { label: '총 실행', value: '4회' },
  { label: '예수금 누적', value: '$308.00' },
]

const HISTORY = [
  { id: 1, date: '2025.05.28', name: 'Rubrik', ticker: 'RUBK', amount: '$838.91', status: 'DONE' },
  { id: 2, date: '2025.05.28', name: 'Rubrik', ticker: 'RUBK', amount: '$838.91', status: 'DONE' },
  { id: 3, date: '2025.05.30', name: 'Rubrik', ticker: 'RUBK', amount: '$838.91', status: 'DONE' },
  { id: 4, date: '2025.05.30', name: 'Rubrik', ticker: 'RUBK', amount: '$838.91', status: 'DONE' },
  { id: 5, date: '2026.03.06', name: 'Klarna', ticker: 'KLAR', amount: '$2,108.00', status: 'UPCOMING' },
] as const

export function ReturnPlanHistoryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'DONE' | 'UPCOMING'>('DONE')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [year, setYear] = useState(2025)
  const [month, setMonth] = useState(5)

  const grouped = HISTORY.filter((item) => {
    if (item.status !== tab) return false
    const [itemYear, itemMonth] = item.date.split('.').map(Number)
    return itemYear === year && itemMonth === month
  }).reduce<Record<string, typeof HISTORY[number][]>>(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    },
    {},
  )

  return (
    <div className="mobile-container flex flex-col h-screen overflow-hidden bg-white">
      <Header showBack showNotification={false} showMypage={false} title="리턴 내역" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-5">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1 text-xl font-bold text-text-primary"
          >
            {year}년 {month}월
            <ChevronDown size={20} />
          </button>

          <div className="flex items-center gap-2 mt-4">
            {SUMMARY.map((s) => (
              <div key={s.label} className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-xs text-text-tertiary">{s.label}</p>
                <p className="text-sm font-bold text-text-primary mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-2 bg-surface-bg" />

        <div className="px-4 pt-3 pb-2 flex justify-end">
          <div className="flex bg-surface-bg rounded-full p-1">
            <button
              onClick={() => setTab('DONE')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium',
                tab === 'DONE' ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary',
              )}
            >
              완료
            </button>
            <button
              onClick={() => setTab('UPCOMING')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium',
                tab === 'UPCOMING' ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary',
              )}
            >
              예정
            </button>
          </div>
        </div>

        <div className="mt-2">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="px-4 pt-4 pb-1 text-sm text-text-tertiary">{date}</p>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    navigate(
                      item.status === 'DONE'
                        ? `/return-plan/result/${item.id}`
                        : `/return-plan/pending/${item.id}`,
                    )
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">MS</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-text-primary">{item.name}</p>
                    <p className="text-sm text-text-tertiary">
                      {item.ticker} · {item.date}
                    </p>
                  </div>
                  <p className="text-base font-bold text-text-primary">{item.amount}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <MonthPickerSheet
        open={pickerOpen}
        year={year}
        month={month}
        onClose={() => setPickerOpen(false)}
        onConfirm={(y, m) => {
          setYear(y)
          setMonth(m)
          setPickerOpen(false)
        }}
      />
    </div>
  )
}
