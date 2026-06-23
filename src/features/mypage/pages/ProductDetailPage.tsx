import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateDepositAccount, useIssueCard } from '@/features/mypage/hooks/useMyPage'
import shinhanLogo from '@/assets/home/shinhan-logo.svg'

interface ProductInfo {
  name: string
  type: 'SAVINGS' | 'DEPOSIT' | 'CARD'
  bullets: string[]
  buttonLabel: string
}

const PRODUCTS: Record<string, ProductInfo> = {
  valueup: {
    name: '신한 Value-up\n외화적립예금',
    type: 'SAVINGS',
    bullets: [
      '해외송금을 보내시는 개인 및 법인 고객',
      '외화자산에 일정부분 투자하여 자산의 분산 운용 및 포트폴리오의 다양화를 바라고자 하시는 고객',
      '해외 유학, 이민 등을 준비하는 기간 동안 안정적으로 외화를 모으고자 하시는 고객',
    ],
    buttonLabel: '예금 만들기',
  },
  changeup: {
    name: '신한 외화\n체인지업 예금',
    type: 'DEPOSIT',
    bullets: [
      '외화를 안정적으로 보관하고 싶은 고객',
      '환율 변동에 관계없이 달러 자산을 보유하고 싶은 고객',
      '해외여행 및 유학 자금을 미리 준비하는 고객',
    ],
    buttonLabel: '예금 만들기',
  },
  card: {
    name: '신한카드\nChange-up 체크',
    type: 'CARD',
    bullets: [
      '해외 결제가 잦은 고객',
      '외화 계좌와 연동하여 편리하게 사용하고 싶은 고객',
      '환전 수수료 없이 해외에서 결제하고 싶은 고객',
    ],
    buttonLabel: '카드 신청하기',
  },
}

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const product = PRODUCTS[productId ?? '']

  const createDeposit = useCreateDepositAccount()
  const issueCard = useIssueCard()

  const [error, setError] = useState<string | null>(null)

  if (!product) {
    navigate('/mypage', { replace: true })
    return null
  }

  const isPending = createDeposit.isPending || issueCard.isPending

  const handleApply = async () => {
    setError(null)

    if (product.type === 'SAVINGS') {
      navigate(`/mypage/product/${productId}/maturity`)
      return
    }

    try {
      if (product.type === 'DEPOSIT') {
        const result = await createDeposit.mutateAsync()
        navigate(`/mypage/product/${productId}/complete`, { state: { maturityDate: result.maturityDate } })
      } else {
        await issueCard.mutateAsync()
        navigate(`/mypage/product/${productId}/complete`)
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
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
          <img src={shinhanLogo} className="w-9 h-9 object-contain" alt="" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary leading-snug whitespace-pre-line mb-8">
          {product.name}
        </h1>

        <p className="text-base font-semibold text-text-primary mb-4">이런 고객님에게 유리한 상품입니다</p>

        <ul className="space-y-3">
          {product.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{bullet}</p>
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
