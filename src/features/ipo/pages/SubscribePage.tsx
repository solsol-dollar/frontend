import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function SubscribePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [amount, setAmount] = useState('')

  const exchangeRate = 1312.34
  const usdAmount = parseFloat(amount || '0')
  const krwAmount = usdAmount * exchangeRate

  const handleKey = (k: string) => {
    if (k === '←') setAmount((p) => p.slice(0, -1))
    else setAmount((p) => p + k)
  }

  return (
    <div className="flex flex-col h-screen mobile-container">
      <Header showBack title="청약 신청" showNotification={false} showMypage={false} />

      <div className="flex-1 flex flex-col">
        {/* 환율 표시 */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl">
            <span className="text-2xl">🇺🇸</span>
            <div className="flex-1">
              <p className="text-xl font-bold text-text-primary">$ {amount || '0'}.00</p>
            </div>
          </div>

          <div className="mt-2 px-2">
            <p className="text-xs text-text-tertiary text-center">▼</p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl mt-2">
            <span className="text-2xl">🇰🇷</span>
            <div className="flex-1">
              <p className="text-xl font-bold text-text-primary">
                ₩ {krwAmount.toLocaleString('ko-KR')}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                1 USD = {exchangeRate.toLocaleString('ko-KR')}원
              </p>
            </div>
          </div>
        </div>

        {/* 숫자 키패드 */}
        <div className="flex-1 grid grid-cols-3 border-t border-border">
          {['1','2','3','4','5','6','7','8','9','.','0','←'].map((k) => (
            <button
              key={k}
              onClick={() => handleKey(k)}
              className="py-5 text-xl font-medium text-text-primary active:bg-surface transition-colors border-b border-r border-border"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => navigate(`/ipo/${id}/subscribe/exchange`)}
          disabled={!amount}
          className="w-full bg-primary disabled:bg-border text-white py-4 rounded-xl font-semibold"
        >
          환료
        </button>
      </div>
    </div>
  )
}
