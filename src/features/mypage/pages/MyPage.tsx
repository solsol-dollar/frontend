import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { useMyPageAccounts } from '@/features/mypage/hooks/useMyPage'
import solBankIcon from '@/assets/common/sol-bank-icon.svg'
import shinhanLogo from '@/assets/home/shinhan-logo.svg'
import changeupCard from '@/assets/home/changeup-card.png'

interface ProductDef {
  id: string
  accountType: 'DEPOSIT' | 'SAVINGS' | 'CARD'
  name: string
  description: string
}

const BANK_PRODUCT_DEFS: ProductDef[] = [
  { id: 'valueup', accountType: 'SAVINGS', name: '신한 Value-up 외화적립예금', description: '연 3.2% 이자를 SOLSOL하게' },
  { id: 'changeup', accountType: 'DEPOSIT', name: '신한 외화 체인지업 예금', description: '환율 걱정 없이 SOLSOL하게' },
]

const CARD_PRODUCT_DEF: ProductDef = {
  id: 'card',
  accountType: 'CARD',
  name: '신한카드 Change-up 체크',
  description: '내 외화, 필요한 곳에 바로',
}

function SolBankLogo() {
  return (
    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
      <img src={solBankIcon} className="w-10 h-10 object-contain" alt="" />
    </div>
  )
}

export function MyPage() {
  const navigate = useNavigate()
  const { data } = useMyPageAccounts()
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  const accounts = data?.accounts ?? []
  const cards = data?.cards ?? []

  const securitiesAccounts = accounts.filter((a) => a.accountType === 'SECURITIES')
  const depositAccount = accounts.find((a) => a.accountType === 'DEPOSIT')
  const savingsAccount = accounts.find((a) => a.accountType === 'SAVINGS')

  const showToast = (msg: string) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  const handleCardAdd = () => {
    if (!depositAccount) {
      showToast('외화 체인지업 예금 계좌를 먼저 만들어주세요')
      return
    }
    navigate('/mypage/product/card')
  }

  return (
    <div className="page-content min-h-screen bg-surface-bg">
      <Header title="마이페이지" showNotification showSearch showMypage={false} />

      <p className="mx-5 mt-6 mb-3 text-xs font-medium text-text-tertiary">내 계좌</p>
      <div className="mx-4 bg-white rounded-2xl overflow-hidden">

        {/* 증권 계좌 (항상 연결됨) */}
        {securitiesAccounts.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src={shinhanLogo} className="w-10 h-10 object-contain" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">신한투자증권 CMA 계좌</p>
              <p className="text-xs text-text-tertiary mt-0.5">{securitiesAccounts[0].accountNumberMasked}</p>
            </div>
            <Check size={18} className="text-primary flex-shrink-0" />
          </div>
        )}

        {/* 은행 상품 (연결 여부에 따라 ✓ or 추가) */}
        {BANK_PRODUCT_DEFS.map((def, i) => {
          const connected = def.accountType === 'SAVINGS' ? savingsAccount : depositAccount
          return (
            <div
              key={def.id}
              className={`flex items-center gap-3 px-4 py-4 ${i < BANK_PRODUCT_DEFS.length - 1 ? 'border-b border-border' : ''}`}
            >
              <SolBankLogo />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{def.name}</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {connected ? connected.accountNumberMasked : def.description}
                </p>
              </div>
              {connected ? (
                <Check size={18} className="text-primary flex-shrink-0" />
              ) : (
                <button
                  onClick={() => navigate(`/mypage/product/${def.id}`)}
                  className="flex-shrink-0 px-4 py-2 bg-surface-bg rounded-lg text-xs font-medium text-text-secondary"
                >
                  추가
                </button>
              )}
            </div>
          )
        })}
       </div>
      <p className="mx-5 mt-6 mb-3 text-xs font-medium text-text-tertiary">내 카드</p>
      <div className="mx-4 bg-white rounded-2xl overflow-hidden">

        {/* 카드 */}
        {cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.cardId} className="flex items-center gap-3 px-4 py-4">
              <div className="w-10 h-14 flex items-center justify-center flex-shrink-0">
                <img src={changeupCard} className="w-8 h-12 object-contain" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{card.cardName}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{card.cardNumberMasked}</p>
              </div>
              <Check size={18} className="text-primary flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-14 flex items-center justify-center flex-shrink-0">
              <img src={changeupCard} className="w-8 h-12 object-contain" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{CARD_PRODUCT_DEF.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{CARD_PRODUCT_DEF.description}</p>
            </div>
            <button
              onClick={handleCardAdd}
              className="flex-shrink-0 px-4 py-2 bg-surface-bg rounded-lg text-xs font-medium text-text-secondary"
            >
              추가
            </button>
          </div>
        )}
      </div>

      {/* 토스트 */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-2rem)] bg-gray-800 text-white text-sm px-4 py-2.5 rounded-xl transition-all duration-300 z-50 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {toast}
      </div>

    </div>
  )
}
