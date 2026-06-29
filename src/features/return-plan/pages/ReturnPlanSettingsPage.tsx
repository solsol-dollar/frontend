import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import layCharacter from '@/assets/common/lay.png'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { useExecuteImmediateAllocation } from '../hooks/useExecuteImmediateAllocation'
import { splitsToAllocationItems } from '../utils/allocationMapper'
import { ZONE_COLORS } from '../constants'

const PRESETS: { label: string; splits: [number, number] }[] = [
  { label: '투자 집중', splits: [70, 90] },
  { label: '안정 저축', splits: [10, 80] },
  { label: '균형 분배', splits: [33, 66] },
]

function detectPreset(splits: [number, number]): number | null {
  const cma = Math.round(splits[0])
  const savings = Math.round(splits[1] - splits[0])
  if (cma > 50) return 0
  if (savings > 50) return 1
  if (cma >= 25 && cma <= 42 && savings >= 25 && savings <= 42) return 2
  return null
}

const CARD_BG = '#F4F5F8'
const TRACK_COLORS = ['#C5D1F5', '#DFCDFF', '#C8F2FB']

const ACCOUNTS = [
  { id: 'cma',     name: '신한투자증권 CMA 계좌',      desc: '다음 IPO 대기금 · ETF, RP 재투자', legend: 'CMA 계좌',   type: 'CMA' as const },
  { id: 'valueup', name: '신한 Value-up 외화적립예금', desc: '다음 IPO 대기금 · ETF, RP 재투자', legend: '외화적립예금', type: 'SAVINGS' as const },
  { id: 'chainup', name: '신한 외화 체인지업 예금',    desc: '다음 IPO 대기금 · ETF, RP 재투자', legend: '체인지업 예금', type: 'DEPOSIT' as const },
]

function DynamicRangeSlider({
  splits,
  onChange,
  connected,
}: {
  splits: [number, number]
  onChange: (v: [number, number]) => void
  connected: [boolean, boolean, boolean]
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<number | null>(null)

  // 연동된 계좌만 추출 (순서 유지)
  const zones = ([0, 1, 2] as const).filter(i => connected[i])

  // 핸들 개수 = 연동 계좌 수 - 1
  // 핸들 위치: 연동 계좌 경계값
  // splits[0] = CMA/SAVINGS 경계, splits[1] = SAVINGS/DEPOSIT 경계
  // 연동 패턴에 따라 핸들 위치를 다르게 계산
  const handlePositions: number[] = (() => {
    if (zones.length <= 1) return []
    if (zones.length === 3) return [splits[0], splits[1]]
    // 2개 연동: 어느 두 계좌인지에 따라 경계값 결정
    const [a, b] = zones
    if (a === 0 && b === 1) return [splits[0]]         // CMA|SAVINGS
    if (a === 0 && b === 2) return [splits[0]]         // CMA|DEPOSIT (splits[1]=splits[0])
    if (a === 1 && b === 2) return [splits[1]]         // SAVINGS|DEPOSIT
    return []
  })()

  // 그라디언트: 연동된 계좌 색상만 순서대로
  const gradientStops = zones.map((zoneIdx, i) => {
    const start = handlePositions[i - 1] ?? 0
    const end = handlePositions[i] ?? 100
    return `${ZONE_COLORS[zoneIdx]} ${start}%, ${ZONE_COLORS[zoneIdx]} ${end}%`
  }).join(', ')

  const updateFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track || draggingRef.current === null) return
    const rect = track.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const hIdx = draggingRef.current

    if (zones.length === 3) {
      if (hIdx === 0) onChange([Math.min(pct, splits[1]), splits[1]])
      else onChange([splits[0], Math.max(pct, splits[0])])
    } else if (zones.length === 2) {
      const [a, b] = zones
      if (a === 0 && b === 1) onChange([pct, 100])
      else if (a === 0 && b === 2) onChange([pct, pct])
      else if (a === 1 && b === 2) onChange([splits[0], pct])
    }
  }, [splits, zones, onChange])

  const handlePointerDown = (hIdx: number) => (e: React.PointerEvent) => {
    e.stopPropagation()
    draggingRef.current = hIdx
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (handlePositions.length === 0) return
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const closest = handlePositions.reduce((best, pos, i) =>
      Math.abs(pct - pos) < Math.abs(pct - handlePositions[best]) ? i : best, 0)
    draggingRef.current = closest
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current === null) return
    updateFromClientX(e.clientX)
  }
  const handlePointerUp = () => { draggingRef.current = null }

  return (
    <div
      ref={trackRef}
      className="relative h-1 rounded-full touch-none select-none"
      style={{ background: `linear-gradient(to right, ${gradientStops})` }}
      onPointerDown={handleTrackPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {handlePositions.map((pos, hIdx) => (
        <div key={hIdx} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pos}%` }}>
          <button
            type="button"
            onPointerDown={handlePointerDown(hIdx)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-10 h-10 flex items-center justify-center touch-none -m-1.5"
          >
            <span
              className="w-7 h-7 rounded-full bg-white pointer-events-none"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

export function ReturnPlanSettingsPage() {
  const navigate = useNavigate()
  const [splits, setSplits] = useState<[number, number]>(PRESETS[0].splits)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0)
  const [done, setDone] = useState(false)

  const { data: homeAssets } = useHomeAssets()
  const execute = useExecuteImmediateAllocation()

  const availableBalance = homeAssets?.securities?.usdAvailableBalance ?? 0

  const ratios = [
    Math.round(splits[0]),
    Math.round(splits[1] - splits[0]),
    Math.round(100 - splits[1]),
  ]

  const handleConfirm = async () => {
    if (execute.isPending) return
    try {
      await execute.mutateAsync(splitsToAllocationItems(splits))
      setDone(true)
    } catch {
      alert('분배에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  if (done) {
    return (
      <div className="mobile-container flex flex-col h-screen bg-white">
        <Header showBack title="리턴 플랜" showNotification={false} showMypage={false} showSearch={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-xl font-bold text-text-primary">분배 완료!</p>
          <p className="text-sm text-text-tertiary">예수금이 설정한 비율대로 즉시 분배되었어요.</p>
          <button onClick={() => navigate('/return-plan')} className="mt-4 w-full bg-primary text-white py-4 rounded-xl font-semibold">
            리턴 플랜 홈으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="리턴 플랜" showNotification={false} showMypage={false} showSearch={false} />

      <div className="flex-1 overflow-y-auto">

        {/* 타이틀 + 배너 */}
        <div className="px-5 pt-5 pb-5">
          <p className="text-base font-bold text-text-primary mb-4">
            리턴 플랜으로 <span style={{ color: ZONE_COLORS[0] }}>SOLSOL</span>하게 투자하기
          </p>
          <div className="mt-2">
            <style>{`
              @keyframes sol-rise {
                from { transform: translateY(100%); }
                to   { transform: translateY(15%); }
              }
            `}</style>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-end justify-center" style={{ backgroundColor: '#A6C8F6' }}>
                <img
                  src={layCharacter}
                  alt=""
                  className="w-[52px] h-[52px] object-contain"
                  style={{ animation: 'sol-rise 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards' }}
                />
              </div>
              <div className="relative rounded-[12px] px-3 py-[10px]" style={{ backgroundColor: '#EEF2FF', maxWidth: 'calc(100% - 54px)' }}>
                <div
                  className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '7px solid #EEF2FF',
                  }}
                />
                <p className="text-[13px] text-[#3A3D45] leading-[1.6]">
                  CMA 예수금{' '}
                  <span className="font-semibold" style={{ color: ZONE_COLORS[0] }}>
                    ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  를 리턴플랜으로 분배해드려요 !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 분배 현황 */}
        <div className="px-5 pb-4">
          <p className="text-xs font-medium text-text-tertiary mb-3">분배 현황</p>
          <div className="space-y-3">
            {ACCOUNTS.map((acc, i) => {
              const ratio = ratios[i]
              const amount = Math.round((availableBalance * ratio) / 100)
              const connected =
                acc.type === 'CMA'
                  ? !!homeAssets?.securities
                  : homeAssets?.accounts?.some(a => a.accountType === acc.type) ?? false
              return (
                <div key={acc.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: CARD_BG }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-text-primary">{acc.name}</p>
                          {!connected && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                              미연동
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary mt-0.5">{acc.desc}</p>
                      </div>
                    </div>
                    {connected && (
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-bold" style={{ color: ZONE_COLORS[i] }}>
                          <span className="text-lg">{ratio}</span> %
                        </p>
                        <p className="text-xs text-text-tertiary">${amount}</p>
                      </div>
                    )}
                  </div>
                  <div className="h-1 rounded-full" style={{ backgroundColor: `${TRACK_COLORS[i]}4D` }}>
                    <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${connected ? ratio : 0}%`, backgroundColor: ZONE_COLORS[i] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 추천 플랜 */}
        <div className="px-5 pb-4">
          <p className="text-xs font-medium text-text-tertiary mb-3">추천 플랜</p>
          <div className="flex px-1 py-1.5 rounded-full" style={{ backgroundColor: CARD_BG }}>
            {PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => { setSelectedPreset(i); setSplits(preset.splits) }}
                className={selectedPreset === i
                  ? 'flex-1 text-center text-sm font-bold text-text-primary py-2 rounded-full bg-white shadow-sm'
                  : 'flex-1 text-center text-sm font-medium text-text-secondary py-2'
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 직접 조정 */}
        <div className="px-5 pb-5">
          <p className="text-xs font-medium text-text-tertiary mb-3">직접 조정</p>
          <div className="rounded-2xl px-4 pt-4 pb-4" style={{ backgroundColor: CARD_BG }}>
            <p className="text-xs text-text-tertiary text-center mb-6">좌우로 움직여 비율을 조정하세요</p>

            <DynamicRangeSlider
              splits={splits}
              connected={[
                !!homeAssets?.securities,
                homeAssets?.accounts?.some(a => a.accountType === 'SAVINGS') ?? false,
                homeAssets?.accounts?.some(a => a.accountType === 'DEPOSIT') ?? false,
              ]}
              onChange={(v: [number, number]) => { setSplits(v); setSelectedPreset(detectPreset(v)) }}
            />

            <div className="relative mt-2 h-4">
              <span className="absolute left-0 text-xs text-text-tertiary">0%</span>
              <span className="absolute left-1/2 -translate-x-1/2 text-xs text-text-tertiary">50%</span>
              <span className="absolute right-0 text-xs text-text-tertiary">100%</span>
            </div>

            <div className="h-px bg-white mt-4 mb-4" />

            <div className="flex items-center justify-center gap-5">
              {ACCOUNTS.map((acc, i) => (
                <div key={acc.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                  <span className="text-xs text-text-secondary">{acc.legend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="px-5 pb-4 flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-text-tertiary flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] text-text-tertiary font-bold leading-none">!</span>
          </span>
          <p className="text-xs text-text-tertiary">소수점 달러는 증권계좌로 돌아갑니다.</p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 pb-8 pt-3 bg-white">
        <button
          onClick={handleConfirm}
          disabled={execute.isPending || availableBalance <= 0}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50"
        >
          {execute.isPending ? '분배 중...' : '분배 예약하기'}
        </button>
      </div>
    </div>
  )
}
