import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Header } from '@/components/common/Header'

const SOURCE_ACCOUNTS = [
  { id: 'cma', displayName: '내 CMA(RP형)', name: '신한투자증권 CMA 계좌', number: '270-14-164537', balance: '$8,200.00' },
  { id: 'valueup', displayName: '내 Value-up', name: '신한 Value-up 외화적립예금', number: '270-1645-9275-43', balance: '$6,280.50' },
]

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←']

export function FillPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const dest = {
    displayName: state?.destName ?? '신한 외화 체인지업 예금',
    balance: state?.destBalance ?? '$3,850.50',
  }

  const [showSheet, setShowSheet] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')

  const selected = SOURCE_ACCOUNTS.find((a) => a.id === selectedId) ?? null
  const canProceed = !!selected && amount.length > 0 && amount !== '.'

  const onKey = (k: string) => {
    if (k === '←') { setAmount((p) => p.slice(0, -1)); return }
    if (k === '.') { if (!amount.includes('.')) setAmount((p) => p + '.'); return }
    const [, dec] = amount.split('.')
    if (dec !== undefined && dec.length >= 2) return
    setAmount((p) => p + k)
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <Header showBack title="송금" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col px-5 pt-6 min-h-0">
        {/* 출금 계좌 — 선택 */}
        <button onClick={() => setShowSheet(true)} className="text-left mb-5 h-[52px] flex flex-col justify-start">
          {selected ? (
            <>
              <p className="text-lg leading-snug">
                <span className="font-bold text-text-primary">{selected.displayName}</span>
                <span className="text-text-secondary"> 에서</span>
              </p>
              <p className="text-sm text-text-tertiary mt-1">잔액 {selected.balance}</p>
            </>
          ) : (
            <>
              <p className="text-lg text-text-tertiary mt-2">계좌를 선택하세요</p>
              <p className="text-sm text-text-tertiary mt-1 invisible">잔액</p>
            </>
          )}
        </button>

        {/* 입금 계좌 — 고정 */}
        <div className="mb-8">
          <p className="text-lg leading-snug">
            <span className="font-bold text-text-primary">{dest.displayName}</span>
            <span className="text-text-secondary"> 계좌로</span>
          </p>
          <p className="text-sm text-text-tertiary mt-1">잔액 {dest.balance}</p>
        </div>

        {/* 금액 표시 */}
        <div className="mb-4">
          {amount ? (
            <p className="text-[26px] font-semibold text-text-primary leading-tight">$ {amount}</p>
          ) : (
            <p className="text-[26px] font-medium text-text-sub leading-tight flex items-center gap-1">
              <span className="inline-block w-[3px] h-7 bg-primary-300 animate-blink" />
              얼마나 채울까요?
            </p>
          )}
        </div>

        <div className="flex-1" />
      </div>

      {/* 다음 버튼 */}
      {canProceed && (
        <button
          onClick={() => navigate('/home/transfer/confirm', { state: { account: { displayName: dest.displayName }, amount } })}
          className="w-full bg-primary text-white py-3 font-semibold"
        >
          다음
        </button>
      )}

      {/* 키패드 */}
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

      {/* 딤 배경 */}
      <div
        className={`fixed inset-0 z-20 bg-black/20 transition-opacity duration-300 ${showSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowSheet(false)}
      />

      {/* 출금 계좌 선택 바텀시트 */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white rounded-t-3xl z-30 transition-transform duration-300 ease-out ${showSheet ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="divide-y divide-border px-4">
          {SOURCE_ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedId(acc.id)}
              className="w-full flex items-center gap-3 py-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold text-center leading-tight">
                  SOL
                  <br />
                  Bank
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary truncate">{acc.name}</p>
                <p className="text-sm font-bold text-text-primary">{acc.number}</p>
              </div>
              {selectedId === acc.id && <Check size={18} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSheet(false)}
          className="w-full bg-primary text-white py-4 mt-5 font-semibold"
        >
          완료
        </button>
      </div>
    </div>
  )
}
