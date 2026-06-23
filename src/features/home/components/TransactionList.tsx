import { ChevronDown } from 'lucide-react'
import { SolBankLogo } from './SolBankLogo'

export interface TxItem {
  id: number
  name: string
  time: string
  amount: number
  balance: number
  type: '입금' | '출금' | '체크카드'
}

export interface TxGroup {
  date: string
  items: TxItem[]
}

interface Props {
  groups: TxGroup[]
  showFilter?: boolean
  filter?: string
  onFilterClick?: () => void
}

export function TransactionList({ groups, showFilter, filter, onFilterClick }: Props) {
  return (
    <>
      {groups.map((group, gi) => (
        <div key={group.date}>
          <div className="flex items-center justify-between px-5 py-5">
            <span className="text-sm font-light text-text-sub">{group.date}</span>
            {showFilter && gi === 0 && (
              <button onClick={onFilterClick} className="flex items-center gap-0.5 text-sm text-text-sub">
                <span>{filter}</span>
                <ChevronDown size={14} />
              </button>
            )}
          </div>
          {group.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <SolBankLogo />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-tertiary">{item.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">
                  {item.amount > 0 ? '+' : '-'}$ {Math.abs(item.amount).toFixed(2)}
                </p>
                <p className="text-xs text-text-tertiary">${item.balance.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
