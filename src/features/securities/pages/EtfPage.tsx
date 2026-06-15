import { Navigate } from 'react-router-dom'

// ETF는 SecuritiesPage 내 탭으로 통합됨
export function EtfPage() {
  return <Navigate to="/securities" replace />
}
