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
import { ExchangeCompletePage } from '@/features/home/pages/ExchangeCompletePage'
import { SleepingDollarPage } from '@/features/home/pages/SleepingDollarPage'
import { CardHistoryPage } from '@/features/home/pages/CardHistoryPage'

// IPO
import { IpoCalendarPage } from '@/features/ipo/pages/IpoCalendarPage'
import { IpoDetailPage } from '@/features/ipo/pages/IpoDetailPage'
import { IpoGuidePage } from '@/features/ipo/pages/IpoGuidePage'
import { SubscribePage } from '@/features/ipo/pages/SubscribePage'
import { InvestmentProfilePage } from '@/features/ipo/pages/InvestmentProfilePage'
import { AllocationResultPage } from '@/features/ipo/pages/AllocationResultPage'
import { IpoNewsDetailPage } from '@/features/ipo/pages/IpoNewsDetailPage'

// Return Plan
import { ReturnPlanPage } from '@/features/return-plan/pages/ReturnPlanPage'
import { ReturnPlanSettingsPage } from '@/features/return-plan/pages/ReturnPlanSettingsPage'
import { ReturnPlanHistoryPage } from '@/features/return-plan/pages/ReturnPlanHistoryPage'
import { ReturnPlanResultDetailPage } from '@/features/return-plan/pages/ReturnPlanResultDetailPage'
import { ReturnPlanPendingPage } from '@/features/return-plan/pages/ReturnPlanPendingPage'

// Securities
import { SecuritiesPage } from '@/features/securities/pages/SecuritiesPage'
import { StockDetailPage } from '@/features/securities/pages/StockDetailPage'
import { EtfPage } from '@/features/securities/pages/EtfPage'
import { MyInvestmentsPage } from '@/features/securities/pages/MyInvestmentsPage'
import { OrderHistoryPage } from '@/features/securities/pages/OrderHistoryPage'
import { SellProfitsPage } from '@/features/securities/pages/SellProfitsPage'
import { BuyPage } from '@/features/securities/pages/BuyPage'
import { SellPage } from '@/features/securities/pages/SellPage'
import { StockSearchPage } from '@/features/securities/pages/StockSearchPage'

// Mypage
import { MyPage } from '@/features/mypage/pages/MyPage'
import { ProductDetailPage } from '@/features/mypage/pages/ProductDetailPage'
import { MaturityDatePage } from '@/features/mypage/pages/MaturityDatePage'
import { ProductCompletePage } from '@/features/mypage/pages/ProductCompletePage'
import { NotificationsPage } from '@/features/mypage/pages/NotificationsPage'
import { NotificationSettingsPage } from '@/features/mypage/pages/NotificationSettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/onboarding" replace />,
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
  { path: '/home/exchange/complete', element: <ExchangeCompletePage /> },
  { path: '/home/sleeping-dollar', element: <SleepingDollarPage /> },
  { path: '/home/card/history', element: <CardHistoryPage /> },

  // Mypage 상품 가입 플로우 — 바텀탭 없음
  { path: '/mypage/product/:productId', element: <ProductDetailPage /> },
  { path: '/mypage/product/:productId/maturity', element: <MaturityDatePage /> },
  { path: '/mypage/product/:productId/complete', element: <ProductCompletePage /> },

  // Securities 서브 플로우 — 바텀탭 없음
  { path: '/securities/stocks/:id', element: <StockDetailPage /> },
  { path: '/securities/stocks/:id/buy', element: <BuyPage /> },
  { path: '/securities/stocks/:id/sell', element: <SellPage /> },
  { path: '/securities/search', element: <StockSearchPage /> },

  // IPO 청약 플로우 — 바텀탭 없음
  { path: '/ipo/:ipoId/news/:newsId', element: <IpoNewsDetailPage /> },
  { path: '/ipo/:id', element: <IpoDetailPage /> },
  { path: '/ipo/:id/subscribe', element: <SubscribePage /> },
  { path: '/ipo/:id/result', element: <AllocationResultPage /> },
{ path: '/return-plan/history', element: <ReturnPlanHistoryPage /> },
  { path: '/return-plan/pending/:id', element: <ReturnPlanPendingPage /> },
  { path: '/return-plan/result/:id', element: <ReturnPlanResultDetailPage /> },
  { path: '/return-plan/allocation', element: <ReturnPlanSettingsPage /> },

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

      // Securities
      { path: '/securities', element: <SecuritiesPage /> },
      { path: '/securities/my', element: <MyInvestmentsPage /> },
      { path: '/securities/orders', element: <OrderHistoryPage /> },
      { path: '/securities/profits', element: <SellProfitsPage /> },
      { path: '/securities/etf', element: <EtfPage /> },

      // Mypage
      { path: '/mypage', element: <MyPage /> },

      // Notifications
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/notifications/settings', element: <NotificationSettingsPage /> },
    ],
  },
])
