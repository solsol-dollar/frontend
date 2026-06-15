import { useState } from 'react'
import { Header } from '@/components/common/Header'

const SETTINGS = [
  { id: 'all', label: '전체 알림 허용', desc: '모든 알림을 켜거나 끌 수 있어요' },
  { id: 'allocation', label: '배정 결과 알림', desc: '상장일 당일 배정 결과' },
  { id: 'refund', label: '환불금 입금 알림', desc: '미배정 환불금 입금 시' },
  { id: 'sleeping', label: '쉬는 달러 감지', desc: '30일 이상 유휴 달러 감지 시' },
]

export function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.map((s) => [s.id, true]))
  )

  const toggle = (id: string) => {
    if (id === 'all') {
      const next = !enabled.all
      setEnabled(Object.fromEntries(SETTINGS.map((s) => [s.id, next])))
    } else {
      setEnabled((e) => ({ ...e, [id]: !e[id] }))
    }
  }

  return (
    <div className="mobile-container">
      <Header showBack title="알림설정" showNotification={false} showMypage={false} />

      <div className="px-4 pt-4 space-y-0">
        {SETTINGS.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-5 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-text-primary">{s.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{s.desc}</p>
            </div>
            <button
              onClick={() => toggle(s.id)}
              className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                enabled[s.id] ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  enabled[s.id] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
