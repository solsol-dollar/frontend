import { ChevronDown } from 'lucide-react'
import { SolBankLogo } from './SolBankLogo'
import type { TxItem, TxGroup } from '@/features/home/types/transaction'

export type { TxItem, TxGroup }

interface Props {
  groups: TxGroup[]
  showFilter?: boolean
  filter?: string
  onFilterClick?: () => void
}

export function TransactionList({ groups, showFilter, filter, onFilterClick }: Props) {
  return (
    <>
      {groups.length === 0 ? (
        <>
          {showFilter && (
            <div className="flex items-center justify-end px-5 py-5">
              <button onClick={onFilterClick} className="flex items-center gap-0.5 text-sm text-text-sub">
                <span>{filter}</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}
          <div className="flex flex-col items-center justify-center py-12 pb-20">
            <p className="text-sm text-text-tertiary">거래 내역이 없어요</p>
          </div>
        </>
      ) : (
        <div className="pb-6">
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
                    <p className="text-sm font-medium text-text-primary flex items-center min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.label && <span className="flex-shrink-0">{item.label}</span>}
                    </p>
                    <p className="text-xs text-text-tertiary">{item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {item.amount > 0 ? '+' : '-'}$ {Math.abs(item.amount).toFixed(2)}
                    </p>
                    {item.balance !== undefined && (
                      <p className="text-xs text-text-tertiary">${item.balance.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
