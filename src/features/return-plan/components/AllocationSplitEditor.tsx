import { useCallback, useRef, type ReactNode } from "react";
import layCharacter from "@/assets/common/lay.png";
import { ZONE_COLORS, ACCOUNT_COLORS } from "../constants";

const formatDollar = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface AllocationAccount {
  id: string;
  name: string;
  nameLines?: [string, string];
  desc: string;
  badge?: string;
}

export interface LockedAccount {
  id: string;
  name: string;
  desc: string;
  navigateTo: string;
  returnTo: string;
}

// ─── 단일 슬라이더 (2계좌) ────────────────────────────────
function SingleSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.round(
        Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      );
      onChange(pct);
    },
    [onChange],
  );

  const isDragging = useRef(false);

  return (
    <div
      ref={trackRef}
      className="relative h-1 rounded-full touch-none select-none"
      style={{
        background: `linear-gradient(to right, ${ZONE_COLORS[0]} 0%, ${ZONE_COLORS[0]} ${value}%, ${ZONE_COLORS[1]} ${value}%, ${ZONE_COLORS[1]} 100%)`,
      }}
      onPointerDown={(e) => {
        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (isDragging.current) updateFromClientX(e.clientX);
      }}
      onPointerUp={() => { isDragging.current = false; }}
      onPointerCancel={() => { isDragging.current = false; }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        style={{ left: `${value}%` }}
      >
        <div className="w-10 h-10 flex items-center justify-center touch-none -m-[18px]">
          <span
            className="w-7 h-7 rounded-full bg-white pointer-events-none"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── 듀얼 슬라이더 (3계좌) ───────────────────────────────
function DualRangeSlider({
  values,
  onChange,
}: {
  values: [number, number];
  onChange: (values: [number, number]) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<0 | 1 | null>(null);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || draggingRef.current === null) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.round(
        Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      );
      const idx = draggingRef.current;
      onChange(
        idx === 0
          ? [Math.min(pct, values[1]), values[1]]
          : [values[0], Math.max(pct, values[0])],
      );
    },
    [values, onChange],
  );

  const handlePointerDown = (idx: 0 | 1) => (e: React.PointerEvent) => {
    e.stopPropagation();
    draggingRef.current = idx;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleTrackPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.round(
      Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
    );
    const idx: 0 | 1 =
      Math.abs(pct - values[0]) <= Math.abs(pct - values[1]) ? 0 : 1;
    draggingRef.current = idx;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-1 rounded-full touch-none select-none"
      style={{
        background: `linear-gradient(to right, ${ZONE_COLORS[0]} 0%, ${ZONE_COLORS[0]} ${values[0]}%, ${ZONE_COLORS[1]} ${values[0]}%, ${ZONE_COLORS[1]} ${values[1]}%, ${ZONE_COLORS[2]} ${values[1]}%, ${ZONE_COLORS[2]} 100%)`,
      }}
      onPointerDown={handleTrackPointerDown}
      onPointerMove={(e) => {
        if (draggingRef.current !== null) updateFromClientX(e.clientX);
      }}
      onPointerUp={() => { draggingRef.current = null; }}
      onPointerCancel={() => { draggingRef.current = null; }}
    >
      {values.map((v, idx) => (
        <div
          key={idx}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${v}%` }}
        >
          <button
            type="button"
            onPointerDown={handlePointerDown(idx as 0 | 1)}
            className="w-10 h-10 flex items-center justify-center touch-none -m-[18px]"
            aria-label={idx === 0 ? "왼쪽 경계 드래그" : "오른쪽 경계 드래그"}
          >
            <span
              className="w-7 h-7 rounded-full bg-white pointer-events-none"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── 범례 ────────────────────────────────────────────────
function AccountLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-1.5 break-keep">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[0] }} />
        <span className="text-[11px] tracking-tight text-text-secondary">신한투자증권 CMA 계좌</span>
      </div>
      <div className="flex items-center gap-1.5 break-keep">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[1] }} />
        <span className="text-[11px] tracking-tight text-text-secondary">신한 Value-up 외화적립예금</span>
      </div>
      <div className="flex items-center gap-1.5 break-keep">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[2] }} />
        <span className="text-[11px] tracking-tight text-text-secondary">신한 외화 체인지업 예금</span>
      </div>
    </div>
  );
}

// ─── 슬라이더 영역 (계좌 수에 따라 분기) ────────────────
interface SliderAreaProps {
  accounts: AllocationAccount[];
  ratios: number[];
  onRatiosChange: (r: number[]) => void;
}

function detectPreset(accounts: AllocationAccount[], ratios: number[]): string | null {
  const cma = Math.round(ratios[0] ?? 0);
  if (cma >= 70) return "투자 집중";

  const savingsIndex = accounts.findIndex(a => a.id.includes('valueup') || a.name.includes('외화적립예금'));
  if (savingsIndex !== -1 && Math.round(ratios[savingsIndex] ?? 0) >= 70) {
    return "안정 저축";
  }

  if (accounts.length === 2) {
    if (Math.round(ratios[0] ?? 0) === 50 && Math.round(ratios[1] ?? 0) === 50) return "균형 분배";
  } else if (accounts.length === 3) {
    if (Math.round(ratios[0] ?? 0) === 34 && Math.round(ratios[1] ?? 0) === 33 && Math.round(ratios[2] ?? 0) === 33) return "균형 분배";
  }

  return null;
}

function SliderArea({ accounts, ratios, onRatiosChange }: SliderAreaProps) {
  const selectedPreset = detectPreset(accounts, ratios);

  const presets = accounts.length === 2 ? [
    { presetName: "투자 집중", ratios: [70, 30] },
    { presetName: "안정 저축", ratios: [30, 70] },
    { presetName: "균형 분배", ratios: [50, 50] },
  ] : [
    { presetName: "투자 집중", ratios: [70, 20, 10] },
    { presetName: "안정 저축", ratios: [10, 70, 20] },
    { presetName: "균형 분배", ratios: [34, 33, 33] },
  ];

  if (accounts.length === 1) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm font-semibold text-text-secondary">
          다른 계좌가 없어서 CMA 계좌로 환불금이 100% 들어와요
        </p>
      </div>
    );
  }

  if (accounts.length === 2) {
    const value = ratios[0] ?? 50;
    return (
      <>
        <p className="text-xs font-medium text-text-tertiary mb-2">추천 플랜</p>
        <div className="flex px-1 py-1.5 rounded-xl mb-3" style={{ backgroundColor: '#F4F5F8' }}>
          {presets.map((preset) => (
            <button
              key={preset.presetName}
              type="button"
              onClick={() => {
                onRatiosChange(preset.ratios);
              }}
              className={
                selectedPreset === preset.presetName
                  ? 'flex-1 text-center text-sm font-bold text-text-primary py-2 rounded-lg bg-white shadow-sm'
                  : 'flex-1 text-center text-sm font-medium text-text-secondary py-2'
              }
            >
              {preset.presetName}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium text-text-tertiary mb-3">직접 조정</p>
        <div className="rounded-2xl px-4 pt-4 pb-4" style={{ backgroundColor: '#F4F5F8' }}>
          <p className="text-xs text-text-tertiary text-center mb-8">좌우로 움직여 비율을 조정하세요</p>
          <SingleSlider value={value} onChange={(v) => { onRatiosChange([v, 100 - v]); }} />
          <div className="relative mt-2 h-4">
            <span className="absolute left-0 text-xs text-text-tertiary">0%</span>
            <span className="absolute left-1/2 -translate-x-1/2 text-xs text-text-tertiary">50%</span>
            <span className="absolute right-0 text-xs text-text-tertiary">100%</span>
          </div>
          <div className="h-px bg-white mt-4 mb-4" />
          <AccountLegend />
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-text-tertiary flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] text-text-tertiary font-bold leading-none">!</span>
          </span>
          <p className="text-xs text-text-tertiary">소수점 달러는 증권계좌로 돌아갑니다.</p>
        </div>
      </>
    );
  }

  // 3계좌
  const splits: [number, number] = [
    ratios[0] ?? 40,
    (ratios[0] ?? 40) + (ratios[1] ?? 40),
  ];
  return (
    <>
      <p className="text-xs font-medium text-text-tertiary mb-2">추천 플랜</p>
      <div className="flex px-1 py-1.5 rounded-xl mb-3" style={{ backgroundColor: '#F4F5F8' }}>
        {presets.map((preset) => (
          <button
            key={preset.presetName}
            type="button"
            onClick={() => {
              onRatiosChange(preset.ratios);
            }}
            className={
              selectedPreset === preset.presetName
                ? 'flex-1 text-center text-sm font-bold text-text-primary py-2 rounded-lg bg-white shadow-sm'
                : 'flex-1 text-center text-sm font-medium text-text-secondary py-2'
            }
          >
            {preset.presetName}
          </button>
        ))}
      </div>

      <p className="text-xs font-medium text-text-tertiary mb-3">직접 조정</p>
      <div className="rounded-2xl px-4 pt-4 pb-4" style={{ backgroundColor: '#F4F5F8' }}>
        <p className="text-xs text-text-tertiary text-center mb-8">좌우로 움직여 비율을 조정하세요</p>
        <DualRangeSlider
          values={splits}
          onChange={([a, b]) => {
            onRatiosChange([a, b - a, 100 - b]);
          }}
        />
        <div className="relative mt-2 h-4">
          <span className="absolute left-0 text-xs text-text-tertiary">0%</span>
          <span className="absolute left-1/2 -translate-x-1/2 text-xs text-text-tertiary">50%</span>
          <span className="absolute right-0 text-xs text-text-tertiary">100%</span>
        </div>
        <div className="h-px bg-white mt-4 mb-4" />
        <AccountLegend />
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full border border-text-tertiary flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-text-tertiary font-bold leading-none">!</span>
        </span>
        <p className="text-xs text-text-tertiary">소수점 달러는 증권계좌로 돌아갑니다.</p>
      </div>
    </>
  );
}

// ─── 계좌별 분배 금액 리스트 ────────────────────────────
interface AccountListProps {
  accounts: AllocationAccount[];
  ratios: number[];
  totalAmount: number;
  bankIconSrc: string;
}

function AllocationAccountList({
  accounts,
  ratios,
  totalAmount,
}: AccountListProps) {
  return (
    <div className="space-y-3">
      {accounts.map((acc, i) => {
        const ratio = Math.round(ratios[i] ?? 0);
        const amount = formatDollar((totalAmount * ratio) / 100);
        const color = ACCOUNT_COLORS[acc.id] ?? ZONE_COLORS[i];
        return (
          <div key={acc.id} className="rounded-2xl px-4 py-3 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">{acc.name}</p>
                    {acc.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                        {acc.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">{acc.desc}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-sm font-bold" style={{ color }}>
                  <span className="text-lg">{ratio}</span> %
                </p>
                <p className="text-xs text-text-tertiary">{amount}</p>
              </div>
            </div>
            <div className="h-1 rounded-full" style={{ backgroundColor: `${color}33` }}>
              <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${ratio}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 잠금 계좌 카드 ──────────────────────────────────────
function LockedAccountCard({ account }: { account: LockedAccount }) {
  const isValueup = account.id.includes("valueup");
  const colorIndex = isValueup ? 1 : 2;
  const color = ZONE_COLORS[colorIndex];

  return (
    <div className="rounded-2xl px-4 py-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-text-primary">{account.name}</p>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                미연동
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">{account.desc}</p>
          </div>
        </div>
      </div>
      <div className="h-1 rounded-full" style={{ backgroundColor: `${color}33` }}>
        <div className="h-1 rounded-full transition-all duration-300" style={{ width: '0%', backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── 메인 섹션 ──────────────────────────────────────────
interface ReturnPlanAllocationSectionProps {
  bannerType?: 'character' | 'simple';
  description: ReactNode;
  accounts: AllocationAccount[];
  lockedAccounts: LockedAccount[];
  totalAmount: number;
  ratios: number[];
  onRatiosChange: (r: number[]) => void;
  bankIconSrc: string;
}

export function ReturnPlanAllocationSection({
  bannerType = 'simple',
  description,
  accounts,
  lockedAccounts,
  totalAmount,
  ratios,
  onRatiosChange,
  bankIconSrc,
}: ReturnPlanAllocationSectionProps) {
  return (
    <>
      {bannerType === 'character' ? (
        <section className="px-4 pt-5 pb-2 bg-white">
        <p className="text-base font-bold text-text-primary mb-4">
          리턴 플랜으로 <span style={{ color: ZONE_COLORS[0] }}>SOLSOL</span>하게 투자하기
        </p>
        <style>{`
          @keyframes sol-rise {
            from { transform: translateY(100%); }
            to   { transform: translateY(15%); }
          }
        `}</style>
        <div className="flex gap-3 items-center">
          <div
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-end justify-center"
            style={{ backgroundColor: '#A6C8F6' }}
          >
            <img
              src={layCharacter}
              alt=""
              className="w-[52px] h-[52px] object-contain"
              style={{ animation: 'sol-rise 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards' }}
            />
          </div>
          <div
            className="relative rounded-[12px] px-3 py-[10px]"
            style={{ backgroundColor: '#EEF2FF', maxWidth: 'calc(100% - 54px)' }}
          >
            <div
              className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-0 h-0"
              style={{
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '7px solid #EEF2FF',
              }}
            />
            <p className="text-[13px] text-[#3A3D45] leading-[1.6]">
              {description}
            </p>
          </div>
        </div>
      </section>
      ) : (
      <section className="px-4 pt-5 pb-2 bg-white">
        <p className="text-base font-bold text-text-primary mb-1">
          리턴 플랜으로 <span style={{ color: ZONE_COLORS[0] }}>SOLSOL</span>하게 투자하기
        </p>
        <p className="text-xs text-text-tertiary">{description}</p>
      </section>
      )}

      <section className="px-4 pt-5 pb-5 bg-surface-bg">
        <AllocationAccountList
          accounts={accounts}
          ratios={ratios}
          totalAmount={totalAmount}
          bankIconSrc={bankIconSrc}
        />

        {lockedAccounts.length > 0 && (
          <div className="space-y-3 mt-3">
            {lockedAccounts.map((acc) => (
              <LockedAccountCard key={acc.id} account={acc} />
            ))}
          </div>
        )}
      </section>

      <section className="px-4 pt-0 pb-5 bg-white">
        <SliderArea
          accounts={accounts}
          ratios={ratios}
          onRatiosChange={onRatiosChange}
        />
      </section>
    </>
  );
}

// 레거시 호환 export (3계좌 고정)
export type { SliderAreaProps as SliderProps };
export { AllocationAccountList as AllocationSplitAccountList };
