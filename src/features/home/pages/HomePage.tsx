import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import sleepingIcon from '@/assets/home/sleeping.svg'
import changeupCard from '@/assets/home/changeup-card.png'
import { Header } from '@/components/common/Header'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { useFavoriteIpos, getIpoDisplay, getIpoColor } from '@/features/home/hooks/useFavoriteIpos'

export function HomePage() {
  const navigate = useNavigate()
  const { data: assets } = useHomeAssets()
  const { data: favoriteIpos } = useFavoriteIpos()

  const exchangeRate = assets?.exchangeRateInfo
  const changeSign = (exchangeRate?.changeRate ?? 0) >= 0 ? '+' : ''
  const rateColor = (exchangeRate?.changeRate ?? 0) >= 0 ? 'text-up' : 'text-danger'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto bg-surface-bg pb-20">

        {/* 총 자산 */}
        <section className="bg-white px-4 pt-5 pb-7">
          <p className="text-[16px] text-text-secondary">총 자산 (USD)</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[25px] font-bold text-text-primary leading-none">
              ${assets?.totalUsdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—'}
            </p>
            <div className="flex items-center justify-end gap-1">
              <p className="text-[14px] font-medium text-text-secondary">달러 환율</p>
              <p className={`text-[14px] font-medium ${rateColor}`}>
                {exchangeRate?.rate.toLocaleString('ko-KR') ?? '—'}
              </p>
              {exchangeRate?.changeRate != null && (
                <p className={`text-[13px] font-light ${rateColor}`}>
                  {changeSign}{exchangeRate.changeRate.toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 쉬는 달러 감지 */}
        <section className="mx-4 mt-5">
          <button
            className="w-full bg-white rounded-xl px-4 py-4 flex items-center gap-4 text-left"
            onClick={() => navigate('/home/sleeping-dollar')}
          >
            <div className="bg-blue-100 px-2 py-2 rounded-3xl">
              <img src={sleepingIcon} alt="쉬는 달러 감지 아이콘" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">쉬는 달러 감지</p>
              <p className="text-xs text-text-secondary mt-0.5">쉬는 달러를 SOLSOL하게 적금으로!</p>
            </div>
            <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
          </button>
        </section>

        {/* 내 계좌 */}
        <section className="mx-4 mt-5">
          <p className="text-xs text-text-secondary mb-2 px-1">내 계좌</p>
          <div className="bg-white rounded-xl">
            {/* CMA (증권) */}
            {assets?.securities && (
              <button
                onClick={() => navigate('/home/transfer/history', {
                  state: {
                    accountIds: [assets.securities.usdAccountId, assets.securities.krwAccountId],
                    accountName: 'CMA 계좌',
                    accountNumber: assets.securities.accountNumberMasked,
                    usdBalance: assets.securities.usdBalance,
                    krwBalance: assets.securities.krwBalance,
                    accountType: 'SECURITIES',
                  },
                })}
                className="w-full flex items-center gap-4 px-4 py-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold leading-none">SOL</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary truncate">신한투자증권 CMA 계좌</p>
                  <p className="text-sm font-bold text-text-primary mt-0.5">
                    ${assets.securities.totalUsdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/home/transfer', { state: { sourceName: 'CMA 계좌', sourceBalance: `$${assets.securities.totalUsdBalance}` } })
                  }}
                  className="flex-shrink-0 px-4 py-2 bg-border rounded-md text-xs text-text-secondary"
                >
                  송금
                </button>
              </button>
            )}

            {/* 예금/적금 계좌 */}
            {assets?.accounts.map((acc) => (
              <button
                key={acc.accountId}
                onClick={() => navigate('/home/transfer/history', {
                  state: {
                    accountIds: [acc.accountId],
                    accountName: acc.accountName,
                    accountNumber: acc.accountNumberMasked,
                    balance: acc.balance,
                    accountType: acc.accountType,
                  },
                })}
                className="w-full flex items-center gap-4 px-4 py-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold leading-none">SOL</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary truncate">{acc.accountName}</p>
                  <p className="text-sm font-bold text-text-primary mt-0.5">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/home/transfer', { state: { sourceName: acc.accountName, sourceBalance: `$${acc.balance}` } })
                  }}
                  className="flex-shrink-0 px-4 py-2 bg-border rounded-md text-xs text-text-secondary"
                >
                  송금
                </button>
              </button>
            ))}
          </div>
        </section>

        {/* 이번 달 소비 */}
        {assets?.cards.map((card, i) => (
          <section key={i} className="mx-4 mt-5">
            <p className="text-xs text-text-secondary mb-2 px-1">이번 달 소비</p>
            <div className="bg-white rounded-xl px-4 py-4 flex items-center gap-4">
              <img src={changeupCard} className="w-8 h-15 object-cover" alt="카드 이미지" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary truncate">{card.cardName}</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">—</p>
              </div>
              <button className="flex-shrink-0 px-4 py-2 bg-border rounded-md text-xs text-text-secondary">
                내역
              </button>
            </div>
          </section>
        ))}

        {/* 관심 IPO */}
        <section className="mx-4 mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs text-text-secondary">관심 IPO</p>
            <button className="flex items-center gap-0.5 text-xs text-text-secondary">
              전체보기 <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {(favoriteIpos ?? []).map((ipo) => {
              const { label, dday } = getIpoDisplay(ipo)
              const color = getIpoColor(ipo.ipoId)
              return (
                <button
                  key={ipo.id}
                  onClick={() => navigate(`/ipo/${ipo.ipoId}`)}
                  className="w-full bg-white rounded-xl p-4 flex items-center gap-4 text-left"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {ipo.ticker.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-text-primary">{ipo.companyName}</p>
                    <p className="text-xs text-text-tertiary">{ipo.ticker}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs border border-danger text-danger rounded-full px-2 py-0.5 whitespace-nowrap">
                      {label}
                    </span>
                    <span className="text-xs font-medium text-danger pr-2">{dday}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="h-6" />
      </div>
    </div>
  )
}
