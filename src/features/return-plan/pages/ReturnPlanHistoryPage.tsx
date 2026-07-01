import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState<'all' | 'monthly'>('all')
  const [viewModeOpen, setViewModeOpen] = useState(false)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [tab, setTab] = useState<'DONE' | 'UPCOMING'>('DONE')
  const [pickerOpen, setPickerOpen] = useState(false)

  const { data: returnPlans = [] } = useReturnPlans()

  const items = returnPlans
    .filter((p) => p.refundDate)
    .map((p) => {
      const [y, m] = p.refundDate!.split('-').map(Number)
      return {
        id: p.returnPlanId,
        date: p.refundDate!.replace(/-/g, '.'),
        year: y,
        month: m,
        name: p.sourceCompanyName,
        ticker: p.sourceTicker,
        logoUrl: p.sourceLogoUrl ?? null,
        amount: formatUsd(p.totalRefundAmount),
        rawAmount: p.totalRefundAmount,
        status: (p.planStatus === 'EXECUTED' ? 'DONE' : 'UPCOMING') as 'DONE' | 'UPCOMING',
      }
    })

  const filtered = viewMode === 'all'
    ? items
    : items.filter((item) => item.year === year && item.month === month)

  const done = filtered.filter((i) => i.status === 'DONE')
  const upcoming = filtered.filter((i) => i.status === 'UPCOMING')

  const SUMMARY = [
    { label: '총 분배액', value: formatUsd(done.reduce((s, i) => s + i.rawAmount, 0)) },
    { label: '총 실행', value: `${done.length}회` },
    { label: '예정 건수', value: `${upcoming.length}건` },
  ]

  const grouped = (tab === 'DONE' ? done : upcoming).reduce<Record<string, typeof items>>((acc, item) => {
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
            onClick={() => setViewModeOpen(true)}
            className="flex items-center gap-1 text-[22px] font-bold text-text-primary"
          >
            {viewMode === 'all' ? '전체' : '월별'}
            <ChevronDown size={24} />
          </button>

          <div className="flex items-center gap-2 mt-5">
            {SUMMARY.map((s) => (
              <div key={s.label} className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-xs text-text-tertiary">{s.label}</p>
                <p className="text-sm font-bold text-text-primary mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[13px] bg-surface-bg" />

        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          {viewMode === 'monthly' ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1 text-base font-bold text-text-primary"
            >
              {year}년 {month}월
              <ChevronDown size={18} />
            </button>
          ) : <div />}

          <div className="flex bg-surface-bg rounded-full p-0.5">
            {(['DONE', 'UPCOMING'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3.5 py-1 rounded-full text-[13px] font-medium transition-colors duration-200',
                  tab === t ? 'bg-white text-text-primary font-semibold shadow-sm' : 'text-text-tertiary',
                )}
              >
                {t === 'DONE' ? '완료' : '예정'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          {Object.keys(grouped).length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-text-tertiary">리턴 내역이 없어요</p>
            </div>
          )}
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dateItems]) => (
              <div key={date}>
                <p className="px-4 pt-4 pb-1 text-sm text-text-tertiary">{date}</p>
                {dateItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.status === 'DONE' ? `/return-plan/result/${item.id}` : `/return-plan/pending/${item.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 text-left"
                  >
                    <LogoAvatar logoUrl={item.logoUrl} ticker={item.ticker} />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-text-primary">{item.name}</p>
                      <p className="text-sm text-text-tertiary">{item.ticker} · {item.date}</p>
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

      {/* ViewMode Sheet */}
      <>
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
            viewModeOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setViewModeOpen(false)}
        />
        <div
          className={cn(
            'fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-[60] transition-transform duration-300 ease-out',
            viewModeOpen ? 'translate-y-0' : 'translate-y-[calc(100%+1rem)] pointer-events-none'
          )}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <div className="px-5 pb-7 pt-3 flex flex-col gap-2">
            <p className="text-sm font-bold text-text-primary mb-2">조회 기준 선택</p>
            <button
              onClick={() => { setViewMode('all'); setViewModeOpen(false); }}
              className="w-full py-4 text-left text-base font-semibold text-text-primary border-b border-surface-bg flex items-center justify-between"
            >
              전체
              {viewMode === 'all' && <Check size={20} className="text-primary" />}
            </button>
            <button
              onClick={() => { setViewMode('monthly'); setViewModeOpen(false); }}
              className="w-full py-4 text-left text-base font-semibold text-text-primary flex items-center justify-between"
            >
              월별
              {viewMode === 'monthly' && <Check size={20} className="text-primary" />}
            </button>
          </div>
        </div>
      </>
    </div>
  )
}
