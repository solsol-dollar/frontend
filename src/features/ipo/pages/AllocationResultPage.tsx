import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Header } from "@/components/common/Header";
import solBankIcon from "@/assets/common/shinhan-bank.svg";
import {
  ReturnPlanAllocationSection,
  type AllocationAccount,
  type LockedAccount,
} from "@/features/return-plan/components/AllocationSplitEditor";
import { ratiosToAllocationItems } from "@/features/return-plan/utils/allocationMapper";
import { useCreateReturnPlan } from "@/features/return-plan/hooks/useCreateReturnPlan";
import { useUpdateReturnPlanRatios } from "@/features/return-plan/hooks/useUpdateReturnPlanRatios";
import { useReturnPlans } from "@/features/return-plan/hooks/useReturnPlans";
import { useReturnPlanDetail } from "@/features/return-plan/hooks/useReturnPlanDetail";
import { DonutGauge } from "@/features/return-plan/components/DonutGauge";
import { ZONE_COLORS } from "@/features/return-plan/constants";
import { useSubscriptionResultDetail } from "@/features/ipo/hooks/useSubscriptionResultDetail";
import { useSubscriptionList } from "@/features/ipo/hooks/useSubscriptions";
import { useMyPageAccounts } from "@/features/mypage/hooks/useMyPage";
import { generateLogoColor } from "@/features/ipo/utils/ipoUtils";
import { TickerLogo } from "@/features/securities/components/TickerLogo";
import { useRecommendedStocks } from "@/features/securities/hooks/useRecommendedStocks";
import type { DestinationType, ReturnPlanResponse } from "@/features/return-plan/types/returnPlan";

function ExistingPlanView({ plan, refundAmount }: { plan: ReturnPlanResponse; refundAmount: number }) {
  const allocs = plan.allocations;
  const ratioOf = (type: string) => allocs.find((a) => a.destinationType === type)?.ratio ?? 0;
  const ratios: [number, number, number] = [
    ratioOf("SECURITIES"),
    ratioOf("SAVINGS"),
    ratioOf("DEPOSIT"),
  ];

  const ACCOUNTS = [
    { id: "cma", name: "신한투자증권 CMA 계좌", nameLines: ["신한투자증권", "CMA 계좌"], desc: "다음 IPO 대기금 · ETF 재투자" },
    { id: "valueup", name: "신한 Value-up 외화적립예금", nameLines: ["신한 Value-up", "외화적립예금"], desc: "연 3.2% · 3개월 이상" },
    { id: "changeup", name: "신한 외화 체인지업 예금", nameLines: ["신한 외화", "체인지업 예금"], desc: "체크카드로 해외소비 시 간편추가" },
  ];

  return (
    <>
      <section className="bg-white px-4 pb-6">
        <div className="pt-4">
          <DonutGauge ratios={ratios} amount={refundAmount} message="분배될 예정입니다" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          {ACCOUNTS.map((acc, i) => (
            <div key={acc.id} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
              <span className="text-xs text-text-secondary leading-tight">
                {acc.nameLines[0]}<br />{acc.nameLines[1]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-5 bg-surface-bg space-y-3">
        {ACCOUNTS.map((acc, i) => {
          const ratio = ratios[i]
          const amount = ((refundAmount * ratio) / 100).toFixed(2)
          return (
            <div key={acc.id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F4F5F8' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{acc.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{acc.desc}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold" style={{ color: ZONE_COLORS[i] }}>
                    <span className="text-lg">{ratio}</span> %
                  </p>
                  <p className="text-xs text-text-tertiary">${amount}</p>
                </div>
              </div>
              <div className="h-1 rounded-full" style={{ backgroundColor: `${ZONE_COLORS[i]}33` }}>
                <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${ratio}%`, backgroundColor: ZONE_COLORS[i] }} />
              </div>
            </div>
          )
        })}
      </section>

    </>
  );
}

const formatUsd = (n: number) => `USD ${n.toFixed(2)}`;

const CMA_ACCOUNT: AllocationAccount = {
  id: "cma",
  name: "신한투자증권 CMA 계좌",
  nameLines: ["신한투자증권", "CMA 계좌"],
  desc: "다음 IPO 대기금 · ETF 재투자",
};

const VALUEUP_ACCOUNT: AllocationAccount = {
  id: "valueup",
  name: "신한 Value-up 외화적립예금",
  nameLines: ["신한 Value-up", "외화적립예금"],
  desc: "연 3.2% · 3개월 이상",
};

const CHANGEUP_ACCOUNT: AllocationAccount = {
  id: "changeup",
  name: "신한 외화 체인지업 예금",
  nameLines: ["신한 외화", "체인지업 예금"],
  desc: "체크카드로 해외소비 시 간편추가",
};

function buildInitialRatios(count: number): number[] {
  if (count === 1) return [100];
  if (count === 2) return [60, 40];
  return [40, 40, 20];
}

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
      <span className={valueClassName ?? "text-sm font-medium text-text-primary"}>
        {value}
      </span>
    </div>
  );
}

export function AllocationResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subscriptionId = Number(id);

  const { data: listData } = useSubscriptionList();
  const { data: returnPlans } = useReturnPlans();
  const { data: accountsData } = useMyPageAccounts();

  const subscription = listData?.data.subscriptions.find(
    (s) => s.subscriptionId === subscriptionId,
  );
  const existingPlan = returnPlans?.find((p) => p.subscriptionId === subscriptionId);
  const { data: planDetail } = useReturnPlanDetail(existingPlan?.returnPlanId ?? NaN);
  const subscriptionResultId = subscription?.subscriptionResultId;
  const { data: resultDetail } = useSubscriptionResultDetail(subscriptionResultId ?? NaN);

  const hasSavings = accountsData?.accounts.some((a) => a.accountType === "SAVINGS") ?? false;
  const hasDeposit = accountsData?.accounts.some((a) => a.accountType === "DEPOSIT") ?? false;

  const activeAccounts: AllocationAccount[] = [CMA_ACCOUNT];
  const activeTypes: DestinationType[] = ["SECURITIES"];
  if (hasSavings) { activeAccounts.push(VALUEUP_ACCOUNT); activeTypes.push("SAVINGS"); }
  if (hasDeposit) { activeAccounts.push(CHANGEUP_ACCOUNT); activeTypes.push("DEPOSIT"); }

  const returnTo = `/ipo/allocation/${id}`;
  const lockedAccounts: LockedAccount[] = [];
  if (!hasSavings) {
    lockedAccounts.push({
      id: "valueup-locked",
      name: "신한 Value-up 외화적립예금",
      desc: "연 3.2% · 3개월 이상",
      navigateTo: "/mypage/product/valueup",
      returnTo,
    });
  }
  if (!hasDeposit) {
    lockedAccounts.push({
      id: "changeup-locked",
      name: "신한 외화 체인지업 예금",
      desc: "체크카드로 해외소비 시 간편추가",
      navigateTo: "/mypage/product/changeup",
      returnTo,
    });
  }

  const [ratios, setRatios] = useState<number[]>([100]);
  useEffect(() => {
    if (accountsData) setRatios(buildInitialRatios(activeAccounts.length));
  // activeAccounts.length가 바뀔 때만 재초기화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsData]);
  const [showEtfSheet, setShowEtfSheet] = useState(false);
  const { data: recommendedEtfs, isLoading: isEtfLoading } = useRecommendedStocks(
    showEtfSheet ? subscription?.ipoId : undefined,
  );

  const createPlan = useCreateReturnPlan();
  const updateRatios = useUpdateReturnPlanRatios();
  const isReserving = createPlan.isPending || updateRatios.isPending;

  const ticker = subscription?.ticker ?? "";
  const name = subscription?.companyName ?? "불러오는 중...";
  const color = ticker ? generateLogoColor(ticker) : "#E5E7EB";
  const logoUrl = subscription?.logoUrl ?? null;
  const [logoImgError, setLogoImgError] = useState(false);
  useEffect(() => { setLogoImgError(false) }, [logoUrl]);
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
    if (!id || Number.isNaN(subscriptionId)) return;
    try {
      const plan = await createPlan.mutateAsync(subscriptionId);
      await updateRatios.mutateAsync({
        returnPlanId: plan.returnPlanId,
        allocations: ratiosToAllocationItems(activeTypes, ratios),
      });
      setShowEtfSheet(true);
    } catch (e) {
      console.error("리턴 플랜 예약 실패", e);
      alert("리턴 플랜 분배 예약에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header
        title="배정 결과"
        showBack
        onBack={() => navigate('/ipo', { state: { tab: '청약내역/취소' } })}
        showSearch={false}
        showNotification={false}
        showMypage={false}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* 배정 결과 카드 */}
        <section className="bg-white pb-3">
          <div className="flex items-center gap-3 px-4 pt-5 pb-5">
            {logoUrl && !logoImgError ? (
              <img
                src={logoUrl}
                alt={name}
                onError={() => setLogoImgError(true)}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {ticker.slice(0, 2)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-base font-bold text-text-primary">{name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{ticker}</p>
            </div>
            <span className="px-3 py-1 rounded-full border border-primary text-primary text-xs font-semibold flex-shrink-0">
              배정완료
            </span>
          </div>

          <div className="h-2 bg-surface-bg" />

          <div className="px-10 pt-5 pb-2 space-y-3">
            <InfoRow label="공모가" value={formatUsd(finalOfferingPrice)} />
            <InfoRow label="배정 수량" value={`${allocatedShares}주`} />
            <InfoRow label="청약신청금액" value={formatUsd(subscriptionRequestAmount)} />
            <InfoRow label="청약대행증거금" value={formatUsd(subscriptionMargin)} />
            <InfoRow label="청약 수수료" value={`-${formatUsd(subscriptionFee)}`} />
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

        {/* 리턴 플랜 */}
        <div className="mt-2">
          {existingPlan && planDetail ? (
            <ExistingPlanView
              plan={planDetail}
              refundAmount={refundAmount}
            />
          ) : (
            <ReturnPlanAllocationSection
              description="환불금이 들어오면 설정하신 리턴플랜으로 분배해드려요"
              accounts={activeAccounts}
              lockedAccounts={lockedAccounts}
              totalAmount={refundAmount}
              ratios={ratios}
              onRatiosChange={setRatios}
              bankIconSrc={solBankIcon}
            />
          )}
        </div>
      </div>

      {!existingPlan && (
        <div className="px-4 pb-8 pt-3 bg-white">
          <button
            onClick={handleReserve}
            disabled={isReserving}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {isReserving ? "예약 중..." : "분배 예약하기"}
          </button>
        </div>
      )}

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
          <p className="text-lg font-bold text-text-primary mb-1">이런 ETF는 어때요?</p>
          <p className="text-sm text-text-secondary mb-5">
            {name}과 같은 섹터에 투자하는 ETF예요
          </p>
          {isEtfLoading ? (
            <p className="py-6 text-center text-sm text-text-tertiary">불러오는 중...</p>
          ) : !recommendedEtfs || recommendedEtfs.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-tertiary">추천할 ETF가 없어요</p>
          ) : (
            <div className="space-y-2 pb-2">
              {recommendedEtfs.map((etf) => (
                <div
                  key={etf.productId}
                  onClick={() => {
                    setShowEtfSheet(false);
                    navigate("/securities?tab=ETF", { replace: true });
                    navigate(`/securities/stocks/${etf.productId}`);
                  }}
                  className="flex items-center gap-3 p-3 bg-surface-bg rounded-2xl cursor-pointer active:opacity-70"
                >
                  <TickerLogo ticker={etf.ticker} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {etf.productName}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{etf.ticker}</p>
                  </div>
                  {etf.currentPriceUsd > 0 && (
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-sm font-semibold text-text-primary">
                        {formatUsd(etf.currentPriceUsd)}
                      </span>
                      <span
                        className={`text-xs font-medium ${etf.isUp ? "text-primary" : "text-blue-500"}`}
                      >
                        {etf.isUp ? "+" : ""}
                        {etf.changeRateDay.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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