import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

function shuffle(arr: number[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface Props {
  onEnter: (pin: string) => void
  onBack: () => void
  error?: string | null
}

export function PinKeypad({ onEnter, onBack, error }: Props) {
  const [pin, setPin] = useState<number[]>([])
  const [nums, setNums] = useState(() => shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))

  const reshuffle = useCallback(() => setNums(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])), [])

  const handleKey = (k: number | '재배열' | '←') => {
    if (k === '재배열') { reshuffle(); return }
    if (k === '←') {
      setPin(prev => prev.slice(0, -1))
      return
    }
    if (pin.length >= 6) return
    const next = [...pin, k]
    setPin(next)
    if (next.length === 6) {
      onEnter(next.join(''))
    }
  }

  const rows = [nums.slice(0, 3), nums.slice(3, 6), nums.slice(6, 9)]
  const lastRow: (number | '재배열' | '←')[] = ['재배열', nums[9], '←']

  return (
    <div className="mobile-container flex flex-col h-screen">
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-primary">신한인증서</h2>
            <p className="text-sm text-text-secondary mt-2">비밀번호를 입력해주세요.</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-4 h-4 rounded-full border-2',
                    error ? 'bg-red-400 border-red-400' : i < pin.length ? 'bg-primary border-primary' : 'border-gray-300',
                  )}
                />
              ))}
            </div>
            <div className="h-6 flex items-center mt-3">
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className="py-5 flex items-center justify-center"
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full text-white text-2xl font-light">
                  {k}
                </span>
              </button>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-3">
          {lastRow.map((k, i) => (
            <button
              key={i}
              onClick={() => handleKey(k)}
              className="py-5 flex items-center justify-center group"
            >
              <span className="w-14 h-14 flex items-center justify-center rounded-full text-white text-xl font-light group-active:bg-white/20 transition-colors">
                {k}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
