import { useState } from 'react'
import { Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useCreateDepositAccount, useIssueCard } from '@/features/mypage/hooks/useMyPage'
import solBankIcon from '@/assets/common/sol-bank-icon.svg'
import changeupCard from '@/assets/home/changeup-card.png'
import checkIcon from '@/assets/home/check.svg'

interface ProductInfo {
  name: string
  type: 'SAVINGS' | 'DEPOSIT' | 'CARD'
  bullets: string[]
  buttonLabel: string
}

const CHANGE_UP_BULLETS = [
  '해외여행, 해외직구 등 해외 결제를 자주 이용하며 환전 및 결제 수수료 부담을 줄이고자 하시는 고객',
  '달러(USD) 자산을 보유하고 있으며 해외 결제 및 현금 인출 시 보유 외화를 직접 활용하고자 하시는 고객',
  '해외 가맹점 이용 및 해외 현금 인출 서비스를 자주 이용하는 고객',
]

const PRODUCTS: Record<string, ProductInfo> = {
  valueup: {
    name: '신한 Value-up\n외화적립예금',
    type: 'SAVINGS',
    bullets: [
      '해외송금을 보내시는 개인 및 법인 고객',
      '외화자산에 일정부분 투자하여 자산의 분산 운용 및 포트폴리오의 다양화를 꾀하고자 하시는 고객',
      '해외 유학, 이민 등을 준비하는 기간 동안 안정적으로 외화를 모으고자 하시는 고객',
    ],
    buttonLabel: '예금 만들기',
  },
  changeup: {
    name: '신한 외화\n체인지업 예금',
    type: 'DEPOSIT',
    bullets: CHANGE_UP_BULLETS,
    buttonLabel: '예금 만들기',
  },
  card: {
    name: '신한카드\nChange-up 체크',
    type: 'CARD',
    bullets: CHANGE_UP_BULLETS,
    buttonLabel: '카드 신청하기',
  },
}

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const { state } = useLocation()
  const returnTo: string | undefined = state?.returnTo
  const product = PRODUCTS[productId ?? '']

  const createDeposit = useCreateDepositAccount()
  const issueCard = useIssueCard()

  const [error, setError] = useState<string | null>(null)

  if (!product) {
    return <Navigate to="/mypage" replace />
  }

  const isPending = createDeposit.isPending || issueCard.isPending

  const handleApply = async () => {
    setError(null)

    if (product.type === 'SAVINGS') {
      navigate(`/mypage/product/${productId}/maturity`, { state: { returnTo } })
      return
    }

    try {
      if (product.type === 'DEPOSIT') {
        const result = await createDeposit.mutateAsync()
        navigate(`/mypage/product/${productId}/complete`, { state: { maturityDate: result.maturityDate, returnTo } })
      } else {
        await issueCard.mutateAsync()
        navigate(`/mypage/product/${productId}/complete`, { state: { returnTo } })
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? '오류가 발생했습니다')
    }
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <header className="flex items-center px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <div className="flex-1 px-5 pt-2 flex flex-col">
        {product.type === 'CARD' ? (
          <div className="w-16 h-16 flex items-center justify-center mb-6">
            <img src={changeupCard} className="w-10 h-14 object-contain" alt="" />
          </div>
        ) : (
          <div className="w-16 h-16 flex items-center justify-center mb-6">
            <img src={solBankIcon} className="w-16 h-16 object-contain" alt="" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-text-primary leading-snug whitespace-pre-line mb-6">
          {product.name}
        </h1>

        <p className="text-lg font-semibold text-text-primary mb-8">이런 고객님에게 유리한 상품입니다</p>

        <ul className="space-y-3">
          {product.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-surface flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src={checkIcon} className="w-3 h-3" alt="" />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed break-keep">{bullet}</p>
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 text-sm text-danger text-center">{error}</p>
        )}

        <div className="flex-1" />
      </div>

      <button
        onClick={handleApply}
        disabled={isPending}
        className="mx-4 mb-8 bg-primary text-white py-4 rounded-2xl font-semibold text-base disabled:opacity-60"
      >
        {isPending ? '처리 중...' : product.buttonLabel}
      </button>
    </div>
  )
}
