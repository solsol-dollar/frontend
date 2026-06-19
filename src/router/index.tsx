import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/common/Layout'

// Onboarding
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'

// Home
import { HomePage } from '@/features/home/pages/HomePage'
import { TransferPage } from '@/features/home/pages/TransferPage'
import { TransferConfirmPage } from '@/features/home/pages/TransferConfirmPage'
import { TransferCompletePage } from '@/features/home/pages/TransferCompletePage'
import { TransferHistoryPage } from '@/features/home/pages/TransferHistoryPage'
import { FillPage } from '@/features/home/pages/FillPage'
import { ExchangePage } from '@/features/home/pages/ExchangePage'
import { SleepingDollarPage } from '@/features/home/pages/SleepingDollarPage'

// IPO
import { IpoCalendarPage } from '@/features/ipo/pages/IpoCalendarPage'
import { IpoDetailPage } from '@/features/ipo/pages/IpoDetailPage'
import { IpoGuidePage } from '@/features/ipo/pages/IpoGuidePage'
import { SubscribePage } from '@/features/ipo/pages/SubscribePage'
import { SubscribeExchangePage } from '@/features/ipo/pages/SubscribeExchangePage'
import { InvestmentProfilePage } from '@/features/ipo/pages/InvestmentProfilePage'
import { AllocationResultPage } from '@/features/ipo/pages/AllocationResultPage'

// Return Plan
import { ReturnPlanPage } from '@/features/return-plan/pages/ReturnPlanPage'
import { ReturnPlanSettingsPage } from '@/features/return-plan/pages/ReturnPlanSettingsPage'

// Securities
import { SecuritiesPage } from '@/features/securities/pages/SecuritiesPage'
import { StockDetailPage } from '@/features/securities/pages/StockDetailPage'
import { EtfPage } from '@/features/securities/pages/EtfPage'

// Mypage
import { MyPage } from '@/features/mypage/pages/MyPage'
import { NotificationsPage } from '@/features/mypage/pages/NotificationsPage'
import { NotificationSettingsPage } from '@/features/mypage/pages/NotificationSettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  // Transfer — 자체 헤더, 바텀탭 없음
  { path: '/home/transfer', element: <TransferPage /> },
  { path: '/home/transfer/confirm', element: <TransferConfirmPage /> },
  { path: '/home/transfer/complete', element: <TransferCompletePage /> },
  { path: '/home/transfer/history', element: <TransferHistoryPage /> },
  { path: '/home/fill', element: <FillPage /> },
  { path: '/home/exchange', element: <ExchangePage /> },
  { path: '/home/sleeping-dollar', element: <SleepingDollarPage /> },

  // IPO 청약 플로우 — 바텀탭 없음
  { path: '/ipo/:id', element: <IpoDetailPage /> },
  { path: '/ipo/:id/subscribe', element: <SubscribePage /> },
  { path: '/ipo/:id/subscribe/exchange', element: <SubscribeExchangePage /> },
  { path: '/ipo/:id/result', element: <AllocationResultPage /> },

  {
    element: <Layout />,
    children: [
      // Home
      { path: '/home', element: <HomePage /> },

      // IPO
      { path: '/ipo', element: <IpoCalendarPage /> },
      { path: '/ipo/guide', element: <IpoGuidePage /> },
      { path: '/ipo/profile', element: <InvestmentProfilePage /> },

      // Return Plan
      { path: '/return-plan', element: <ReturnPlanPage /> },
      { path: '/return-plan/settings', element: <ReturnPlanSettingsPage /> },

      // Securities
      { path: '/securities', element: <SecuritiesPage /> },
      { path: '/securities/stocks/:ticker', element: <StockDetailPage /> },
      { path: '/securities/etf', element: <EtfPage /> },

      // Mypage
      { path: '/mypage', element: <MyPage /> },

      // Notifications
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/notifications/settings', element: <NotificationSettingsPage /> },
    ],
  },
])
