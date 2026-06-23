import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import changeupCard from '@/assets/home/changeup-card.png'
import { FilterSheet } from '../components/FilterSheet'
import { ExchangeSheet } from '../components/ExchangeSheet'
import { TransactionList } from '../components/TransactionList'
import dollarIcon from '@/assets/home/dollar.svg'
import wonIcon from '@/assets/home/won.svg'
import { useTransactions, FILTER_LABEL_TO_API, type ApiFilter } from '@/features/home/hooks/useTransactions'

type AccountType = 'SECURITIES' | 'SAVINGS' | 'DEPOSIT'

interface LocationState {
  accountIds: number[]
  accountName: string
  accountNumber: string
  accountType: AccountType
  usdBalance?: number
  krwBalance?: number
  totalUsdBalance?: number
  balance?: number
}

const FILTER_OPTIONS: Record<AccountType, string[]> = {
  SECURITIES: ['전체', '입금', '출금', '환전'],
  SAVINGS: ['전체', '입금', '출금'],
  DEPOSIT: ['전체', '입금', '출금', '체크카드'],
}

function ActionButtons({ labels, onPress }: { labels: [string, string]; onPress: [() => void, () => void] }) {
  return (
    <div className="flex bg-surface-neutral rounded-xl overflow-hidden">
      <button onClick={onPress[0]} className="flex-1 py-3 text-sm text-text-sub">{labels[0]}</button>
      <div className="w-px bg-border my-2" />
      <button onClick={onPress[1]} className="flex-1 py-2.5 text-sm text-text-sub">{labels[1]}</button>
    </div>
  )
}

export function TransferHistoryPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const {
    accountIds = [],
    accountName = 'CMA 계좌',
    accountNumber = '',
    accountType = 'SECURITIES',
    usdBalance,
    krwBalance,
    totalUsdBalance,
    balance,
  } = (state as LocationState) ?? {}

  const [filterLabel, setFilterLabel] = useState('전체')
  const [showFilter, setShowFilter] = useState(false)
  const [showExchange, setShowExchange] = useState(false)

  const apiFilter: ApiFilter = FILTER_LABEL_TO_API[filterLabel] ?? 'ALL'
  const { data: groups = [] } = useTransactions(accountIds, apiFilter)
  const filterOptions = FILTER_OPTIONS[accountType]

  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header showBack title="송금 내역" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5">

          {accountType === 'SECURITIES' ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-medium text-text-primary">{accountName}</span>
                <span className="text-sm text-text-tertiary">{accountNumber}</span>
              </div>
              <p className="text-3xl font-semibold text-text-primary mb-4">
                ${(totalUsdBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <ActionButtons
                labels={['옮기기', '환전']}
                onPress={[
                  () => navigate('/home/transfer', { state: { sourceName: accountName, sourceBalance: `$${(totalUsdBalance ?? 0).toFixed(2)}` } }),
                  () => setShowExchange(true),
                ]}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 rounded-xl px-2 py-3">
                  <div className="p-3 rounded-xl bg-surface-neutral">
                    <img className="w-6" src={wonIcon} alt="원화 아이콘" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-sub">원화</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {(krwBalance ?? 0).toLocaleString('ko-KR')}원
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-2 py-3">
                  <div className="p-3 rounded-xl bg-surface-neutral">
                    <img className="w-6" src={dollarIcon} alt="달러 아이콘" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-sub">달러</span>
                    <span className="text-sm font-semibold text-text-primary">
                      ${(usdBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  () => navigate('/home/fill', { state: { destName: accountName, destBalance: `$${balance}` } }),
                  () => navigate('/home/transfer', { state: { sourceName: accountName, sourceBalance: `$${balance}` } }),
                ]}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-medium text-text-primary">{accountName}</span>
                <span className="text-xs font-semibold text-primary bg-surface rounded-xl px-2 py-1">적금</span>
              </div>
              <p className="text-sm text-text-tertiary mb-2">{accountNumber}</p>
              <p className="text-3xl font-semibold text-text-primary">
                ${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
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
        </div>
      </div>

      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        options={filterOptions}
        selected={filterLabel}
        onSelect={setFilterLabel}
      />
      <ExchangeSheet open={showExchange} onClose={() => setShowExchange(false)} />
    </div>
  )
}
