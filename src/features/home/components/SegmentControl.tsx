import { cn } from '@/lib/utils'

interface Props {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export function SegmentControl({ tabs, active, onChange }: Props) {
  return (
    <div className="flex bg-surface-neutral rounded-xl p-1 gap-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
            active === t ? 'bg-white text-text-primary shadow-sm' : 'text-text-sub',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
