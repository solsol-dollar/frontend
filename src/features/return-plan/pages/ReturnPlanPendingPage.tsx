import { useState } from "react";
import { Info } from "lucide-react";
import { Header } from "@/components/common/Header";
import { DonutGauge, ZONE_COLORS } from "../components/DonutGauge";
import {
  ReturnPlanAllocationSection,
  type AllocationAccount,
} from "../components/AllocationSplitEditor";
import solBankIcon from "@/assets/common/shinhan-bank.svg";

const PENDING = {
  name: "Klarna IPO",
  refundDate: "2026.03.06",
  dday: "D-3",
  subscriptionAmount: "$3,000",
  allocationRate: "30%",
  allocatedAmount: "$900",
  refundAmount: 2108,
};

const DISTRIBUTION = [
  { label: "예수금", ratio: 20, legendLines: ["신한투자증권", "CMA 계좌"] },
  {
    label: "적립예금",
    ratio: 50,
    legendLines: ["신한 Value-up", "외화적립예금"],
  },
  {
    label: "예금/카드",
    ratio: 30,
    legendLines: ["신한 외화", "체인지업 예금"],
  },
];

const ACCOUNTS: [AllocationAccount, AllocationAccount, AllocationAccount] = [
  {
    id: "cma",
    name: "신한투자증권 CMA 계좌",
    nameLines: ["신한투자증권", "CMA 계좌"],
    desc: "다음 IPO 대기금 · ETF 재투자",
  },
  {
    id: "valueup",
    name: "신한 Value-up 외화적립예금",
    nameLines: ["신한 Value-up", "외화적립예금"],
    desc: "연 3.2% · 3개월 이상",
    badge: "미연동",
  },
  {
    id: "chainup",
    name: "신한 외화 체인지업 예금",
    nameLines: ["신한 외화", "체인지업 예금"],
    desc: "체크카드로 해외소비 시 간편추가",
  },
];

export function ReturnPlanPendingPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [splits, setSplits] = useState<[number, number]>([
    DISTRIBUTION[0].ratio,
    DISTRIBUTION[0].ratio + DISTRIBUTION[1].ratio,
  ]);

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header
        showBack
        title="리턴 플랜 예정"
        showNotification={false}
        showMypage={false}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
        <section className="bg-white">
          <div className="px-4 pt-4 pb-6">
            <p className="text-sm text-text-tertiary">
              다음 IPO 환불일 | {PENDING.refundDate}
            </p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {PENDING.name}
            </p>
            <p className="mt-1">
              <span className="text-3xl font-extrabold text-primary">
                {PENDING.dday}
              </span>
              <span className="text-base text-text-secondary">
                {" "}
                일 후{" "}
              </span>
              <span className="text-base font-bold text-text-primary">
                ${PENDING.refundAmount.toLocaleString("en-US")}
              </span>
              <span className="text-base text-text-secondary">
                가 리턴돼요!
              </span>
            </p>
          </div>

          {!isEditing && <div className="h-2 bg-surface-bg" />}

          {!isEditing && (
            <div className="flex items-center gap-2 mt-4 px-4">
              <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-sm text-text-tertiary">청약금</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {PENDING.subscriptionAmount}
                </p>
              </div>
              <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-sm text-text-tertiary">배정률</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {PENDING.allocationRate}
                </p>
              </div>
              <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-sm text-text-tertiary">배정금</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {PENDING.allocatedAmount}
                </p>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="px-4 pb-6">
              <div className="mt-6">
                <DonutGauge
                  ratios={[
                    DISTRIBUTION[0].ratio,
                    DISTRIBUTION[1].ratio,
                    DISTRIBUTION[2].ratio,
                  ]}
                  amount={PENDING.refundAmount}
                  message="분배될 예정입니다"
                />

                <div className="flex items-center justify-center gap-4 mt-4">
                  {DISTRIBUTION.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ZONE_COLORS[i] }}
                      />
                      <span className="text-xs text-text-secondary leading-tight">
                        {d.legendLines[0]}
                        <br />
                        {d.legendLines[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {!isEditing && (
          <div className="px-4 py-5 bg-surface-bg space-y-3">
            {DISTRIBUTION.map((d, i) => (
              <div
                key={ACCOUNTS[i].id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl fade-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img
                  src={solBankIcon}
                  alt=""
                  className="w-9 h-9 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {ACCOUNTS[i].name}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    {ACCOUNTS[i].desc}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-bold text-text-primary">
                    ${((PENDING.refundAmount * d.ratio) / 100).toFixed(2)}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: ZONE_COLORS[i] }}
                  >
                    {d.ratio}%
                  </span>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-2 mt-3 p-3 bg-white rounded-xl">
              <Info
                size={15}
                className="text-text-tertiary mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-text-secondary">
                환불금 확정 후 영업일 기준 1일 이내에 자동 분배가 실행돼요.
                비율을 바꾸려면, 분배 전까지 수정해주세요.
              </p>
            </div>
          </div>
        )}

        {isEditing && (
          <ReturnPlanAllocationSection
            description="설정하신 리턴플랜을 수정하실 수 있어요!"
            accounts={ACCOUNTS}
            totalAmount={PENDING.refundAmount}
            splits={splits}
            onSplitsChange={setSplits}
            bankIconSrc={solBankIcon}
          />
        )}
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-border">
        <button
          onClick={() => {
            if (!isEditing) {
              setSplits([
                DISTRIBUTION[0].ratio,
                DISTRIBUTION[0].ratio + DISTRIBUTION[1].ratio,
              ]);
            }
            setIsEditing((prev) => !prev);
          }}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          {isEditing ? "수정 완료" : "분배 수정하기"}
        </button>
      </div>
    </div>
  );
}
