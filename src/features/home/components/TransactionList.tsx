import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      {showFilter && (
        <div className="flex items-center px-5 pt-6 pb-6">
          <button onClick={onFilterClick} className="flex items-center gap-0.5 text-sm text-text-sub">
            <span>{filter}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}
      {groups.length === 0 ? (
        <div className={`flex flex-col items-center justify-center pb-20 ${showFilter ? 'pt-8' : 'pt-20'}`}>
          <p className="text-sm text-text-tertiary">거래 내역이 없어요</p>
        </div>
      ) : (
        <div className={cn('pb-6', !showFilter && 'pt-6')}>
          {groups.flatMap((group) =>
            group.items.map((item, idx) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-2.5">
                <span className="w-9 text-xs text-text-tertiary pt-0.5 flex-shrink-0">
                  {idx === 0 ? group.date : ''}
                </span>
                <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.name}{item.label ? ` ${item.label}` : ''}
                    </p>
                    <p className="text-xs text-text-tertiary">{item.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-sm font-semibold', item.amount > 0 ? 'text-primary' : 'text-text-primary')}>
                      {item.currency === 'KRW'
                        ? `${item.amount > 0 ? '+' : ''}${item.amount.toLocaleString('ko-KR')}원`
                        : `${item.amount > 0 ? '+' : ''}$${item.amount.toFixed(2)}`}
                    </p>
                    {item.balance !== undefined && (
                      <p className="text-xs text-text-tertiary">${item.balance.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
