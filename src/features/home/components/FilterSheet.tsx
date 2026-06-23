import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  options: string[]
  selected: string
  onSelect: (value: string) => void
}

export function FilterSheet({ open, onClose, options, selected, onSelect }: Props) {
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
        <div className="px-6 pt-2 pb-4">
          <p className="text-lg font-semibold text-text-primary">내역 선택</p>
        </div>
        <div className="px-6 pb-4">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); onClose() }}
              className="w-full flex items-center justify-between py-5 text-lg text-text-primary"
            >
              <span>{opt}</span>
              {selected === opt && <Check size={20} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
