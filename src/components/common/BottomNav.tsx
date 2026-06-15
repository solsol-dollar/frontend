import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Calendar, RefreshCw, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: '홈', icon: Home, path: '/home' },
  { label: 'IPO', icon: Calendar, path: '/ipo' },
  { label: '리턴플랜', icon: RefreshCw, path: '/return-plan' },
  { label: '증권', icon: BarChart2, path: '/securities' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white border-t border-border z-10">
      <ul className="flex">
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = pathname.startsWith(path)
          return (
            <li key={path} className="flex-1">
              <button
                onClick={() => navigate(path)}
                className={cn(
                  'w-full flex flex-col items-center gap-1 py-2.5 text-xs',
                  active ? 'text-text-primary' : 'text-text-tertiary',
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                <span className={cn('font-medium', active && 'font-semibold')}>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
