import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { usePushNotification } from '@/hooks/usePushNotification'

export function Layout() {
  usePushNotification()

  return (
    <div className="mobile-container">
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
