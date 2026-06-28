import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus } from "lucide-react";
import dayjs from "dayjs";
import { Header } from "@/components/common/Header";
import { IpoStockHeader } from "@/features/ipo/components/IpoStockHeader";
import { IpoOfferingInfo } from "@/features/ipo/components/IpoOfferingInfo";
import {
  getSubscriptionDday,
  getSubscriptionStatus,
  getSubscriptionStatusBadgeClass,
  getSubscriptionStatusTextClass,
} from "@/features/ipo/utils/subscriptionStatus";
import { cn } from "@/lib/utils";
import { useIpoDetail } from "@/features/ipo/hooks/useIpo";
import {
  useCreateSubscription,
  useSubscriptionList,
} from "@/features/ipo/hooks/useSubscriptions";
import { generateLogoColor } from "@/features/ipo/utils/ipoUtils";
import { useHomeAssets } from "@/features/home/hooks/useHomeAssets";
import { PinKeypad } from "@/features/onboarding/components/PinKeypad";
import { loginWithPin } from "@/lib/auth";

export function SubscribePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ipoId = Number(id);
  const [liked, setLiked] = useState(false);
  const [amount, setAmount] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<React.ReactNode | null>(
    null,
  );
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinKey, setPinKey] = useState(0);
  const pinErrorTimerRef = useRef<number | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch: refetchIpoDetail,
  } = useIpoDetail(ipoId);
  const { data: assets, isLoading: isAssetsLoading } = useHomeAssets();
  const { mutateAsync: createSubscription, isPending: isSubmitting } =
    useCreateSubscription();
  const { data: subscriptionListData, isLoading: isSubscriptionListLoading } =
    useSubscriptionList({ ipoId }, { enabled: ipoId > 0 });
  const alreadySubscribed = (
    subscriptionListData?.data.subscriptions ?? []
  ).some((s) => s.subscriptionStatus !== "CANCELLED");

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollKey = `subscribe-scroll-${ipoId}`;

  useEffect(() => {
    if (isLoading || isAssetsLoading) return;
    const saved = sessionStorage.getItem(scrollKey);
    if (saved && scrollRef.current) {
      scrollRef.current.scrollTop = Number(saved);
    }
  }, [isLoading, isAssetsLoading, scrollKey]);

  useEffect(() => {
    return () => {
      if (pinErrorTimerRef.current !== null)
        window.clearTimeout(pinErrorTimerRef.current);
    };
  }, []);

  const saveScrollPosition = () => {
    if (scrollRef.current) {
      sessionStorage.setItem(scrollKey, String(scrollRef.current.scrollTop));
    }
  };

  if (isLoading || isAssetsLoading || isSubscriptionListLoading) {
    return <div className="page-content" />;
  }

  if (isNaN(ipoId) || isError || !data?.data || !assets) {
    return (
      <div className="mobile-container flex flex-col h-screen">
        <Header showBack showNotification={false} showMypage={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-text-secondary">
            종목 정보를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary font-semibold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (alreadySubscribed) {
    return (
      <div className="mobile-container flex flex-col h-screen">
        <Header showBack showNotification={false} showMypage={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-text-secondary">
            이미 청약 신청한 종목이에요.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary font-semibold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (data.data.ipoStatus === "UPCOMING") {
    return (
      <div className="mobile-container flex flex-col h-screen">
        <Header showBack showNotification={false} showMypage={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-text-secondary">
            아직 청약 신청 기간이 아니에요.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary font-semibold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const ipoDetail = data.data;
  const { securities, exchangeRateInfo } = assets;
  const depositAccount = assets.accounts.find(
    (a) => a.accountType === "DEPOSIT",
  );
  const ipo = {
    ticker: ipoDetail.ticker,
    name: ipoDetail.companyName,
    color: generateLogoColor(ipoDetail.ticker),
    offeringPriceRange: {
      min: ipoDetail.offerPriceMin ?? 0,
      max: ipoDetail.offerPriceMax ?? undefined,
    } as { min: number; max?: number },
    milestones: [
      {
        label: "청약시작일",
        date: dayjs(ipoDetail.subscriptionStartDate).format("YYYY.MM.DD"),
      },
      {
        label: "청약마감일",
        date: dayjs(ipoDetail.subscriptionEndDate).format("YYYY.MM.DD"),
      },
      {
        label: "상장(예정)일",
        date: dayjs(ipoDetail.listingDate).format("YYYY.MM.DD"),
      },
      ...(ipoDetail.refundDate
        ? [
            {
              label: "환불(예정)일",
              date: dayjs(ipoDetail.refundDate).format("YYYY.MM.DD"),
            },
          ]
        : []),
    ],
    availableAmount: securities.usdAvailableBalance,
    foreignBalance:
      depositAccount?.availableBalance ?? depositAccount?.balance ?? 0,
    cmaBalanceKrw: securities.krwBalance,
    exchangeRate: exchangeRateInfo.rate,
    // 환전 가능액 전용 API가 아직 없어 보유 원화 잔액을 환율로 환산해 클라이언트에서 계산
    exchangeableKrw: securities.krwBalance,
    exchangeableUsd: securities.krwBalance / exchangeRateInfo.rate,
    account: securities.accountNumberMasked,
  };
  const status = getSubscriptionStatus(ipo.milestones);
  const dday = getSubscriptionDday(ipo.milestones);

  const { min: minPrice, max: maxPrice } = ipo.offeringPriceRange;
  const offeringPriceLabel =
    maxPrice && maxPrice !== minPrice
      ? `USD ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`
      : `USD ${minPrice.toFixed(2)}`;
  // 예상 청약 가능 수량은 상단 공모가(최대값) 기준으로 보수적으로 계산
  const pricePerShareForEstimate = maxPrice ?? minPrice;
  // 청약 신청 시 서버가 ipos.confirmed_offer_price와 정확히 일치하는지 검증하므로
  // 확정가가 있으면 그 값을, 없으면(미확정 IPO) 밴드 내 추정가를 그대로 보낸다
  const offerPriceForSubmit =
    ipoDetail.confirmedOfferPrice ?? pricePerShareForEstimate;

  const numericAmount = Number(amount || 0);
  const maxSubscribable = Math.floor(ipo.availableAmount / 1.01);
  const maxShares = Math.floor(maxSubscribable / pricePerShareForEstimate);
  const isValidAmount =
    numericAmount >= 100 &&
    Number.isInteger(numericAmount) &&
    numericAmount <= maxSubscribable;

  const subscriptionFee = isValidAmount ? numericAmount * 1.01 : 0;

  const handlePinEnter = async (pin: string) => {
    setPinError(null);
    try {
      await loginWithPin(pin);
    } catch {
      setPinError("비밀번호가 올바르지 않습니다");
      if (pinErrorTimerRef.current !== null)
        window.clearTimeout(pinErrorTimerRef.current);
      pinErrorTimerRef.current = window.setTimeout(() => {
        setPinError(null);
        setPinKey((k) => k + 1);
      }, 3000);
      return;
    }
    setShowPinScreen(false);
    const fresh = await refetchIpoDetail();
    const freshOfferPrice =
      fresh.data?.data.confirmedOfferPrice ?? offerPriceForSubmit;
    try {
      await createSubscription({
        ipoId,
        securitiesAccountId: securities.usdAccountId,
        subscriptionAmount: numericAmount,
        offerPrice: freshOfferPrice,
      });
      navigate("/ipo", { state: { tab: "청약내역/취소" } });
    } catch (e) {
      console.error("청약 신청 실패", e);
      setErrorModalMessage(
        "청약 신청에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const adjustAmount = (delta: number) => {
    setAmount((prev) => {
      if (!prev) return delta > 0 ? "100" : "";
      return String(
        Math.min(maxSubscribable, Math.max(100, Number(prev) + delta)),
      );
    });
  };

  return (
    <div className="mobile-container flex flex-col h-screen">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={
          <button
            onClick={() => setLiked((v) => !v)}
            aria-label={liked ? "관심 해제" : "관심 등록"}
            className="p-1"
          >
            <Heart
              size={22}
              className={liked ? "text-heart fill-heart" : "text-text-tertiary"}
            />
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-surface-bg">
        {/* 종목 정보 */}
        <section className="px-4 py-6 bg-white">
          <div className="mb-7">
            <IpoStockHeader
              avatarText={ipo.ticker.slice(0, 2)}
              avatarColor={ipo.color}
              name={ipo.name}
              ticker={ipo.ticker}
              status={status}
              statusClassName={getSubscriptionStatusBadgeClass(status)}
              secondaryText={dday}
              secondaryClassName={getSubscriptionStatusTextClass(status)}
            />
          </div>

          <div className="h-2 bg-surface-bg -mx-4 mb-4" />

          <IpoOfferingInfo
            offeringPrice={offeringPriceLabel}
            milestones={ipo.milestones}
            footnote="※ 일정은 사전 고지없이 변경될 수 있습니다."
          />
        </section>

        {/* 계좌 정보 + 금액 + 입력 통합 섹션 */}
        <section className="bg-white mt-2">
          {/* 계좌 정보 */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-sm text-text-secondary">{ipo.account}</p>
          </div>
          <div className="h-px bg-border mx-4" />

          {/* 청약 가능 금액 */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs text-text-tertiary mb-1">신청가능금액</p>
            <span className="text-2xl font-bold text-text-primary">
              $
              {ipo.availableAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <div className="mt-1">
              <p className="text-sm text-primary font-semibold">
                최대 {maxShares.toLocaleString("en-US")}주 청약 가능해요!
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                공모가 기준 예상 수량
              </p>
            </div>
          </div>

          {/* 청약신청금액 입력 */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary whitespace-nowrap w-20 flex-shrink-0">
                청약신청금액
              </span>
              <div className="w-48 ml-auto flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => adjustAmount(-1)}
                  disabled={!amount || numericAmount <= 100}
                  aria-label="금액 감소"
                  className="px-3 py-2.5 text-text-secondary active:bg-surface disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
                  {amount && (
                    <span className="text-sm font-semibold text-text-primary">
                      USD
                    </span>
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!v || v < 100) setAmount("100");
                      else if (v > maxSubscribable)
                        setAmount(String(maxSubscribable));
                    }}
                    placeholder="최소 $100"
                    className="text-center text-sm text-text-primary outline-none bg-transparent min-w-0 w-full"
                  />
                </div>
                <button
                  onClick={() => adjustAmount(1)}
                  disabled={numericAmount >= maxSubscribable}
                  aria-label="금액 증가"
                  className="px-3 py-2.5 text-text-secondary active:bg-surface disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-text-tertiary">
                최소 USD 100 · USD 1 단위
              </span>
              <button
                onClick={() => setAmount(String(maxSubscribable))}
                className="text-xs text-text-secondary px-2 py-0.5 bg-surface rounded"
              >
                최대
              </button>
            </div>
            {amount && !isValidAmount && (
              <p className="text-xs text-danger mt-1">
                {numericAmount > maxSubscribable
                  ? `최대 청약 가능 금액은 USD ${maxSubscribable.toLocaleString("en-US")}입니다.`
                  : "USD100 이상, USD1 단위로 입력해주세요."}
              </p>
            )}
          </div>

          {/* 청약대행증거금 */}
          <div className="px-4 pt-3 pb-5 flex items-center justify-between">
            <span className="text-sm text-text-secondary">청약대행증거금</span>
            <span className="text-base font-bold text-text-primary">
              USD{" "}
              {subscriptionFee.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </section>

        {/* 청약 자금 추가 섹션 */}
        <section className="px-4 py-5 bg-white mt-2">
          <p className="text-sm font-semibold text-text-primary mb-3">
            청약 자금을 더 채우고 싶으신가요?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (!depositAccount) return;
                saveScrollPosition();
                navigate("/home/transfer", {
                  state: {
                    fromAccountId: depositAccount.accountId,
                    sourceName: depositAccount.accountName,
                    sourceBalance: `$${(depositAccount.availableBalance ?? depositAccount.balance).toFixed(2)}`,
                    toAccountId: securities.usdAccountId,
                    returnTo: `/ipo/${ipoId}/subscribe`,
                    depth: 1,
                  },
                });
              }}
              disabled={!depositAccount}
              className="p-3 border border-border rounded-xl text-left disabled:opacity-40"
            >
              <p className="text-xs font-semibold text-text-primary">
                외화통장에서 끌어오기
              </p>
              <p className="text-sm font-bold text-text-primary mt-1">
                잔액 ${ipo.foreignBalance.toLocaleString("en-US")}
              </p>
            </button>
            <button
              onClick={() => {
                saveScrollPosition();
                navigate("/home/exchange", {
                  state: {
                    direction: "won-to-dollar",
                    returnTo: `/ipo/${ipoId}/subscribe`,
                    depth: 1,
                  },
                });
              }}
              className="p-3 border border-border rounded-xl text-left"
            >
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-text-primary">
                  환전하기
                </p>
                <p className="text-[11px] text-text-tertiary">
                  1달러 = {ipo.exchangeRate.toLocaleString("ko-KR")}원
                </p>
              </div>
              <p className="text-xs font-bold text-text-primary mt-1">
                {ipo.exchangeableKrw.toLocaleString("ko-KR")}원 → $
                {ipo.exchangeableUsd.toFixed(2)}
              </p>
            </button>
          </div>
        </section>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="px-4 pb-8 pt-3 flex gap-3 bg-white border-t border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-semibold"
        >
          취소
        </button>
        <button
          onClick={() => {
            const nowKst = dayjs().utcOffset(9);
            const day = nowKst.day();
            const minutes = nowKst.hour() * 60 + nowKst.minute();
            if (
              day === 0 ||
              day === 6 ||
              minutes < 9 * 60 ||
              minutes >= 17 * 60
            ) {
              setErrorModalMessage(
                <>청약 신청은 <span className="text-primary">영업일 09:00 ~ 17:00</span> 에 가능해요.</>,
              );
              return;
            }
            setShowConfirmModal(true);
          }}
          disabled={!isValidAmount || isSubmitting}
          className="flex-1 bg-primary disabled:bg-border text-white py-4 rounded-xl font-semibold"
        >
          확인
        </button>
      </div>

      {/* 청약 신청 확인 모달 */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          showConfirmModal ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setShowConfirmModal(false)}
      />
      <div
        aria-hidden={!showConfirmModal}
        {...(!showConfirmModal ? { inert: "" } : {})}
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-[60] transition-transform duration-300 ease-out",
          showConfirmModal ? "translate-y-0" : "translate-y-[calc(100%+1rem)]",
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pt-3 pb-7">
          <h2 className="text-base font-bold text-text-primary mb-6">
            청약 신청
          </h2>

          <p className="text-lg font-bold text-text-primary text-center mb-6">
            청약을 신청하시겠습니까?
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">종목</span>
              <span className="font-semibold text-text-primary">
                {ipo.name} ({ipo.ticker})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">공모(예정)가</span>
              <span className="font-semibold text-text-primary">
                {offeringPriceLabel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">청약신청금액</span>
              <span className="font-semibold text-text-primary">
                USD {numericAmount.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">청약대행증거금</span>
              <span className="font-semibold text-text-primary">
                USD{" "}
                {subscriptionFee.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-4 bg-surface text-text-primary rounded-xl font-semibold"
            >
              취소
            </button>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setShowPinScreen(true);
              }}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-semibold"
            >
              확인
            </button>
          </div>
        </div>
      </div>

      {showPinScreen && (
        <div className="fixed inset-0 z-[80]">
          <PinKeypad
            key={pinKey}
            onEnter={handlePinEnter}
            onBack={() => {
              setShowPinScreen(false);
              setShowConfirmModal(true);
            }}
            error={pinError}
          />
        </div>
      )}

      {errorModalMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[340px] bg-white rounded-2xl px-5 py-6 text-center">
            <p className="text-sm font-medium text-text-primary mb-6 break-keep">
              {errorModalMessage}
            </p>
            <button
              onClick={() => setErrorModalMessage(null)}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
