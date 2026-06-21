import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/common/Header";
import {
  ReturnPlanAllocationSection,
  type AllocationAccount,
} from "../components/AllocationSplitEditor";
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

const REFUND_AMOUNT = 2108;

export function ReturnPlanSettingsPage() {
  const navigate = useNavigate();
  const [splits, setSplits] = useState<[number, number]>([40, 80]);

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
            <>
              증권 예수금{" "}
              <span className="text-primary font-semibold">
                ${REFUND_AMOUNT.toLocaleString("en-US")}.50
              </span>
              를 리턴플랜으로 분배해드려요
            </>
          }
          accounts={ACCOUNTS}
          totalAmount={REFUND_AMOUNT}
          splits={splits}
          onSplitsChange={setSplits}
          bankIconSrc={solBankIcon}
        />
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
        >
          완료
        </button>
      </div>
    </div>
  );
}
