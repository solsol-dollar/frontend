import { useEffect, useRef, useState } from 'react'
import { Header } from '@/components/common/Header'
import { useNotificationSettings, useUpdateNotificationSettings } from '@/features/mypage/hooks/useMyPage'

const ITEMS = [
  { key: 'ipoAllocationEnabled', label: '배정 결과 알림', desc: '상장일 당일 배정 결과' },
  { key: 'ipoRefundEnabled', label: '환불금 입금 알림', desc: '미배정 환불금 입금 시' },
  { key: 'idleDollarEnabled', label: '쉬는 달러 감지', desc: '30일 이상 유휴 달러 감지 시' },
] as const

type SettingKey = 'ipoAllocationEnabled' | 'ipoRefundEnabled' | 'idleDollarEnabled'

export function NotificationSettingsPage() {
  const { data } = useNotificationSettings()
  const update = useUpdateNotificationSettings()

  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    ipoAllocationEnabled: true,
    ipoRefundEnabled: true,
    idleDollarEnabled: true,
  })

  const initialized = useRef(false)

  useEffect(() => {
    if (data && !initialized.current) {
      initialized.current = true
      setSettings({
        ipoAllocationEnabled: data.ipoAllocationEnabled,
        ipoRefundEnabled: data.ipoRefundEnabled,
        idleDollarEnabled: data.idleDollarEnabled,
      })
    }
  }, [data])

  const allEnabled = ITEMS.every((item) => settings[item.key])

  const toggle = (key: SettingKey | 'all') => {
    const prev = { ...settings }
    let next: Record<SettingKey, boolean>
    if (key === 'all') {
      const val = !allEnabled
      next = { ipoAllocationEnabled: val, ipoRefundEnabled: val, idleDollarEnabled: val }
    } else {
      next = { ...settings, [key]: !settings[key] }
    }
    setSettings(next)
    update.mutate(next, { onError: (err) => { console.error('[알림설정 실패]', err); setSettings(prev) } })
  }

  const rows = [
    { id: 'all', label: '전체 알림 허용', desc: '모든 알림을 켜거나 끌 수 있어요', checked: allEnabled },
    ...ITEMS.map((item) => ({ id: item.key, label: item.label, desc: item.desc, checked: settings[item.key] })),
  ]

  return (
    <div className="mobile-container">
      <Header showBack showNotification={false} showMypage={false} centerContent={<span className="text-base font-bold text-text-primary">알림 설정</span>} />

      <div className="bg-[#F6F6F9] min-h-screen">
        {rows.map((s) => (
          <div key={s.id} className={`flex items-center justify-between px-4 py-5 border-b border-border ${s.id === 'all' ? 'bg-white' : 'bg-[#F6F6F9]'}`}>
            <div>
              <p className="text-sm font-semibold text-text-primary">{s.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{s.desc}</p>
            </div>
            <button
              onClick={() => toggle(s.id as SettingKey | 'all')}
              className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 overflow-hidden ${s.checked ? 'bg-primary' : 'bg-border'}`}
            >
              <span
                className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform ${s.checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
