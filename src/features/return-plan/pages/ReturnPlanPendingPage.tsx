import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Info } from "lucide-react";
import { Header } from "@/components/common/Header";
import { DonutGauge } from "../components/DonutGauge";
import { ZONE_COLORS } from "../constants";
import {
  ReturnPlanAllocationSection,
  type AllocationAccount,
} from "../components/AllocationSplitEditor";
import { useReturnPlanDetail } from "../hooks/useReturnPlanDetail";
import { useUpdateReturnPlanRatios } from "../hooks/useUpdateReturnPlanRatios";
import {
  allocationItemsToSplits,
  splitsToAllocationItems,
} from "../utils/allocationMapper";
import { useSubscriptionResultDetail } from "@/features/ipo/hooks/useSubscriptionResultDetail";
import solBankIcon from "@/assets/common/shinhan-bank.svg";

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

const formatUsd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

function formatDday(refundDate: string | null): string | null {
  if (!refundDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(refundDate);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff === 0 ? "D-Day" : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

export function ReturnPlanPendingPage() {
  const { id } = useParams();
  const returnPlanId = Number(id);
  const [isEditing, setIsEditing] = useState(false);
  const [splits, setSplits] = useState<[number, number]>([0, 0]);

  const { data: plan } = useReturnPlanDetail(returnPlanId);
  const { data: allocationResult } = useSubscriptionResultDetail(plan?.subscriptionId ?? NaN);
  const updateRatios = useUpdateReturnPlanRatios(returnPlanId);

  useEffect(() => {
    if (plan) setSplits(allocationItemsToSplits(plan.allocations));
  }, [plan]);

  const ratios: [number, number, number] = plan
    ? [splits[0], splits[1] - splits[0], 100 - splits[1]]
    : [0, 0, 0];
  const refundAmount = plan?.totalRefundAmount ?? 0;

  const handleToggleEdit = async () => {
    if (!isEditing) {
      if (plan) setSplits(allocationItemsToSplits(plan.allocations));
      setIsEditing(true);
      return;
    }
    try {
      await updateRatios.mutateAsync(splitsToAllocationItems(splits));
      setIsEditing(false);
    } catch (e) {
      // TODO: 에러 토스트 처리
      console.error("리턴 플랜 비율 수정 실패", e);
      alert("비율 수정에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

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
              다음 IPO 환불일 | {plan?.refundDate ?? "-"}
            </p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {plan?.sourceCompanyName ?? "불러오는 중..."}
            </p>
            <p className="mt-1">
              {formatDday(plan?.refundDate ?? null) && (
                <>
                  <span className="text-3xl font-extrabold text-primary">
                    {formatDday(plan?.refundDate ?? null)}
                  </span>
                  <span className="text-base text-text-secondary"> 일 후 </span>
                </>
              )}
              <span className="text-base font-bold text-text-primary">
                {formatUsd(refundAmount)}
              </span>
              <span className="text-base text-text-secondary">가 리턴돼요!</span>
            </p>
          </div>

          {!isEditing && <div className="h-2 bg-surface-bg" />}

          {!isEditing && (
            <div className="flex items-center gap-2 mt-4 px-4">
              <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-sm text-text-tertiary">청약금</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {allocationResult ? formatUsd(allocationResult.subscriptionAmount) : "-"}
                </p>
              </div>
              <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-sm text-text-tertiary">배정률</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {allocationResult?.allocationRate != null ? `${allocationResult.allocationRate}%` : "-"}
                </p>
              </div>
              <div className="flex-1 bg-surface-bg rounded-2xl py-3 px-3 text-left">
                <p className="text-sm text-text-tertiary">배정금</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {allocationResult?.allocatedAmount != null ? formatUsd(allocationResult.allocatedAmount) : "-"}
                </p>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="px-4 pb-6">
              <div className="mt-6">
                <DonutGauge ratios={ratios} amount={refundAmount} message="분배될 예정입니다" />

                <div className="flex items-center justify-center gap-4 mt-4">
                  {ACCOUNTS.map((acc, i) => (
                    <div key={acc.id} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ZONE_COLORS[i] }}
                      />
                      <span className="text-xs text-text-secondary leading-tight">
                        {acc.nameLines?.[0]}
                        <br />
                        {acc.nameLines?.[1]}
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
            {ACCOUNTS.map((acc, i) => (
              <div
                key={acc.id}
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
                    {acc.name}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    {acc.desc}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-bold text-text-primary">
                    ${((refundAmount * ratios[i]) / 100).toFixed(2)}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: ZONE_COLORS[i] }}
                  >
                    {ratios[i]}%
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
            totalAmount={refundAmount}
            splits={splits}
            onSplitsChange={setSplits}
            bankIconSrc={solBankIcon}
          />
        )}
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-border">
        <button
          onClick={handleToggleEdit}
          disabled={updateRatios.isPending || !plan}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          {updateRatios.isPending ? "저장 중..." : isEditing ? "수정 완료" : "분배 수정하기"}
        </button>
      </div>
    </div>
  );
}
