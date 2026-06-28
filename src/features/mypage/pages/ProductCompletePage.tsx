import { useNavigate, useParams } from 'react-router-dom'
import solBankIcon from '@/assets/common/sol-bank-icon.svg'
import changeupCard from '@/assets/home/changeup-card.png'

const PRODUCT_NAMES: Record<string, string> = {
  valueup: '신한 Value-up 외화적립예금',
  changeup: '신한 외화 체인지업 예금',
  card: '신한카드 Change-up 체크',
}

export function ProductCompletePage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const productName = PRODUCT_NAMES[productId ?? ''] ?? '상품'

  return (
    <div className="mobile-container flex flex-col h-screen bg-white">
      <header className="flex items-center px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        {productId === 'card' ? (
          <div className="w-20 h-20 flex items-center justify-center mb-2">
            <img src={changeupCard} className="w-12 h-[72px] object-contain" alt="" />
          </div>
        ) : (
          <div className="w-20 h-20 flex items-center justify-center mb-2">
            <img src={solBankIcon} className="w-20 h-20 object-contain" alt="" />
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-bold text-primary leading-snug">{productName}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">가입완료</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/mypage', { replace: true })}
        className="mx-4 mb-8 bg-primary text-white py-4 rounded-2xl font-semibold text-base"
      >
        완료
      </button>
    </div>
  )
}
