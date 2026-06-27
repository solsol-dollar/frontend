import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Header } from "@/components/common/Header";
import solBankIcon from "@/assets/common/shinhan-bank.svg";
import {
  ReturnPlanAllocationSection,
  type AllocationAccount,
} from "@/features/return-plan/components/AllocationSplitEditor";
import { splitsToAllocationItems } from "@/features/return-plan/utils/allocationMapper";
import { useCreateReturnPlan } from "@/features/return-plan/hooks/useCreateReturnPlan";
import { useUpdateReturnPlanRatios } from "@/features/return-plan/hooks/useUpdateReturnPlanRatios";
import { useReturnPlans } from "@/features/return-plan/hooks/useReturnPlans";
import { useSubscriptionResultDetail } from "@/features/ipo/hooks/useSubscriptionResultDetail";
import { useSubscriptionList } from "@/features/ipo/hooks/useSubscriptions";
import { generateLogoColor } from "@/features/ipo/utils/ipoUtils";

const formatUsd = (n: number) => `USD ${n.toFixed(2)}`;

const ETF_RECOMMENDATIONS = [
  {
    id: "msft1",
    name: "마이크로소프트",
    sector: "무자산업",
    price: "935.89",
    change: "+1.6%",
  },
  {
    id: "msft2",
    name: "마이크로소프트",
    sector: "무자산업",
    price: "935.89",
    change: "+1.6%",
  },
  {
    id: "msft3",
    name: "마이크로소프트",
    sector: "무자산업",
    price: "935.89",
    change: "+1.6%",
  },
] as const;

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


export function AllocationResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subscriptionId = Number(id);
  const [splits, setSplits] = useState<[number, number]>([40, 80]);
  const [showEtfSheet, setShowEtfSheet] = useState(false);

  const { data: listData } = useSubscriptionList();
  const { data: returnPlans } = useReturnPlans();
  const subscription = listData?.data.subscriptions.find(
    (s) => s.subscriptionId === subscriptionId,
  );
  const existingPlan = returnPlans?.find((p) => p.subscriptionId === subscriptionId);
  const subscriptionResultId = subscription?.subscriptionResultId;
  const { data: resultDetail } = useSubscriptionResultDetail(subscriptionResultId ?? NaN);

  const createPlan = useCreateReturnPlan();
  const updateRatios = useUpdateReturnPlanRatios();
  const isReserving = createPlan.isPending || updateRatios.isPending;

  const ticker = subscription?.ticker ?? "";
  const name = subscription?.companyName ?? "불러오는 중...";
  const color = ticker ? generateLogoColor(ticker) : "#E5E7EB";
  const subscriptionRequestAmount = resultDetail?.subscriptionAmount ?? subscription?.subscriptionAmount ?? 0;
  const allocatedShares = resultDetail?.allocatedShares ?? 0;
  const subscriptionMargin = subscription?.subscriptionAgencyDeposit ?? 0;
  const allocatedAmount = resultDetail?.allocatedAmount ?? 0;
  const refundAmount = resultDetail?.refundAmount ?? 0;
  const subscriptionFee = Math.max(0, subscriptionMargin - allocatedAmount - refundAmount);
  const finalOfferingPrice =
    allocatedShares > 0 ? allocatedAmount / allocatedShares : subscription?.confirmedOfferPrice ?? 0;
  const listingDateFormatted = subscription?.listingDate
    ? dayjs(subscription.listingDate).format("YYYY.MM.DD")
    : "-";

  const handleReserve = async () => {
    if (!id || Number.isNaN(subscriptionId)) {
      console.error("subscriptionId가 없습니다");
      return;
    }
    try {
      const plan = await createPlan.mutateAsync(subscriptionId);
      await updateRatios.mutateAsync({
        returnPlanId: plan.returnPlanId,
        allocations: splitsToAllocationItems(splits),
      });
      setShowEtfSheet(true);
    } catch (e) {
      // TODO: 에러 토스트 처리
      console.error("리턴 플랜 예약 실패", e);
      alert("리턴 플랜 분배 예약에 실패했어요. 잠시 후 다시 시도해주세요.");
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
              style={{ backgroundColor: color }}
            >
              {ticker.slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-text-primary">
                {name}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                {ticker}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full border border-primary text-primary text-xs font-semibold flex-shrink-0">
              배정완료
            </span>
          </div>

          <div className="h-2 bg-surface-bg" />

          <div className="px-10 pt-5 pb-2 space-y-3">
            <InfoRow
              label="공모가"
              value={formatUsd(finalOfferingPrice)}
            />
            <InfoRow label="배정 수량" value={`${allocatedShares}주`} />
            <InfoRow
              label="청약신청금액"
              value={formatUsd(subscriptionRequestAmount)}
            />
            <InfoRow
              label="청약대행증거금"
              value={formatUsd(subscriptionMargin)}
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
            <InfoRow label="상장(예정)일" value={listingDateFormatted} />
          </div>
          <p className="px-10 pt-1 text-[11px] text-text-tertiary">
            ※ 배정금액의 0.5%는 청약 수수료로 차감되어 환불돼요.
          </p>
        </section>

        {/* 리턴 플랜 분배 설정 */}
        <div className="mt-2">
          <ReturnPlanAllocationSection
            description="환불금이 들어오면 설정하신 리턴플랜으로 분배해드려요"
            accounts={ACCOUNTS}
            totalAmount={refundAmount}
            splits={splits}
            onSplitsChange={setSplits}
            bankIconSrc={solBankIcon}
          />
        </div>
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-border">
        {existingPlan ? (
          <button
            onClick={() => navigate(`/return-plan/pending/${existingPlan.returnPlanId}`)}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold"
          >
            리턴플랜 보기
          </button>
        ) : (
          <button
            onClick={handleReserve}
            disabled={isReserving}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {isReserving ? "예약 중..." : "분배 예약하기"}
          </button>
        )}
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          showEtfSheet ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowEtfSheet(false)}
      />
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-3xl z-[60] transition-transform duration-300 ease-out max-h-[80vh] flex flex-col ${
          showEtfSheet ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pt-2 flex-1 overflow-y-auto">
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
        </div>

        <div className="px-5 pb-4 pt-2 shrink-0">
          <button
            onClick={() => {
              setShowEtfSheet(false);
              navigate("/ipo", { state: { tab: "청약내역/취소" } });
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
