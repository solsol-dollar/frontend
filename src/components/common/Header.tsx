import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showNotification?: boolean
  showMypage?: boolean
  showSearch?: boolean
  showSettings?: boolean
  rightAction?: React.ReactNode
}

export function Header({
  title,
  showBack = false,
  showNotification = true,
  showMypage = true,
  showSearch = false,
  showSettings = false,
  rightAction,
}: HeaderProps) {
  const navigate = useNavigate()

  // 뒤로가기 + 타이틀: 타이틀을 절대 중앙 정렬
  if (showBack) {
    return (
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-[56px]">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-text-primary">
            {title}
          </span>
        )}

        <div className="flex items-center gap-4 z-10">
          {rightAction}
          {showSettings && (
            <button onClick={() => navigate('/notifications/settings')} className="p-1">
              <Settings size={20} className="text-text-primary" />
            </button>
          )}
          {showNotification && (
            <button onClick={() => navigate('/notifications')}>
              <img src="/icons/Bell.svg" width={25} height={25} alt="" />
            </button>
          )}
          {showSearch && (
            <button>
              <img src="/icons/search.svg" width={19} height={19} alt="" />
            </button>
          )}
        </div>
      </header>
    )
  }

  // 기본 헤더: 로고 or 타이틀 좌측, 액션 우측
  return (
    <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 h-14">
      <div className="flex items-center">
        {title ? (
          <span className="text-lg font-bold text-text-primary">{title}</span>
        ) : (
          <span className="text-lg font-bold">
            <span className="text-primary">SOL SOL</span> 달러
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <button>
            <img src="/icons/search.svg" width={19} height={19} alt="" />
          </button>
        )}
        {showNotification && (
          <button onClick={() => navigate('/notifications')}>
            <img src="/icons/Bell.svg" width={25} height={25} alt="" />
          </button>
        )}
        {showMypage && (
          <button
            onClick={() => navigate('/mypage')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">MY</span>
          </button>
        )}
      </div>
    </header>
  )
}
