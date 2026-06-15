import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="mobile-container">
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
