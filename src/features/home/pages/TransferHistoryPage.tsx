import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import changeupCard from '@/assets/home/changeup-card.png'
import { FilterSheet } from '../components/FilterSheet'
import { ExchangeSheet } from '../components/ExchangeSheet'
import { TransactionList } from '../components/TransactionList'
import dollarIcon from '@/assets/home/dollar.svg'
import wonIcon from '@/assets/home/won.svg'
import { useTransactions, FILTER_LABEL_TO_API, type ApiFilter } from '@/features/home/hooks/useTransactions'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'

type AccountType = 'SECURITIES' | 'SAVINGS' | 'DEPOSIT'

interface LocationState {
  accountIds: number[]
  accountName: string
  accountNumber: string
  accountType: AccountType
  usdBalance?: number
  usdAvailableBalance?: number
  krwBalance?: number
  totalUsdBalance?: number
  balance?: number
  maturityDate?: string | null
  initialFilter?: string
}

function calcDDay(dateStr: string): string {
  const diff = dayjs(dateStr).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diff === 0) return 'D-Day'
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}

const FILTER_OPTIONS: Record<AccountType, string[]> = {
  SECURITIES: ['전체', '입금', '출금', '환전'],
  SAVINGS: ['전체', '입금', '출금'],
  DEPOSIT: ['전체', '입금', '출금', '체크카드'],
}

function ActionButtons({ labels, onPress }: { labels: [string, string]; onPress: [() => void, () => void] }) {
  return (
    <div className="flex bg-surface-bg rounded-xl overflow-hidden">
      <button onClick={onPress[0]} className="flex-1 py-3 text-sm text-text-sub transition-all duration-75 active:scale-[0.97] active:bg-[#E2E4E8]">{labels[0]}</button>
      <div className="w-px bg-border my-2" />
      <button onClick={onPress[1]} className="flex-1 py-2.5 text-sm text-text-sub transition-all duration-75 active:scale-[0.97] active:bg-[#E2E4E8]">{labels[1]}</button>
    </div>
  )
}

export function TransferHistoryPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const {
    accountIds = [],
    accountName = '신한투자증권 CMA 계좌',
    accountNumber = '',
    accountType = 'SECURITIES',
    usdBalance,
    usdAvailableBalance,
    krwBalance,
    totalUsdBalance,
    balance,
    maturityDate,
    initialFilter,
  } = (state as LocationState) ?? {}

  const { data: assets } = useHomeAssets()
  const cmaAccountId = assets?.securities?.usdAccountId
  const cmaBalance = assets?.securities?.usdAvailableBalance ?? 0

  const liveUsdBalance = accountType === 'SECURITIES' ? (assets?.securities?.usdBalance ?? usdBalance) : usdBalance
  const liveKrwBalance = accountType === 'SECURITIES' ? (assets?.securities?.krwBalance ?? krwBalance) : krwBalance
  const liveTotalUsdBalance = accountType === 'SECURITIES' ? (assets?.securities?.totalUsdBalance ?? totalUsdBalance) : totalUsdBalance
  const liveUsdAvailableBalance = accountType === 'SECURITIES' ? (assets?.securities?.usdAvailableBalance ?? usdAvailableBalance) : usdAvailableBalance

  const [filterLabel, setFilterLabel] = useState(initialFilter || '전체')
  const [showFilter, setShowFilter] = useState(false)
  const [showExchange, setShowExchange] = useState(false)

  const apiFilter: ApiFilter = FILTER_LABEL_TO_API[filterLabel] ?? 'ALL'
  const { data: groups = [], fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions(accountIds, apiFilter)

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])
  const filterOptions = FILTER_OPTIONS[accountType]

  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header showBack title="거래 내역" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5">

          {accountType === 'SECURITIES' ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-medium text-text-primary">{accountName}</span>
                <span className="text-sm text-text-tertiary">{accountNumber}</span>
              </div>
              <p className="text-3xl font-semibold text-text-primary mb-4">
                ${(liveTotalUsdBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <ActionButtons
                labels={['옮기기', '환전']}
                onPress={[
                  () => accountIds[0] && navigate('/home/transfer', { state: { fromAccountId: accountIds[0], sourceName: accountName, sourceBalance: `$${(liveUsdAvailableBalance ?? liveUsdBalance ?? 0).toFixed(2)}` } }),
                  () => setShowExchange(true),
                ]}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 rounded-xl px-2 py-3">
                  <div className="p-3 rounded-xl bg-surface-bg">
                    <img className="w-6" src={wonIcon} alt="원화 아이콘" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-sub">원화</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {(liveKrwBalance ?? 0).toLocaleString('ko-KR')}원
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-2 py-3">
                  <div className="p-3 rounded-xl bg-surface-bg">
                    <img className="w-6" src={dollarIcon} alt="달러 아이콘" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-sub">달러</span>
                    <span className="text-sm font-semibold text-text-primary">
                      ${(liveUsdAvailableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : accountType === 'DEPOSIT' ? (
            <>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-base font-medium text-text-primary">{accountName}</p>
                  <p className="text-sm text-text-tertiary mb-3">{accountNumber}</p>
                  <p className="text-3xl font-semibold text-text-primary mb-4">
                    ${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-surface-light rounded-full">
                  <img src={changeupCard} alt="카드" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <ActionButtons
                labels={['채우기', '옮기기']}
                onPress={[
                  () => cmaAccountId && navigate('/home/fill', { state: { fixedFromAccountId: cmaAccountId, fixedFromName: '신한투자증권 CMA 계좌', fixedFromBalance: `$${cmaBalance.toFixed(2)}`, toAccountId: accountIds[0], destName: accountName, destBalance: `$${(balance ?? 0).toFixed(2)}` } }),
                  () => accountIds[0] && navigate('/home/transfer', { state: { fromAccountId: accountIds[0], sourceName: accountName, sourceBalance: `$${(balance ?? 0).toFixed(2)}` } }),
                ]}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-medium text-text-primary">{accountName}</span>
                {maturityDate
                  ? <span className="text-xs font-semibold text-primary bg-surface rounded-xl px-2 py-1">{calcDDay(maturityDate)}</span>
                  : <span className="text-xs font-semibold text-primary bg-surface rounded-xl px-2 py-1">적금</span>
                }
              </div>
              <p className="text-sm text-text-tertiary mb-2">{accountNumber}</p>
              <p className="text-3xl font-semibold text-text-primary mb-4">
                ${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <button
                onClick={() => cmaAccountId && navigate('/home/fill', { state: { fixedFromAccountId: cmaAccountId, fixedFromName: '신한투자증권 CMA 계좌', fixedFromBalance: `$${cmaBalance.toFixed(2)}`, toAccountId: accountIds[0], destName: accountName, destBalance: `$${(balance ?? 0).toFixed(2)}` } })}
                className="w-full py-3 text-sm text-text-sub bg-surface-bg rounded-xl transition-all duration-75 active:scale-[0.97] active:bg-[#E2E4E8] select-none"
              >
                채우기
              </button>
            </>
          )}
        </div>

        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
          <TransactionList
            groups={groups}
            showFilter={accountType !== 'SAVINGS'}
            filter={filterLabel}
            onFilterClick={() => setShowFilter(true)}
          />
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      </div>

      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        options={filterOptions}
        selected={filterLabel}
        onSelect={setFilterLabel}
      />
      <ExchangeSheet open={showExchange} onClose={() => setShowExchange(false)} returnTo="/home/transfer/history" />
    </div>
  )
}
