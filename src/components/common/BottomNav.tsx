import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { icon: '/icons/Home.svg', activeIcon: '/icons/Home_COLOR.svg', path: '/home' },
  { icon: '/icons/IPO.svg', activeIcon: '/icons/IPO_COLOR.svg', path: '/ipo' },
  { icon: '/icons/ReturnPlan.svg', activeIcon: '/icons/ReturnPlan_COLOR.svg', path: '/return-plan' },
  { icon: '/icons/Stock.svg', activeIcon: '/icons/Stock_COLOR.svg', path: '/securities' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white z-10 rounded-t-[20px]"
      style={{ boxShadow: '0px -2px 8px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-[79px]">
        {tabs.map(({ icon, activeIcon, path }) => {
          const active = pathname.startsWith(path)
          return (
            <li key={path} className="flex-1">
              <button
                onClick={() => navigate(path)}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={active ? activeIcon : icon}
                  width={84}
                  height={54}
                  className={active ? '' : 'opacity-40'}
                  alt=""
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
