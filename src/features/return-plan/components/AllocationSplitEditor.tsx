import { useCallback, useRef, useState, type ReactNode } from "react"; // useState는 DualRangeSlider에서 사용
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import archiveTickIcon from "@/assets/common/archive-tick.svg";
import { ZONE_COLORS } from "../constants";
import { useReturnPlanPresets } from "../hooks/useReturnPlanPresets";

const FALLBACK_PRESETS = [
  {
    presetName: "투자 집중",
    securitiesRatio: 70,
    savingsRatio: 20,
    accountRatio: 10,
  },
  {
    presetName: "안정 저축",
    securitiesRatio: 10,
    savingsRatio: 70,
    accountRatio: 20,
  },
  {
    presetName: "균형 분배",
    securitiesRatio: 34,
    savingsRatio: 33,
    accountRatio: 33,
  },
];
const TOOLTIP_COLOR = "#6366F1";

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
      className="relative h-2.5 rounded-full mx-2.5 touch-none select-none"
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
      onPointerUp={() => {
        isDragging.current = false;
      }}
      onPointerCancel={() => {
        isDragging.current = false;
      }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        style={{ left: `${value}%` }}
      >
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
          <span
            className="text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
            style={{ backgroundColor: TOOLTIP_COLOR }}
          >
            드래그!
          </span>
          <span
            className="w-2 h-2 -mt-1 rotate-45"
            style={{ backgroundColor: TOOLTIP_COLOR }}
          />
        </div>
        <div className="w-8 h-8 -m-1.5 flex items-center justify-center touch-none">
          <span className="w-5 h-5 rounded-full bg-white border-2 border-border shadow pointer-events-none" />
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
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const { data: presetData } = useReturnPlanPresets();
  const presets = presetData ?? FALLBACK_PRESETS;

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
          ? [Math.min(pct, values[1] - 1), values[1]]
          : [values[0], Math.max(pct, values[0] + 1)],
      );
    },
    [values, onChange],
  );

  const handlePointerDown = (idx: 0 | 1) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedZone(null);
    draggingRef.current = idx;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleTrackPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    setSelectedZone(null);
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
    <div>
      <div className="flex p-1 rounded-full bg-surface-bg mb-12">
        {presets.map((preset, i) => (
          <button
            key={preset.presetName}
            type="button"
            onClick={() => {
              setSelectedZone(i);
              onChange([
                preset.securitiesRatio,
                Math.min(100, preset.securitiesRatio + preset.savingsRatio),
              ]);
            }}
            className={
              i === selectedZone
                ? "flex-1 text-center text-sm font-bold text-text-primary py-2.5 rounded-full bg-white shadow-sm"
                : "flex-1 text-center text-sm font-medium text-text-secondary py-2.5"
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
        onPointerMove={(e) => {
          if (draggingRef.current !== null) updateFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          draggingRef.current = null;
        }}
        onPointerCancel={() => {
          draggingRef.current = null;
        }}
      >
        {values.map((v, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${v}%` }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
              <span
                className="text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                style={{ backgroundColor: TOOLTIP_COLOR }}
              >
                드래그!
              </span>
              <span
                className="w-2 h-2 -mt-1 rotate-45"
                style={{ backgroundColor: TOOLTIP_COLOR }}
              />
            </div>
            <button
              type="button"
              onPointerDown={handlePointerDown(idx as 0 | 1)}
              className="w-8 h-8 -m-1.5 flex items-center justify-center touch-none"
              aria-label={idx === 0 ? "왼쪽 경계 드래그" : "오른쪽 경계 드래그"}
            >
              <span className="w-5 h-5 rounded-full bg-white border-2 border-border shadow pointer-events-none" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 범례 ────────────────────────────────────────────────
function AccountLegend({ accounts }: { accounts: AllocationAccount[] }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-5">
      {accounts.map((acc, i) => (
        <div key={acc.id} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-sm flex-shrink-0"
            style={{ backgroundColor: ZONE_COLORS[i] }}
          />
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
  );
}

// ─── 슬라이더 영역 (계좌 수에 따라 분기) ────────────────
interface SliderAreaProps {
  accounts: AllocationAccount[];
  ratios: number[];
  onRatiosChange: (r: number[]) => void;
}

function SliderArea({ accounts, ratios, onRatiosChange }: SliderAreaProps) {
  if (accounts.length === 1) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm font-semibold text-text-secondary">
          다른 계좌가 없어서 CMA 계좌로 환불금이 100% 들어와요
        </p>
        <AccountLegend accounts={accounts} />
      </div>
    );
  }

  if (accounts.length === 2) {
    const value = ratios[0] ?? 50;
    return (
      <div className="pt-8">
        <SingleSlider
          value={value}
          onChange={(v) => onRatiosChange([v, 100 - v])}
        />
        <AccountLegend accounts={accounts} />
      </div>
    );
  }

  // 3계좌
  const splits: [number, number] = [
    ratios[0] ?? 40,
    (ratios[0] ?? 40) + (ratios[1] ?? 40),
  ];
  return (
    <>
      <DualRangeSlider
        values={splits}
        onChange={([a, b]) => onRatiosChange([a, b - a, 100 - b])}
      />
      <AccountLegend accounts={accounts} />
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
  bankIconSrc,
}: AccountListProps) {
  return (
    <>
      <div className="space-y-1.5">
        {accounts.map((acc, i) => {
          const ratio = Math.round(ratios[i] ?? 0);
          const amount = formatDollar((totalAmount * ratio) / 100);
          return (
            <div
              key={acc.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white"
            >
              <img
                src={bankIconSrc}
                alt=""
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {acc.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-text-tertiary truncate">
                    {acc.desc}
                  </p>
                  {acc.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-semibold flex-shrink-0">
                      {acc.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className="text-sm font-semibold"
                  style={{ color: ZONE_COLORS[i] }}
                >
                  {ratio}%
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: ZONE_COLORS[i] }}
                >
                  {amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── 잠금 계좌 카드 ──────────────────────────────────────
function LockedAccountCard({ account }: { account: LockedAccount }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white">
      <div className="w-8 h-8 rounded-full bg-surface-bg flex items-center justify-center flex-shrink-0 opacity-60">
        <Lock size={14} className="text-text-tertiary" />
      </div>
      <div className="flex-1 min-w-0 opacity-60">
        <p className="text-sm font-semibold text-text-primary truncate">
          {account.name}
        </p>
        <p className="text-xs text-text-tertiary truncate">{account.desc}</p>
      </div>
      <button
        type="button"
        onClick={() =>
          navigate(account.navigateTo, {
            state: { returnTo: account.returnTo },
          })
        }
        className="flex-shrink-0 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold"
      >
        만들기
      </button>
    </div>
  );
}

// ─── 메인 섹션 ──────────────────────────────────────────
interface ReturnPlanAllocationSectionProps {
  description: ReactNode;
  accounts: AllocationAccount[];
  lockedAccounts: LockedAccount[];
  totalAmount: number;
  ratios: number[];
  onRatiosChange: (r: number[]) => void;
  bankIconSrc: string;
}

export function ReturnPlanAllocationSection({
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
      <section className="px-4 py-5 bg-white">
        <div className="flex items-start gap-2">
          <img
            src={archiveTickIcon}
            alt=""
            className="w-3 h-4 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-text-primary">
              리턴 플랜으로 SOLSOL하게 투자하기
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-5 bg-surface-bg">
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

      <section className="px-4 py-5 bg-white">
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
