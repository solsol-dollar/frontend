import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import dollarIcon from '@/assets/home/dollarIconGreen.svg';
import wonIcon from '@/assets/home/wonIconBlue.svg';

interface Props {
  open: boolean
  onClose: () => void
  returnTo?: string
}

export function ExchangeSheet({ open, onClose, returnTo }: Props) {
  const navigate = useNavigate()

  const handleSelect = (direction: 'dollar-to-won' | 'won-to-dollar') => {
    onClose()
    navigate('/home/exchange', { state: { direction, returnTo, depth: returnTo ? 1 : 0 } })
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-20 bg-black/20 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-white rounded-3xl z-30 transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-[calc(100%+1rem)]',
        )}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-6 pt-3 pb-7">
          <p className="text-lg font-semibold text-text-primary mb-6">어떻게 환전할까요?</p>
          <button onClick={() => handleSelect('won-to-dollar')} className="w-full flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img className="w-6" src={dollarIcon} alt='달러아이콘'/>
            </div>
            <span className="text-lg text-text-primary">달러로 환전하기</span>
          </button>
          <button onClick={() => handleSelect('dollar-to-won')} className="w-full flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <img className="w-6" src={wonIcon} alt='원아이콘'/>
            </div>
            <span className="text-lg text-text-primary">원화로 환전하기</span>
          </button>
        </div>
      </div>
    </>
  )
}
