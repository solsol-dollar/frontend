import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import changeupCard from '@/assets/home/changeup-card.png'
import { FilterSheet } from '../components/FilterSheet'
import { ExchangeSheet } from '../components/ExchangeSheet'
import { TransactionList, type TxGroup } from '../components/TransactionList'
import dollarIcon from '@/assets/home/dollar.svg';
import wonIcon from '@/assets/home/won.svg';

type AccountType = 'cma' | 'valueup' | 'changeup'

const CMA_TX: TxGroup[] = [
  {
    date: '6월 13일',
    items: [
      { id: 1, name: 'Value-up 외화적립예금', time: '18:45', amount: -30, balance: 700, type: '출금' },
      { id: 2, name: 'Value-up 외화적립예금', time: '17:20', amount: 50, balance: 730, type: '입금' },
    ],
  },
  {
    date: '6월 12일',
    items: [
      { id: 3, name: 'Value-up 외화적립예금', time: '14:10', amount: 100, balance: 680, type: '입금' },
      { id: 4, name: 'Value-up 외화적립예금', time: '09:33', amount: -30, balance: 580, type: '출금' },
    ],
  },
]

const VALUEUP_TX: TxGroup[] = [
  {
    date: '6월 13일',
    items: [
      { id: 1, name: 'Value-up 외화적립예금', time: '18:45', amount: 30, balance: 700, type: '입금' },
      { id: 2, name: 'Value-up 외화적립예금', time: '18:45', amount: 30, balance: 670, type: '입금' },
    ],
  },
  {
    date: '6월 12일',
    items: [
      { id: 3, name: 'Value-up 외화적립예금', time: '18:45', amount: 30, balance: 640, type: '입금' },
      { id: 4, name: 'Value-up 외화적립예금', time: '18:45', amount: 30, balance: 610, type: '입금' },
      { id: 5, name: 'Value-up 외화적립예금', time: '18:45', amount: 30, balance: 580, type: '입금' },
    ],
  },
]

const CHANGEUP_TX: TxGroup[] = [
  {
    date: '6월 13일',
    items: [
      { id: 1, name: 'Value-up 외화적립예금', time: '18:45', amount: -30, balance: 700, type: '출금' },
      { id: 2, name: 'Value-up 외화적립예금', time: '17:00', amount: 50, balance: 730, type: '입금' },
      { id: 3, name: '신한카드 Change-up', time: '15:22', amount: -12, balance: 680, type: '체크카드' },
    ],
  },
  {
    date: '6월 12일',
    items: [
      { id: 4, name: 'Value-up 외화적립예금', time: '11:05', amount: -30, balance: 692, type: '출금' },
      { id: 5, name: '신한카드 Change-up', time: '09:40', amount: -8, balance: 722, type: '체크카드' },
    ],
  },
]

function filterGroups(groups: TxGroup[], filter: string): TxGroup[] {
  if (filter === '전체') return groups
  return groups
    .map((g) => ({ ...g, items: g.items.filter((item) => item.type === filter) }))
    .filter((g) => g.items.length > 0)
}

function ActionButtons({ labels, onPress }: { labels: [string, string]; onPress: [() => void, () => void] }) {
  return (
    <div className="flex  bg-surface-neutral rounded-xl overflow-hidden">
      <button onClick={onPress[0]} className="flex-1 py-3 text-sm text-text-sub">
        {labels[0]}
      </button>
      <div className="w-px bg-border my-2" />
      <button onClick={onPress[1]} className="flex-1 py-2.5 text-sm text-text-sub">
        {labels[1]}
      </button>
    </div>
  )
}

function CmaPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('전체')
  const [showFilter, setShowFilter] = useState(false)
  const [showExchange, setShowExchange] = useState(false)

  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header showBack title="송금 내역" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-medium text-text-primary">CMA 계좌</span>
            <span className="text-sm text-text-tertiary">270-1645-275-43</span>
          </div>
          <p className="text-3xl font-semibold text-text-primary mb-4">$ 700.00</p>
          <ActionButtons
            labels={['옮기기', '환전']}
            onPress={[
              () => navigate('/home/transfer', { state: { sourceName: 'CMA 계좌', sourceBalance: '$ 700.00' } }),
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
                <span className="text-sm font-semibold text-text-primary">100,000원</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-2 py-3">
              <div className="p-3 rounded-xl bg-surface-neutral">
                <img className="w-6" src={dollarIcon} alt="달러 아이콘" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-text-sub">달러</span>
                <span className="text-sm font-semibold text-text-primary">$300.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
          <TransactionList groups={filterGroups(CMA_TX, filter)} showFilter filter={filter} onFilterClick={() => setShowFilter(true)} />
        </div>
      </div>

      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        options={['전체', '입금', '출금']}
        selected={filter}
        onSelect={setFilter}
      />
      <ExchangeSheet
        open={showExchange}
        onClose={() => setShowExchange(false)}
      />
    </div>
  )
}

function ValueupPage() {
  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header showBack title="송금 내역" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-base font-medium text-text-primary">신한 Value-up 외화적립예금</span>
            <span className="text-xs font-semibold text-primary bg-surface rounded-xl px-2 py-1">D-32</span>
          </div>
          <p className="text-sm text-text-tertiary mb-2">270-1645-9275-43</p>
          <p className="text-3xl font-semibold text-text-primary">$ 700.00</p>
        </div>

        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
          <TransactionList groups={VALUEUP_TX} />
        </div>
      </div>
    </div>
  )
}

function ChangeupPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('전체')
  const [showFilter, setShowFilter] = useState(false)

  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header showBack title="송금 내역" showNotification={false} showMypage={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-base font-medium text-text-primary">신한 외화 체인지업 예금</p>
              <p className="text-sm text-text-tertiary mb-3">270-1645-9275-43</p>
              <p className="text-3xl font-semibold text-text-primary mb-4">$ 700.00</p>
            </div>
            <div className='p-4 bg-surface-light rounded-full'>
            <img src={changeupCard} alt="카드" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <ActionButtons
            labels={['채우기', '옮기기']}
            onPress={[
              () => navigate('/home/fill', { state: { destName: '신한 외화 체인지업 예금', destBalance: '$3,850.50' } }),
              () => navigate('/home/transfer', { state: { sourceName: '신한 외화 체인지업 예금', sourceBalance: '$3,850.50' } }),
            ]}
          />
        </div>

        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
          <TransactionList groups={filterGroups(CHANGEUP_TX, filter)} showFilter filter={filter} onFilterClick={() => setShowFilter(true)} />
        </div>
      </div>

      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        options={['전체', '입금', '출금', '체크카드']}
        selected={filter}
        onSelect={setFilter}
      />
    </div>
  )
}

export function TransferHistoryPage() {
  const { state } = useLocation()
  const accountType: AccountType = state?.accountType ?? 'cma'

  if (accountType === 'valueup') return <ValueupPage />
  if (accountType === 'changeup') return <ChangeupPage />
  return <CmaPage />
}
