import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'
import { MonthPickerSheet } from '../components/MonthPickerSheet'
import { useReturnPlans } from '../hooks/useReturnPlans'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'

function LogoAvatar({ logoUrl, ticker, size = 10 }: { logoUrl: string | null; ticker: string; size?: number }) {
  const [error, setError] = useState(false)
  useEffect(() => { setError(false) }, [logoUrl])
  const color = generateLogoColor(ticker)
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0`
  if (logoUrl && !error) {
    return <img src={logoUrl} alt={ticker} onError={() => setError(true)} className={`${cls} object-cover`} />
  }
  return (
    <div className={`${cls} flex items-center justify-center text-white text-xs font-bold`} style={{ backgroundColor: color }}>
      {ticker.slice(0, 2)}
    </div>
  )
}

const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ReturnPlanHistoryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'DONE' | 'UPCOMING'>('DONE')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [pickerOpen, setPickerOpen] = useState(false)

  useLayoutEffect(() => {
    const idx = tab === 'DONE' ? 0 : 1
    const el = tabRefs.current[idx]
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [tab])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const { data: returnPlans = [] } = useReturnPlans()

  const items = returnPlans
    .filter((plan) => plan.refundDate)
    .map((plan) => {
      const [itemYear, itemMonth] = plan.refundDate!.split('-').map(Number)
      return {
        id: plan.returnPlanId,
        date: plan.refundDate!.replace(/-/g, '.'),
        year: itemYear,
        month: itemMonth,
        name: plan.sourceCompanyName,
        ticker: plan.sourceTicker,
        logoUrl: plan.sourceLogoUrl ?? null,
        amount: formatUsd(plan.totalRefundAmount),
        rawAmount: plan.totalRefundAmount,
        status: (plan.planStatus === 'EXECUTED' ? 'DONE' : 'UPCOMING') as 'DONE' | 'UPCOMING',
      }
    })

  const itemsInMonth = items.filter((item) => item.year === year && item.month === month)
  const doneInMonth = itemsInMonth.filter((item) => item.status === 'DONE')
  const upcomingInMonth = itemsInMonth.filter((item) => item.status === 'UPCOMING')

  const SUMMARY = [
    { label: '총 분배액', value: formatUsd(doneInMonth.reduce((sum, item) => sum + item.rawAmount, 0)) },
    { label: '총 실행', value: `${doneInMonth.length}회` },
    { label: '예정 건수', value: `${upcomingInMonth.length}건` },
  ]

  const grouped = itemsInMonth
    .filter((item) => item.status === tab)
    .reduce<Record<string, typeof itemsInMonth>>((acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    }, {})

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

        <div className="h-[13px] bg-surface-bg" />

        <div className="px-4 pt-3 pb-2 flex justify-end">
          <div className="relative flex bg-surface-bg rounded-lg p-0.5">
            <div
              className="absolute top-0.5 bottom-0.5 rounded-md bg-white transition-all duration-200 ease-in-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {(['DONE', 'UPCOMING'] as const).map((t, i) => (
              <button
                key={t}
                ref={el => { tabRefs.current[i] = el }}
                onClick={() => setTab(t)}
                className={cn(
                  'relative z-10 px-3 py-0.5 rounded-md text-[12px] transition-colors duration-200',
                  tab === t ? 'text-black font-semibold' : 'text-[#999EA4] font-medium',
                )}
              >
                {t === 'DONE' ? '완료' : '예정'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dateItems]) => (
            <div key={date}>
              <p className="px-4 pt-4 pb-1 text-sm text-text-tertiary">{date}</p>
              {dateItems.map((item) => (
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
                  <LogoAvatar logoUrl={item.logoUrl} ticker={item.ticker} />
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
