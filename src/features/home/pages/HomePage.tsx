import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import sleepingIcon from '@/assets/home/sleeping.svg'
import changeupCard from '@/assets/home/changeup-card.png'
import { Header } from '@/components/common/Header'
import { useRequestNotification } from '@/features/home/hooks/useRequestNotification'
import { cn } from '@/lib/utils'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { useFavoriteIpos, getIpoDisplay, type FavoriteIpo } from '@/features/home/hooks/useFavoriteIpos'
import { generateLogoColor } from '@/features/ipo/utils/ipoUtils'

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
}

function getAbbr(company: string): string {
  const words = company.split(/(?=[A-Z])|[\s-]/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return company.substring(0, 2).toUpperCase()
}

function FavoriteIpoLogo({ ipo }: { ipo: FavoriteIpo }) {
  const [imgError, setImgError] = useState(false)
  const color = generateLogoColor(ipo.ticker)
  const abbr = getAbbr(ipo.companyName)
  if (ipo.logoUrl && !imgError) {
    return (
      <img
        src={ipo.logoUrl}
        alt={ipo.ticker}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
      style={{ backgroundColor: color, fontSize: 13 }}
    >
      {abbr}
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  useRequestNotification()

  const { data: assets, isLoading: assetsLoading } = useHomeAssets()
  const { data: favoriteIpos, isLoading: iposLoading } = useFavoriteIpos()

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
          {assetsLoading ? (
            <div className="mt-2 flex items-center justify-between">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-5 w-28" />
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-[25px] font-bold text-text-primary leading-none">
                ${assets?.totalUsdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—'}
              </p>
              <div className="flex items-center justify-end gap-1">
                <p className="text-[14px] font-medium text-text-secondary">달러 환율</p>
                <p className={cn('text-[14px] font-medium', rateColor)}>
                  {exchangeRate?.rate.toLocaleString('ko-KR') ?? '—'}
                </p>
                {exchangeRate?.changeRate != null && (
                  <p className={cn('text-[13px] font-light', rateColor)}>
                    {changeSign}{exchangeRate.changeRate.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 쉬는 달러 */}
        <section className="mx-4 mt-5">
          <button
            className="w-full bg-white rounded-xl px-4 py-4 flex items-center gap-4 text-left"
            onClick={() => navigate('/home/sleeping-dollar')}
          >
            <div className="bg-blue-100 px-2 py-2 rounded-3xl">
              <img src={sleepingIcon} alt="쉬는 달러 아이콘" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">쉬는 달러</p>
              <p className="text-xs text-text-secondary mt-0.5">쉬는 달러를 SOLSOL하게 적금으로!</p>
            </div>
            <ChevronRight size={16} className="text-text-tertiary flex-shrink-0" />
          </button>
        </section>

        {/* 내 계좌 */}
        <section className="mx-4 mt-5">
          <p className="text-xs text-text-secondary mb-2 px-1">내 계좌</p>
          <div className="bg-white rounded-xl">
            {assetsLoading ? (
              <>
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-4">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-14 rounded-md" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {assets?.securities && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/home/transfer/history', {
                      state: {
                        accountIds: [assets.securities.usdAccountId, assets.securities.krwAccountId],
                        accountName: 'CMA 계좌',
                        accountNumber: assets.securities.accountNumberMasked,
                        usdBalance: assets.securities.usdBalance,
                        krwBalance: assets.securities.krwBalance,
                        totalUsdBalance: assets.securities.totalUsdBalance,
                        accountType: 'SECURITIES',
                      },
                    })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click() } }}
                    className="w-full flex items-center gap-4 px-4 py-4 text-left cursor-pointer"
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
                        navigate('/home/transfer', { state: { fromAccountId: assets.securities.usdAccountId, sourceName: 'CMA 계좌', sourceBalance: `$${assets.securities.usdBalance.toFixed(2)}` } })
                      }}
                      className="flex-shrink-0 px-4 py-2 bg-surface-bg rounded-lg text-xs font-medium text-text-secondary"
                    >
                      송금
                    </button>
                  </div>
                )}

                {[...(assets?.accounts ?? [])].sort((a) => a.accountType === 'DEPOSIT' ? -1 : 1).map((acc) => (
                  <div
                    key={acc.accountId}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/home/transfer/history', {
                      state: {
                        accountIds: [acc.accountId],
                        accountName: acc.accountName,
                        accountNumber: acc.accountNumberMasked,
                        balance: acc.balance,
                        accountType: acc.accountType,
                        maturityDate: acc.maturityDate,
                      },
                    })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click() } }}
                    className="w-full flex items-center gap-4 px-4 py-4 text-left cursor-pointer"
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
                    {acc.accountType !== 'SAVINGS' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/home/transfer', { state: { fromAccountId: acc.accountId, sourceName: acc.accountName, sourceBalance: `$${acc.balance.toFixed(2)}` } })
                        }}
                        className="flex-shrink-0 px-4 py-2 bg-surface-bg rounded-lg text-xs font-medium text-text-secondary"
                      >
                        송금
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* 이번 달 소비 */}
        {assetsLoading ? (
          <section className="mx-4 mt-5">
            <p className="text-xs text-text-secondary mb-2 px-1">이번 달 소비</p>
            <div className="bg-white rounded-xl px-4 py-4 flex items-center gap-4">
              <Skeleton className="w-8 h-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-12 rounded-md" />
            </div>
          </section>
        ) : (
          assets?.cards.map((card, i) => (
            <section key={i} className="mx-4 mt-5">
              <p className="text-xs text-text-secondary mb-2 px-1">이번 달 소비</p>
              <div className="bg-white rounded-xl px-4 py-4 flex items-center gap-4">
                <img src={changeupCard} className="w-8 h-15 object-cover" alt="카드 이미지" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary truncate">{card.cardName}</p>
                  <p className="text-sm font-bold text-text-primary mt-0.5">—</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/home/card/history') }}
                  className="flex-shrink-0 px-4 py-2 bg-surface-bg rounded-lg text-sm font-medium text-text-secondary"
                >
                  내역
                </button>
              </div>
            </section>
          ))
        )}

        {/* 관심 IPO */}
        <section className="mx-4 mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs text-text-secondary">관심 IPO</p>
            <button
              onClick={() => navigate('/ipo', { state: { bottomFilter: '관심' } })}
              className="flex items-center gap-0.5 text-xs text-text-secondary"
            >
              전체보기 <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {iposLoading ? (
              <>
                {[0, 1].map((i) => (
                  <div key={i} className="bg-white rounded-[12px] px-[17px] py-[18px] flex items-center gap-[18px]">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {favoriteIpos?.length === 0 && (
                  <div className="bg-white rounded-xl px-5 py-8 flex flex-col items-center gap-3">
                    <p className="text-sm text-text-tertiary">등록된 관심 IPO가 없어요</p>
                    <button
                      onClick={() => navigate('/ipo')}
                      className="flex items-center gap-1 text-xs font-medium text-primary border border-primary rounded-full px-4 py-1.5"
                    >
                      등록하러 가기 <ChevronRight size={12} />
                    </button>
                  </div>
                )}
                {(favoriteIpos ?? []).map((ipo) => {
                  const { label, dday } = getIpoDisplay(ipo)
                  return (
                    <div
                      key={ipo.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/ipo/${ipo.ipoId}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/ipo/${ipo.ipoId}`) } }}
                      className="relative w-full bg-white rounded-[12px] pt-[17.5px] pl-[17px] pr-[17px] pb-[22px] text-left transition-all duration-75 active:scale-[0.97] active:bg-[#F2F3F5] select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-[18px] min-w-0">
                        <FavoriteIpoLogo ipo={ipo} />
                        <div className="translate-y-[1px] min-w-0 max-w-[160px]">
                          <p className="text-[15px] font-bold text-[#111827] leading-[17.5px] truncate">{ipo.companyName}</p>
                          <p className="text-[12px] text-[#7F858F] mt-[2px] leading-[17.5px]">{ipo.ticker}</p>
                        </div>
                      </div>
                      <img
                        src={ipo.ipoStatus === 'CLOSED' ? '/icons/IPO_end.svg' : ipo.ipoStatus === 'UPCOMING' ? '/icons/IPO_upcoming.svg' : '/icons/IPO_ready.svg'}
                        width={50} height={17}
                        alt={label}
                        className="absolute top-[17.5px] right-[17px] translate-x-[3px]"
                      />
                      {dday && (
                        <span className="absolute top-[39px] right-[17px] text-[11px] font-bold text-[#CA3D40]">{dday}</span>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </section>

        <div className="h-6" />
      </div>
    </div>
  )
}
