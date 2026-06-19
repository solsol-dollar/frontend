import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const CONSENTS = [
  { id: 'virtual', label: '증권계좌에 연결된 가상계좌 발급에 동의합니다 (필수)' },
  { id: 'data', label: '그룹사 서비스 연동을 위한 데이터 공유에 동의합니다 (필수)' },
]

function ConsentCircle({ checked }: { checked: boolean }) {
  return checked ? (
    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ) : (
    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
  )
}

interface Props {
  onConfirm: () => void
  onClose: () => void
}

export function ConsentSheet({ onConfirm, onClose }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [visible, setVisible] = useState(false)
  const allChecked = CONSENTS.every((c) => checked.has(c.id))

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(rafId)
  }, [])

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(CONSENTS.map((c) => c.id)))
  }

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-t-3xl pt-4 transition-transform duration-300 ease-out',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-6">
          <button onClick={toggleAll} className="w-full flex items-center gap-3 py-3">
            <ConsentCircle checked={allChecked} />
            <span className="text-sm font-semibold text-text-primary">모두 동의합니다</span>
          </button>

          <div className="mt-2 space-y-3 pb-6">
            {CONSENTS.map((c) => (
              <button key={c.id} onClick={() => toggle(c.id)} className="w-full flex items-center gap-3 py-1">
                <ConsentCircle checked={checked.has(c.id)} />
                <span className="text-xs text-text-secondary text-left">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={!allChecked}
          className="w-full bg-primary text-white py-4 font-semibold text-base disabled:opacity-40 transition-opacity"
        >
          완료
        </button>
      </div>
    </div>
  )
}
