import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="mobile-container">
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
