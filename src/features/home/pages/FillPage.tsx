import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { useHomeAssets } from '@/features/home/hooks/useHomeAssets'
import { useAnimatedInput } from '@/hooks/useAnimatedInput'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←']

export function FillPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const toAccountId: number | undefined = state?.toAccountId
  const destName: string = state?.destName ?? '외화 예금'
  const destBalance: string = state?.destBalance ?? '$0.00'
  const fixedFromAccountId: number | undefined = state?.fixedFromAccountId
  const fixedFromName: string | undefined = state?.fixedFromName
  const fixedFromBalance: string | undefined = state?.fixedFromBalance

  const { data: assets } = useHomeAssets()

  interface SourceAccount {
    accountId: number
    displayName: string
    accountName: string
    accountNumber: string
    balance: number
  }

  const sourceAccounts: SourceAccount[] = [
    ...(assets?.securities
      ? [{
          accountId: assets.securities.usdAccountId,
          displayName: '신한투자증권 CMA 계좌',
          accountName: '신한투자증권 CMA 계좌',
          accountNumber: assets.securities.virtualAccountNumber 
            ? `가상계좌 ${assets.securities.virtualAccountNumber}` 
            : assets.securities.accountNumberMasked,
          balance: assets.securities.usdAvailableBalance,
        }]
      : []),
    ...(assets?.accounts
      .filter((a) => a.accountId !== toAccountId)
      .map((a) => ({
        accountId: a.accountId,
        displayName: a.accountName,
        accountName: a.accountName,
        accountNumber: a.accountNumberMasked,
        balance: a.availableBalance ?? a.balance,
      })) ?? []),
  ]

  const isFixed = fixedFromAccountId !== undefined
  const [showSheet, setShowSheet] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(fixedFromAccountId ?? null)

  useEffect(() => {
    if (!isFixed) {
      const t = setTimeout(() => setShowSheet(true), 50)
      return () => clearTimeout(t)
    }
  }, [isFixed])

  const selected = isFixed
    ? { accountId: fixedFromAccountId!, displayName: fixedFromName ?? '신한투자증권 CMA 계좌', accountName: fixedFromName ?? '신한투자증권 CMA 계좌', accountNumber: '', balance: parseFloat((fixedFromBalance ?? '$0').replace(/[^0-9.]/g, '')) }
    : sourceAccounts.find((a) => a.accountId === selectedId) ?? null

  const { chars, amount, pushChar, popChar } = useAnimatedInput()
  const amountNum = parseFloat(amount) || 0
  const isOverBalance = !!selected && amountNum > 0 && amountNum > selected.balance
  const canProceed = !!selected && amountNum > 0 && amount !== '.' && !isOverBalance

  const onKey = (k: string) => {
    if (k === '←') { popChar(); return }
    if (k === '.') { if (!amount.includes('.')) pushChar('.'); return }
    const [, dec] = amount.split('.')
    if (dec !== undefined && dec.length >= 2) return
    pushChar(k)
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="채우기" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col px-5 pt-6 min-h-0">
        {isFixed ? (
          <div className="text-left mb-5 h-[52px] flex flex-col justify-start">
            <p className="text-lg leading-snug">
              <span className="font-bold text-text-primary">{selected?.displayName}</span>
              <span className="text-text-secondary"> 에서</span>
            </p>
            <p className="text-sm text-text-tertiary mt-1">잔액 {fixedFromBalance}</p>
          </div>
        ) : (
          <button onClick={() => setShowSheet(true)} className="text-left mb-5 h-[52px] flex flex-col justify-start">
            {selected ? (
              <>
                <p className="text-lg leading-snug">
                  <span className="font-bold text-text-primary">{selected.displayName}</span>
                  <span className="text-text-secondary"> 에서</span>
                </p>
                <p className={`text-sm mt-1 ${isOverBalance ? 'text-danger' : 'text-text-tertiary'}`}>
                  잔액 ${selected.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-text-tertiary mt-2">계좌를 선택하세요</p>
                <p className="text-sm text-text-tertiary mt-1 invisible">잔액</p>
              </>
            )}
          </button>
        )}

        <div className="mb-8">
          <p className="text-lg leading-snug">
            <span className="font-bold text-text-primary">{destName}</span>
            <span className="text-text-secondary"> 계좌로</span>
          </p>
          <p className="text-sm text-text-tertiary mt-1">잔액 {destBalance}</p>
        </div>

        <div className="mb-4 h-10 overflow-hidden">
          {chars.length > 0 ? (
            <div className="flex items-baseline gap-0">
              <span className="text-[26px] font-semibold text-text-primary mr-1">$</span>
              {chars.map((c: { char: string; id: number; exiting: boolean }) => (
                <span
                  key={c.id}
                  className={`text-[26px] font-semibold text-text-primary inline-block ${c.exiting ? 'animate-char-out' : 'animate-char-in'}`}
                >
                  {c.char}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[26px] font-medium text-text-sub leading-tight flex items-center gap-1">
              <span className="inline-block w-[3px] h-7 bg-primary-300 animate-blink" />
              얼마나 채울까요?
            </p>
          )}
        </div>

        <div className="flex-1" />
      </div>

      {canProceed && (
        <button
          onClick={() => navigate('/home/transfer/confirm', {
            replace: true,
            state: {
              fromAccountId: selected!.accountId,
              toAccountId,
              sourceName: selected!.displayName,
              destName,
              sourceBalance: `$${selected!.balance.toFixed(2)}`,
              destBalance,
              amount,
            },
          })}
          className="w-full bg-primary text-white py-3 font-semibold"
        >
          다음
        </button>
      )}

      <div className="grid grid-cols-3 bg-white">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => onKey(k)}
            className="py-5 text-2xl font-normal text-text-primary active:bg-surface-neutral transition-colors"
          >
            {k}
          </button>
        ))}
      </div>

      {!isFixed && <div
        className={`fixed inset-0 z-20 bg-black/20 transition-opacity duration-300 ${showSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowSheet(false)}
      />}
      {!isFixed && <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-3xl z-30 transition-transform duration-300 ease-out ${showSheet ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="divide-y divide-border px-4">
          {sourceAccounts.map((acc) => (
            <button
              key={acc.accountId}
              onClick={() => { setSelectedId(acc.accountId); setShowSheet(false) }}
              className="w-full flex items-center gap-3 py-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold text-center leading-tight">SOL<br />Bank</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary truncate">{acc.accountName}</p>
                <p className="text-sm font-semibold text-text-primary">{acc.accountNumber}</p>
              </div>
              {selectedId === acc.accountId && <Check size={18} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
            <div className="pb-[calc(2rem+env(safe-area-inset-bottom))]" />
          </div>}
    </div>
  )
}
