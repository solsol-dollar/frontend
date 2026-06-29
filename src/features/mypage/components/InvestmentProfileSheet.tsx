import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

function RadioCircle({ checked }: { checked: boolean }) {
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
  onConfirm: (data: { hope: string; provide: string }) => void
  onClose: () => void
}

export function InvestmentProfileSheet({ onConfirm, onClose }: Props) {
  const [hope, setHope] = useState<string | null>(null)
  const [provide, setProvide] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(rafId)
  }, [])

  const canSubmit = hope !== null && provide !== null

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-t-3xl pt-4 transition-transform duration-300 ease-out flex flex-col w-full max-w-[500px] mx-auto',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-center mb-5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-6 pb-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-text-primary leading-snug mb-3">
            투자권유 희망 및<br />투자자 정보 제공 여부 확인
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-8">
            금융소비자 보호에 관한 법률에 따라 고객의 투자자정보를 파악하여, 그에 적합한 투자권유를 하기 위한 기초자료로 활용됩니다.
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-text-primary mb-3">투자 희망여부</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setHope('HOPE')} className="w-full flex items-center gap-3 py-1">
                  <RadioCircle checked={hope === 'HOPE'} />
                  <span className="text-sm text-text-primary">투자권유 희망</span>
                </button>
                <button onClick={() => setHope('NOT_HOPE')} className="w-full flex items-center gap-3 py-1">
                  <RadioCircle checked={hope === 'NOT_HOPE'} />
                  <span className="text-sm text-text-primary">투자권유 미희망</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div>
              <p className="text-sm font-semibold text-text-primary mb-3">투자자정보 제공여부</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setProvide('PROVIDE')} className="w-full flex items-center gap-3 py-1">
                  <RadioCircle checked={provide === 'PROVIDE'} />
                  <span className="text-sm text-text-primary">투자정보 제공</span>
                </button>
                <button onClick={() => setProvide('NOT_PROVIDE')} className="w-full flex items-center gap-3 py-1">
                  <RadioCircle checked={provide === 'NOT_PROVIDE'} />
                  <span className="text-sm text-text-primary">투자정보 미제공</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (canSubmit) {
              onConfirm({ hope, provide })
            }
          }}
          disabled={!canSubmit}
          className="w-full bg-primary text-white py-4 font-semibold text-base disabled:opacity-40 transition-opacity flex-shrink-0"
        >
          투자성향 진단 완료
        </button>
      </div>
    </div>
  )
}
