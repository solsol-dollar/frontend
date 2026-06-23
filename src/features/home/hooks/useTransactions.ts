import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/lib/axios'
import type { TxGroup } from '@/features/home/types/transaction'

export type ApiFilter = 'ALL' | 'IN' | 'OUT' | 'EXCHANGE' | 'CARD'

export const FILTER_LABEL_TO_API: Record<string, ApiFilter> = {
  전체: 'ALL',
  입금: 'IN',
  출금: 'OUT',
  환전: 'EXCHANGE',
  체크카드: 'CARD',
}

interface AccountRef {
  accountId: number
  accountName: string
  accountNumberMasked: string
  institutionName: string
}

interface Transaction {
  id: number
  type: 'IN' | 'OUT' | 'EXCHANGE' | 'CARD'
  amount: number
  currency: string
  status: string
  executedAt: string
  fromAccount: AccountRef | null
  toAccount: AccountRef | null
  fromCurrency: string | null
  toCurrency: string | null
  exchangeRate: number | null
  sourceAmount: number | null
  targetAmount: number | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const CURRENCY_LABEL: Record<string, string> = { KRW: '원화', USD: '달러' }

function currencyLabel(code: string | null): string {
  return code ? (CURRENCY_LABEL[code] ?? code) : ''
}

function getTxDisplay(tx: Transaction): { name: string; label: string } {
  if (tx.type === 'EXCHANGE')
    return { name: `${currencyLabel(tx.fromCurrency)} → ${currencyLabel(tx.toCurrency)}`, label: '' }
  if (tx.type === 'IN')
    return { name: tx.fromAccount?.accountName ?? '', label: '에서 입금' }
  if (tx.type === 'CARD')
    return { name: tx.fromAccount?.accountName ?? '', label: ' 카드결제' }
  return { name: tx.toAccount?.accountName ?? '', label: '으로 출금' }
}

function getTxAmount(tx: Transaction): number {
  if (tx.type === 'IN') return tx.amount
  if (tx.type === 'EXCHANGE') return tx.targetAmount ?? tx.amount
  return -tx.amount
}

const TYPE_LABEL = { IN: '입금', OUT: '출금', EXCHANGE: '환전', CARD: '체크카드' } as const

function groupByDate(txList: Transaction[]): TxGroup[] {
  const map = new Map<string, TxGroup>()
  for (const tx of txList) {
    const isoDate = tx.executedAt.substring(0, 10)
    const displayDate = formatDate(tx.executedAt)
    if (!map.has(isoDate)) map.set(isoDate, { date: displayDate, items: [] })
    const { name, label } = getTxDisplay(tx)
    map.get(isoDate)!.items.push({
      id: tx.id,
      name,
      label,
      time: formatTime(tx.executedAt),
      amount: getTxAmount(tx),
      type: TYPE_LABEL[tx.type],
    })
  }
  return Array.from(map.values())
}

export function useTransactions(accountIds: number[], filter: ApiFilter) {
  return useQuery({
    queryKey: ['transactions', accountIds, filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      accountIds.forEach((id) => params.append('accountId', String(id)))
      if (filter !== 'ALL') params.set('filter', filter)
      const res = (await ledgerApi.get(`/api/ledger/api/v1/transactions?${params}`)) as unknown as {
        data: Transaction[]
      }
      return groupByDate(res.data)
    },
    enabled: accountIds.length > 0,
  })
}
