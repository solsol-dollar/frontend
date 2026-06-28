import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/common/Header";
import {
  ReturnPlanAllocationSection,
  type AllocationAccount,
} from "../components/AllocationSplitEditor";
import solBankIcon from "@/assets/common/shinhan-bank.svg";
import { useHomeAssets } from "@/features/home/hooks/useHomeAssets";
import { useExecuteImmediateAllocation } from "../hooks/useExecuteImmediateAllocation";
import { ratiosToAllocationItems } from "../utils/allocationMapper";

const DEST_TYPES = ["SECURITIES", "SAVINGS", "DEPOSIT"] as const;

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

export function ReturnPlanSettingsPage() {
  const navigate = useNavigate();
  const [ratios, setRatios] = useState<number[]>([40, 40, 20]);
  const [done, setDone] = useState(false);

  const { data: homeAssets } = useHomeAssets();
  const execute = useExecuteImmediateAllocation();

  const availableBalance = homeAssets?.securities?.usdAvailableBalance ?? 0;

  const handleConfirm = async () => {
    if (execute.isPending) return;

    const allocations = ratiosToAllocationItems([...DEST_TYPES], ratios);
    try {
      await execute.mutateAsync(allocations);
      setDone(true);
    } catch {
      alert("분배에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (done) {
    return (
      <div className="mobile-container flex flex-col h-screen">
        <Header
          showBack
          title="리턴 플랜"
          showNotification={false}
          showMypage={false}
          showSearch={false}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-xl font-bold text-text-primary">분배 완료!</p>
          <p className="text-sm text-text-tertiary">
            예수금이 설정한 비율대로 분배되었어요.
          </p>
          <button
            onClick={() => navigate("/return-plan")}
            className="mt-4 w-full bg-primary text-white py-4 rounded-xl font-semibold"
          >
            리턴 플랜 홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header
        showBack
        title="리턴 플랜"
        showNotification={false}
        showMypage={false}
        showSearch={false}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-surface-bg">
        <ReturnPlanAllocationSection
          description={
            availableBalance > 0 ? (
              <>
                증권 예수금{" "}
                <span className="text-primary font-semibold">
                  $
                  {availableBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                를 리턴플랜으로 분배해드려요
              </>
            ) : (
              "분배 가능한 예수금을 불러오는 중..."
            )
          }
          accounts={ACCOUNTS}
          lockedAccounts={[]}
          totalAmount={availableBalance}
          ratios={ratios}
          onRatiosChange={setRatios}
          bankIconSrc={solBankIcon}
        />
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-border">
        <button
          onClick={handleConfirm}
          disabled={execute.isPending || availableBalance <= 0}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          {execute.isPending ? "분배 중..." : "분배하기"}
        </button>
      </div>
    </div>
  );
}
