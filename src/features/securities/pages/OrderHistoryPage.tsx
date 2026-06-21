import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'
import { useOrderHistory } from '../hooks/useOrderHistory'

export function OrderHistoryPage() {
  const { data: orders = [] } = useOrderHistory()

  // 날짜별 그루핑
  const grouped = orders.reduce<Record<string, typeof orders>>((acc, o) => {
    const key = o.date
    if (!acc[key]) acc[key] = []
    acc[key].push(o)
    return acc
  }, {})

  const formatDate = (d: string) => {
    const [, m, day] = d.split('-')
    return `${parseInt(m)}.${parseInt(day)}`
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-bg">
      <Header showBack showNotification={false} showMypage={false} title="주문 내역" />

      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <p className="text-sm font-medium text-text-secondary">주문 내역이 없습니다</p>
            <p className="text-xs text-text-tertiary">구매 또는 판매 후 여기에 표시됩니다</p>
          </div>
        )}
        <div className="bg-white">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="px-4 pt-5 pb-1">
                <span className="text-sm font-medium text-text-tertiary">{formatDate(date)}</span>
              </div>
              {items.map((order) => (
                <div key={order.orderId} className="flex items-center px-4 py-3.5 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{order.productName}</p>
                    <p className={cn(
                      'text-xs mt-0.5',
                      order.orderType === 'BUY' ? 'text-up' : 'text-down',
                    )}>
                      {order.qty}주 {order.orderType === 'BUY' ? '구매' : '판매'} 완료
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">
                      주당 ${order.pricePerShareUsd.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
