import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, X } from "lucide-react";
import { Header } from "@/components/common/Header";

const MOCK_SUBSCRIPTION = {
  ticker: "CRWV",
  name: "CoreWeave",
  color: "#FF6830",
  status: "청약가능",
  dday: "D-2",
  offeringPrice: "USD 20.000",
  pricePerShare: 20,
  milestones: [
    { label: "청약시작일", date: "2026.06.24", done: true },
    { label: "청약마감일", date: "2026.09.04", current: true },
    { label: "상장(예정)일", date: "2026.09.05", done: false },
    { label: "환불(예정)일", date: "2026.09.06", done: false },
  ],
  availableAmount: 1084455,
  foreignBalance: 25340,
  cmaBalanceKrw: 1548320,
  exchangeRate: 1512.54,
  exchangeableKrw: 102254,
  exchangeableUsd: 66.84,
  account: "270-91-175039[01] CMA 김희선",
};

export function SubscribePage() {
  const navigate = useNavigate();
  useParams();
  const [liked, setLiked] = useState(false);
  const [amount, setAmount] = useState("");
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeKrw, setExchangeKrw] = useState("");
  const [showForeignModal, setShowForeignModal] = useState(false);
  const [showPullModal, setShowPullModal] = useState(false);
  const [pullAmount, setPullAmount] = useState("");

  const ipo = MOCK_SUBSCRIPTION;

  const numericAmount = Number(amount || 0);
  const maxSubscribable = Math.floor(ipo.availableAmount / 1.01);
  const maxShares = Math.floor(maxSubscribable / ipo.pricePerShare);
  const isValidAmount =
    numericAmount >= 100 &&
    Number.isInteger(numericAmount) &&
    numericAmount <= maxSubscribable;

  const subscriptionFee = useMemo(() => {
    if (!isValidAmount) return 0;
    return Math.round(numericAmount * 1.01);
  }, [numericAmount, isValidAmount]);

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
          <button onClick={() => setLiked((v) => !v)} className="p-1">
            <Heart
              size={22}
              className={liked ? "text-heart fill-heart" : "text-text-tertiary"}
            />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface-bg">
        {/* 종목 헤더 */}
        <section className="px-4 pt-4 pb-5 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: ipo.color }}
              >
                {ipo.ticker.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-base font-bold text-text-primary">
                  {ipo.name}
                </h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  {ipo.ticker}
                </p>
              </div>
            </div>
            <div
              className="flex flex-col items-end gap-1 mr-1
            
            "
            >
              <span className="px-2 py-0.5 rounded-full border border-warning text-warning text-xs font-semibold">
                {ipo.status}
              </span>
              <span className="text-sm text-warning font-bold mr-2">
                {ipo.dday}
              </span>
            </div>
          </div>
        </section>

        {/* 공모가 + 청약일정 */}
        <section className="px-7 py-5 bg-white mt-2 space-y-3">
          <div className="flex items-center gap-0">
            <span className="text-sm text-text-secondary w-28 flex-shrink-0">
              공모(예정)가
            </span>
            <span className="text-sm font-bold text-text-primary">
              {ipo.offeringPrice}
            </span>
          </div>

          <div className="flex gap-0">
            <span className="text-sm text-text-secondary w-28 flex-shrink-0 pt-2">
              청약일정
            </span>
            <div className="relative flex-1">
              <div className="absolute left-[5px] top-3 bottom-3 w-0.5 bg-border" />
              {ipo.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2 relative">
                  <span
                    className={`w-3 h-3 rounded-full z-10 flex-shrink-0 ${
                      m.done || m.current
                        ? "bg-primary border-2 border-primary"
                        : "bg-white border-2 border-border"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      m.current
                        ? "text-text-primary font-bold"
                        : "text-text-secondary"
                    }`}
                  >
                    {m.date} {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 계좌 정보 + 금액 + 입력 통합 섹션 */}
        <section className="bg-white mt-2">
          {/* 계좌 정보 */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-sm text-text-secondary">{ipo.account}</p>
          </div>
          <div className="h-px bg-border mx-4" />

          {/* 청약 가능 금액 */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
            <span className="text-3xl font-bold text-text-primary">
              ${ipo.availableAmount.toLocaleString("en-US")}
            </span>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm text-primary font-semibold whitespace-nowrap">
                최대 {maxShares.toLocaleString("en-US")}주 청약 가능해요!
              </span>
              <span className="text-[11px] text-text-tertiary">
                공모가 기준 예상 수량
              </span>
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
              USD {subscriptionFee.toLocaleString("en-US")}
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
              onClick={() => setShowPullModal(true)}
              className="p-3 border border-border rounded-xl text-left"
            >
              <p className="text-xs font-semibold text-text-primary">
                외화통장에서 끌어오기
              </p>
              <p className="text-sm font-bold text-text-primary mt-1">
                잔액 ${ipo.foreignBalance.toLocaleString("en-US")}
              </p>
            </button>
            <button
              onClick={() => setShowExchangeModal(true)}
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
              <p className="text-sm font-bold text-text-primary mt-1">
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
          onClick={() => setShowForeignModal(true)}
          disabled={!isValidAmount}
          className="flex-1 bg-primary disabled:bg-border text-white py-4 rounded-xl font-semibold"
        >
          청약신청
        </button>
      </div>

      {/* 환전 모달 */}
      {showExchangeModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowExchangeModal(false)}
          />
          <div className="relative bg-white rounded-t-2xl px-4 pt-5 pb-10">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-text-primary">환전하기</h2>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="p-1 text-text-tertiary"
              >
                <X size={20} />
              </button>
            </div>

            {/* CMA 원화 잔액 */}
            <div className="bg-surface rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-text-tertiary mb-1">{ipo.account} 원화 잔액</p>
              <p className="text-xl font-bold text-text-primary">
                {ipo.cmaBalanceKrw.toLocaleString("ko-KR")}원
              </p>
            </div>

            {/* 환전 금액 입력 */}
            <div className="space-y-3">
              <div className="border border-border rounded-xl px-4 py-3">
                <p className="text-xs text-text-tertiary mb-1">환전할 금액 (원)</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={exchangeKrw}
                  onChange={(e) => setExchangeKrw(e.target.value.replace(/\D/g, ""))}
                  placeholder="금액 입력"
                  className="w-full text-base font-semibold text-text-primary outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-text-tertiary">1달러 = {ipo.exchangeRate.toLocaleString("ko-KR")}원</span>
                <span className="font-semibold text-text-primary">
                  ≈ USD{" "}
                  {exchangeKrw
                    ? (Number(exchangeKrw) / ipo.exchangeRate).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowExchangeModal(false)}
                className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="flex-1 bg-primary text-white py-4 rounded-xl font-semibold"
              >
                환전하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 외화통장에서 끌어오기 모달 */}
      {showPullModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPullModal(false)}
          />
          <div className="relative bg-white rounded-t-2xl px-4 pt-5 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-text-primary">외화통장에서 끌어오기</h2>
              <button onClick={() => setShowPullModal(false)} className="p-1 text-text-tertiary">
                <X size={20} />
              </button>
            </div>

            {/* 외화통장 잔액 */}
            <div className="bg-surface rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-text-tertiary mb-1">외화통장 잔액</p>
              <p className="text-xl font-bold text-text-primary">
                ${ipo.foreignBalance.toLocaleString("en-US")}
              </p>
            </div>

            {/* 끌어올 금액 입력 */}
            <div className="border border-border rounded-xl px-4 py-3 mb-2">
              <p className="text-xs text-text-tertiary mb-1">끌어올 금액 (USD)</p>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-text-secondary">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pullAmount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (Number(v) <= ipo.foreignBalance) setPullAmount(v);
                  }}
                  placeholder="0"
                  className="flex-1 text-base font-semibold text-text-primary outline-none bg-transparent"
                />
                <button
                  onClick={() => setPullAmount(String(ipo.foreignBalance))}
                  className="text-xs text-text-secondary px-2 py-0.5 bg-surface rounded"
                >
                  전액
                </button>
              </div>
            </div>
            <p className="text-xs text-text-tertiary px-1 mb-6">
              최대 ${ipo.foreignBalance.toLocaleString("en-US")} 까지 가능해요
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPullModal(false)}
                className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-semibold"
              >
                취소
              </button>
              <button
                disabled={!pullAmount || Number(pullAmount) <= 0}
                onClick={() => {
                  setAmount(String(Number(amount || 0) + Number(pullAmount)));
                  setPullAmount("");
                  setShowPullModal(false);
                }}
                className="flex-1 bg-primary disabled:bg-border text-white py-4 rounded-xl font-semibold"
              >
                끌어오기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 외화통장 모달 (청약신청 확인) */}
      {showForeignModal && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <h2 className="text-base font-bold text-text-primary">청약 신청</h2>
            <button
              onClick={() => setShowForeignModal(false)}
              className="p-1 text-text-tertiary"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-6 space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">청약신청금액</p>
              <p className="text-2xl font-bold text-text-primary">
                USD {numericAmount.toLocaleString("en-US")}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              {ipo.milestones.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-text-secondary">{m.date} {m.label}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-surface rounded-2xl space-y-2">
              <p className="text-sm text-text-secondary">예상 리턴금액</p>
              <p className="text-2xl font-bold text-up">$2,084,455</p>
              <p className="text-xs text-text-tertiary">이 금액 한도로 가능해요</p>

              <div className="pt-3 border-t border-border space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Cost Fee</span>
                  <span className="font-medium text-text-primary">$10,980,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">USD에 청약 시 지원금액</span>
                  <span className="font-medium text-text-primary">$10,980,000</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-text-secondary">청약신청금액</span>
              <span className="font-bold text-text-primary">
                USD {numericAmount.toLocaleString("en-US")}
              </span>
            </div>
          </div>

          <div className="px-4 pb-8 pt-3 flex gap-3 border-t border-border">
            <button
              onClick={() => setShowForeignModal(false)}
              className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-semibold"
            >
              취소
            </button>
            <button
              onClick={() => setShowForeignModal(false)}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-semibold"
            >
              청약신청
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
