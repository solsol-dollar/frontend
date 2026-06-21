import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/common/Header";
import archiveTickIcon from "@/assets/common/archive-tick.svg";
import solBankIcon from "@/assets/common/shinhan-bank.svg";

const MARGIN_RATE = 1.01; // 청약대행증거금 = 청약신청금액의 101%
const FEE_RATE = 0.005; // 배정금액의 0.5%는 청약 수수료로 차감

const RESULT = {
  ticker: "CRWV",
  name: "CoreWeave",
  color: "#FF6830",
  status: "배정완료",
  subscriptionRequestAmount: 100,
  allocatedShares: 1,
  finalOfferingPrice: 32.0,
  refundDate: "2026.09.05",
};

const subscriptionMargin = RESULT.subscriptionRequestAmount * MARGIN_RATE;
const allocatedAmount = RESULT.finalOfferingPrice * RESULT.allocatedShares;
const subscriptionFee = allocatedAmount * FEE_RATE;
const refundAmount = subscriptionMargin - allocatedAmount - subscriptionFee;

const formatUsd = (n: number) => `USD ${n.toFixed(2)}`;

const ZONES = ["투자 집중", "안정 저축", "균형 분배"];

const ZONE_PRESETS: [number, number, number][] = [
  [70, 20, 10],
  [10, 70, 20],
  [34, 33, 33],
];

const ZONE_COLORS = ["#4F46E5", "#7C3AED", "#0D9488"];
const TOOLTIP_COLOR = "#6366F1";

const ETF_RECOMMENDATIONS = [
  {
    id: "msft1",
    name: "마이크로소프트",
    sector: "무자산업",
    price: "935.8900",
    change: "+1.6%",
  },
  {
    id: "msft2",
    name: "마이크로소프트",
    sector: "무자산업",
    price: "935.8900",
    change: "+1.6%",
  },
  {
    id: "msft3",
    name: "마이크로소프트",
    sector: "무자산업",
    price: "935.8900",
    change: "+1.6%",
  },
] as const;

const ACCOUNTS = [
  {
    id: "cma",
    name: "신한투자증권 CMA 계좌",
    desc: "다음 IPO 대기금 · ETF 재투자",
  },
  {
    id: "valueup",
    name: "신한 Value-up 외화적립예금",
    desc: "연 3.2% · 3개월 이상",
    badge: "미연동",
  },
  {
    id: "chainup",
    name: "신한 외화 체인지업 예금",
    desc: "체크카드로 해외소비 시 간편추가",
  },
] as const;

const formatDollar = (n: number) => `$${n.toFixed(2)}`;

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-text-secondary w-28 flex-shrink-0">
        {label}
      </span>
      <span
        className={valueClassName ?? "text-sm font-medium text-text-primary"}
      >
        {value}
      </span>
    </div>
  );
}

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

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || draggingRef.current === null) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.min(
        100,
        Math.max(0, ((clientX - rect.left) / rect.width) * 100),
      );
      const idx = draggingRef.current;
      onChange(
        idx === 0
          ? [Math.min(pct, values[1] - 5), values[1]]
          : [values[0], Math.max(pct, values[0] + 5)],
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
    const pct = Math.min(
      100,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const idx: 0 | 1 =
      Math.abs(pct - values[0]) <= Math.abs(pct - values[1]) ? 0 : 1;
    draggingRef.current = idx;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current === null) return;
    updateFromClientX(e.clientX);
  };
  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  return (
    <div>
      <div className="flex p-1 rounded-full bg-surface-bg mb-12">
        {ZONES.map((zone, i) => (
          <button
            key={zone}
            type="button"
            onClick={() => {
              const [a, b] = ZONE_PRESETS[i];
              setSelectedZone(i);
              onChange([a, a + b]);
            }}
            className={
              i === selectedZone
                ? "flex-1 text-center text-sm font-bold text-text-primary py-2.5 rounded-full bg-white shadow-sm"
                : "flex-1 text-center text-sm font-medium text-text-secondary py-2.5"
            }
          >
            {zone}
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

function EditablePercent({
  value,
  className,
  style,
  onCommit,
}: {
  value: number;
  className: string;
  style?: React.CSSProperties;
  onCommit: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const parsed = Math.round(Number(draft));
    if (!Number.isNaN(parsed)) {
      onCommit(Math.max(0, Math.min(100, parsed)));
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="number"
        inputMode="numeric"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        onClick={(e) => e.stopPropagation()}
        className={`${className} w-12 text-right bg-transparent outline-none`}
        style={style}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className={`${className} flex items-center gap-0.5`}
      style={style}
    >
      <span className="text-text-tertiary animate-blink">|</span>
      {value}%
    </button>
  );
}

function EditableDollar({
  value,
  className,
  onCommit,
}: {
  value: number;
  className: string;
  onCommit: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toFixed(2));

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isNaN(parsed)) {
      onCommit(Math.max(0, parsed));
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        onClick={(e) => e.stopPropagation()}
        className={`${className} w-20 text-right bg-transparent outline-none`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value.toFixed(2));
        setEditing(true);
      }}
      className={`${className} flex items-center gap-0.5`}
    >
      <span className="text-text-tertiary animate-blink">|</span>
      {formatDollar(value)}
    </button>
  );
}

export function AllocationResultPage() {
  useParams();
  const navigate = useNavigate();
  const [splits, setSplits] = useState<[number, number]>([40, 80]);
  const [showEtfSheet, setShowEtfSheet] = useState(false);
  const [unit, setUnit] = useState<"dollar" | "percent">("dollar");

  const ratios = [
    Math.round(splits[0]),
    Math.round(splits[1] - splits[0]),
    Math.round(100 - splits[1]),
  ];

  const setRatioAt = (i: 0 | 1, newValue: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newValue)));
    if (i === 0) {
      const r0 = clamped;
      const r1 = Math.min(ratios[1], 100 - r0);
      setSplits([r0, r0 + r1]);
    } else {
      const r0 = ratios[0];
      const r1 = Math.min(clamped, 100 - r0);
      setSplits([r0, r0 + r1]);
    }
  };

  return (
    <div className="mobile-container flex flex-col h-screen bg-surface-bg">
      <Header
        title="배정 결과"
        showBack
        showSearch={false}
        showNotification={false}
        showMypage={false}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* 배정 결과 카드 */}
        <section className="bg-white pb-3">
          <div className="flex items-center gap-3 px-4 pt-5 pb-5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: RESULT.color }}
            >
              {RESULT.ticker.slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-text-primary">
                {RESULT.name}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                {RESULT.ticker}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full border border-primary text-primary text-xs font-semibold flex-shrink-0">
              {RESULT.status}
            </span>
          </div>

          <div className="h-2 bg-surface-bg" />

          <div className="px-10 pt-5 pb-2 space-y-3">
            <InfoRow
              label="청약신청금액"
              value={formatUsd(RESULT.subscriptionRequestAmount)}
            />
            <InfoRow
              label="청약대행증거금"
              value={formatUsd(subscriptionMargin)}
            />
            <InfoRow label="배정 수량" value={`${RESULT.allocatedShares}주`} />
            <InfoRow
              label="최종 공모가"
              value={formatUsd(RESULT.finalOfferingPrice)}
            />
            <InfoRow
              label="청약 수수료"
              value={`-${formatUsd(subscriptionFee)}`}
            />
            <InfoRow
              label="환불 금액"
              value={formatUsd(refundAmount)}
              valueClassName="text-sm font-bold text-primary"
            />
            <InfoRow label="환불(예정)일" value={RESULT.refundDate} />
          </div>
          <p className="px-10 pt-1 text-[11px] text-text-tertiary">
            ※ 배정금액의 0.5%는 청약 수수료로 차감되어 환불돼요.
          </p>
        </section>

        {/* 리턴 플랜 분배 설정 */}
        <section className="px-4 py-5 mt-2 bg-white">
          <div className="flex items-start gap-2 mb-5">
            <img
              src={archiveTickIcon}
              alt=""
              className="w-3 h-4 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-text-primary">
                리턴 플랜으로 SOLSOL하게 투자하기
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                환불금이 들어오면 설정하신 리턴플랜으로 분배해드려요
              </p>
            </div>
          </div>

          <DualRangeSlider values={splits} onChange={setSplits} />

          <div className="flex items-center justify-center gap-4 mt-5">
            {["증권 계좌", "외화적립예금", "외화 예금"].map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: ZONE_COLORS[i] }}
                />
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-5 bg-surface-bg">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl">
            <span className="text-sm font-semibold text-text-primary">
              계좌별 분배 금액
            </span>
            <div className="flex items-center gap-0.5 p-0.5 bg-white rounded-full flex-shrink-0">
              <button
                type="button"
                onClick={() => setUnit("dollar")}
                className={
                  unit === "dollar"
                    ? "w-5 h-5 rounded-full bg-text-primary text-white flex items-center justify-center text-[10px] font-semibold"
                    : "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-text-tertiary"
                }
              >
                $
              </button>
              <button
                type="button"
                onClick={() => setUnit("percent")}
                className={
                  unit === "percent"
                    ? "w-5 h-5 rounded-full bg-text-primary text-white flex items-center justify-center text-[10px] font-semibold"
                    : "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-text-tertiary"
                }
              >
                %
              </button>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {ACCOUNTS.map((acc, i) => {
              const amountValue = (refundAmount * ratios[i]) / 100;
              const amount = formatDollar(amountValue);
              return (
                <div
                  key={acc.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-2xl bg-white"
                >
                  <img
                    src={solBankIcon}
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
                      {"badge" in acc && acc.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-semibold flex-shrink-0">
                          {acc.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    {unit === "percent" ? (
                      <>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: ZONE_COLORS[i] }}
                        >
                          {amount}
                        </span>
                        {i === 2 ? (
                          <span className="text-lg font-bold text-text-tertiary">
                            {ratios[i]}%
                          </span>
                        ) : (
                          <EditablePercent
                            value={ratios[i]}
                            className="text-lg font-bold text-text-tertiary"
                            onCommit={(v) => setRatioAt(i as 0 | 1, v)}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: ZONE_COLORS[i] }}
                        >
                          {ratios[i]}%
                        </span>
                        {i === 2 ? (
                          <span className="text-lg font-bold text-text-tertiary">
                            {amount}
                          </span>
                        ) : (
                          <EditableDollar
                            value={amountValue}
                            className="text-lg font-bold text-text-tertiary"
                            onCommit={(v) => {
                              const pct =
                                refundAmount > 0
                                  ? Math.round((v / refundAmount) * 100)
                                  : 0;
                              setRatioAt(
                                i as 0 | 1,
                                Math.max(0, Math.min(100, pct)),
                              );
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-border">
        <button
          onClick={() => setShowEtfSheet(true)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          분배 예약하기
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          showEtfSheet ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowEtfSheet(false)}
      />
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-3xl z-[60] transition-transform duration-300 ease-out ${
          showEtfSheet ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pt-2 pb-4">
          <p className="text-lg font-bold text-text-primary mb-1">
            이런 ETF는 어때요?
          </p>
          <p className="text-sm text-text-secondary mb-5">
            해당 IPO가 포함될 가능성이 있는 ETF 내역이에요
          </p>

          <div className="space-y-4 mb-7">
            {ETF_RECOMMENDATIONS.map((etf) => (
              <div key={etf.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-blue flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {etf.name}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    {etf.sector}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-semibold text-text-primary">
                    {etf.price}
                  </span>
                  <span className="text-xs font-medium text-up">
                    {etf.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setShowEtfSheet(false);
              navigate("/ipo");
            }}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
