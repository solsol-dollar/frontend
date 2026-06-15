import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function SubscribeExchangePage() {
  const navigate = useNavigate()
  useParams()

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header showBack title="청약 신청" showNotification={false} showMypage={false} />

      <div className="flex-1 px-4 pt-6 space-y-4">
        <div>
          <p className="text-sm text-text-secondary mb-1">청약신청금액</p>
          <p className="text-2xl font-bold text-text-primary">USD 20,000</p>
        </div>

        <div className="space-y-2 text-sm">
          {[
            { label: '청약시작일', value: '2026.06.24 청약시작일' },
            { label: '청약마감일', value: '2026.06.24 청약마감일' },
            { label: '청약대금납부', value: '2026.06.25 청약대금납부' },
            { label: '상장/환불예정일', value: '2026.06.30 청약/환불예정일' },
          ].map((row) => (
            <div key={row.label} className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-text-secondary">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-surface rounded-2xl space-y-2">
          <p className="text-sm text-text-secondary">예상 리턴금액</p>
          <p className="text-2xl font-bold text-up">$2,084,455</p>
          <p className="text-xs text-text-tertiary">이 금액 한도로 가능해요</p>

          <div className="pt-3 border-t border-border space-y-1.5 text-sm">
            {[
              { label: 'Cost Fee', value: '$10,980,000' },
              { label: 'USD에 청약 시 지원금액', value: '$10,980,000' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-text-secondary">{r.label}</span>
                <span className="font-medium text-text-primary">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between text-sm border-t border-border pt-3">
          <span className="text-text-secondary">청약신청금액</span>
          <span className="font-bold text-text-primary">USD 20,000</span>
        </div>
      </div>

      <div className="px-4 pb-8 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-semibold"
        >
          취소
        </button>
        <button
          onClick={() => navigate(`/ipo`)}
          className="flex-1 bg-primary text-white py-4 rounded-xl font-semibold"
        >
          청약신청
        </button>
      </div>
    </div>
  )
}
