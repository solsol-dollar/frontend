import { useCallback, useRef, useState, type ReactNode } from 'react'
import archiveTickIcon from '@/assets/common/archive-tick.svg'
import { ZONE_COLORS } from '../constants'
import { useReturnPlanPresets } from '../hooks/useReturnPlanPresets'

const FALLBACK_PRESETS = [
  { presetName: '투자 집중', securitiesRatio: 70, savingsRatio: 20, accountRatio: 10 },
  { presetName: '안정 저축', securitiesRatio: 10, savingsRatio: 70, accountRatio: 20 },
  { presetName: '균형 분배', securitiesRatio: 34, savingsRatio: 33, accountRatio: 33 },
]
const TOOLTIP_COLOR = '#6366F1'

const formatDollar = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function DualRangeSlider({
  values,
  onChange,
}: {
  values: [number, number]
  onChange: (values: [number, number]) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<0 | 1 | null>(null)
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const { data: presetData } = useReturnPlanPresets()
  const presets = presetData ?? FALLBACK_PRESETS

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || draggingRef.current === null) return
      const rect = track.getBoundingClientRect()
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
      const idx = draggingRef.current
      onChange(idx === 0 ? [Math.min(pct, values[1] - 5), values[1]] : [values[0], Math.max(pct, values[0] + 5)])
    },
    [values, onChange],
  )

  const handlePointerDown = (idx: 0 | 1) => (e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedZone(null)
    draggingRef.current = idx
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handleTrackPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current
    if (!track) return
    setSelectedZone(null)
    const rect = track.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const idx: 0 | 1 = Math.abs(pct - values[0]) <= Math.abs(pct - values[1]) ? 0 : 1
    draggingRef.current = idx
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current === null) return
    updateFromClientX(e.clientX)
  }
  const handlePointerUp = () => {
    draggingRef.current = null
  }

  return (
    <div>
      <div className="flex p-1 rounded-full bg-surface-bg mb-12">
        {presets.map((preset, i) => (
          <button
            key={preset.presetName}
            type="button"
            onClick={() => {
              setSelectedZone(i)
              onChange([preset.securitiesRatio, Math.min(100, preset.securitiesRatio + preset.savingsRatio)])
            }}
            className={
              i === selectedZone
                ? 'flex-1 text-center text-sm font-bold text-text-primary py-2.5 rounded-full bg-white shadow-sm'
                : 'flex-1 text-center text-sm font-medium text-text-secondary py-2.5'
            }
          >
            {preset.presetName}
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        className="relative h-2.5 rounded-full mx-2.5 touch-none select-none"
        style={{
          background: `linear-gradient(to right, ${ZONE_COLORS[0]} 0%, ${ZONE_COLORS[0]} ${values[0]}%, ${ZONE_COLORS[1]} ${values[0]}%, ${ZONE_COLORS[1]} ${values[1]}%, ${ZONE_COLORS[2]} ${values[1]}%, ${ZONE_COLORS[2]} 100%)`,
        }}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {values.map((v, idx) => (
          <div key={idx} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${v}%` }}>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
              <span
                className="text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                style={{ backgroundColor: TOOLTIP_COLOR }}
              >
                드래그!
              </span>
              <span className="w-2 h-2 -mt-1 rotate-45" style={{ backgroundColor: TOOLTIP_COLOR }} />
            </div>
            <button
              type="button"
              onPointerDown={handlePointerDown(idx as 0 | 1)}
              className="w-8 h-8 -m-1.5 flex items-center justify-center touch-none"
              aria-label={idx === 0 ? '왼쪽 경계 드래그' : '오른쪽 경계 드래그'}
            >
              <span className="w-5 h-5 rounded-full bg-white border-2 border-border shadow pointer-events-none" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


export interface AllocationAccount {
  id: string
  name: string
  nameLines?: [string, string]
  desc: string
  badge?: string
}

interface SliderProps {
  accounts: [AllocationAccount, AllocationAccount, AllocationAccount]
  splits: [number, number]
  onSplitsChange: (splits: [number, number]) => void
}


export function AllocationSplitSlider({ accounts, splits, onSplitsChange }: SliderProps) {
  return (
    <>
      <DualRangeSlider values={splits} onChange={onSplitsChange} />

      <div className="flex items-center justify-center gap-4 mt-5">
        {accounts.map((acc, i) => (
          <div key={acc.id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
            {acc.nameLines ? (
              <span className="text-xs text-text-secondary leading-tight">
                {acc.nameLines[0]}
                <br />
                {acc.nameLines[1]}
              </span>
            ) : (
              <span className="text-xs text-text-secondary">{acc.name}</span>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

interface AccountListProps {
  accounts: [AllocationAccount, AllocationAccount, AllocationAccount]
  totalAmount: number
  splits: [number, number]
  onSplitsChange: (splits: [number, number]) => void
  bankIconSrc: string
}

export function AllocationSplitAccountList({
  accounts,
  totalAmount,
  splits,
  bankIconSrc,
}: Omit<AccountListProps, 'onSplitsChange'>) {
  const [unit, setUnit] = useState<'dollar' | 'percent'>('dollar')

  const r0 = Math.round(splits[0])
  const r1 = Math.round(splits[1] - splits[0])
  const ratios = [r0, r1, 100 - r0 - r1]

  return (
    <>
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl">
        <span className="text-sm font-semibold text-text-primary">계좌별 분배 금액</span>
        <div className="flex items-center gap-0.5 p-0.5 bg-white rounded-full flex-shrink-0">
          <button
            type="button"
            onClick={() => setUnit('dollar')}
            className={
              unit === 'dollar'
                ? 'w-5 h-5 rounded-full bg-text-primary text-white flex items-center justify-center text-[10px] font-semibold'
                : 'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-text-tertiary'
            }
          >
            $
          </button>
          <button
            type="button"
            onClick={() => setUnit('percent')}
            className={
              unit === 'percent'
                ? 'w-5 h-5 rounded-full bg-text-primary text-white flex items-center justify-center text-[10px] font-semibold'
                : 'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-text-tertiary'
            }
          >
            %
          </button>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {accounts.map((acc, i) => {
          const amountValue = (totalAmount * ratios[i]) / 100
          const amount = formatDollar(amountValue)
          return (
            <div key={acc.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white">
              <img src={bankIconSrc} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{acc.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-text-tertiary truncate">{acc.desc}</p>
                  {acc.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-semibold flex-shrink-0">
                      {acc.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm font-semibold" style={{ color: ZONE_COLORS[i] }}>
                  {unit === 'percent' ? amount : `${ratios[i]}%`}
                </span>
                <span className="text-lg font-bold" style={{ color: ZONE_COLORS[i] }}>
                  {unit === 'percent' ? `${ratios[i]}%` : amount}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

interface ReturnPlanAllocationSectionProps extends AccountListProps {
  description: ReactNode
}

export function ReturnPlanAllocationSection({
  description,
  accounts,
  totalAmount,
  splits,
  onSplitsChange,
  bankIconSrc,
}: ReturnPlanAllocationSectionProps) {
  return (
    <>
      <section className="px-4 py-5 bg-white">
        <div className="flex items-start gap-2 mb-5">
          <img src={archiveTickIcon} alt="" className="w-3 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-text-primary">리턴 플랜으로 SOLSOL하게 투자하기</p>
            <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
          </div>
        </div>

        <AllocationSplitSlider accounts={accounts} splits={splits} onSplitsChange={onSplitsChange} />
      </section>

      <section className="px-4 py-5 bg-surface-bg">
        <AllocationSplitAccountList
          accounts={accounts}
          totalAmount={totalAmount}
          splits={splits}
          bankIconSrc={bankIconSrc}
        />
      </section>
    </>
  )
}
