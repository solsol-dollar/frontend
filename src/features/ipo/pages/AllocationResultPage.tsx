import { useParams } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export function AllocationResultPage() {
  const { id } = useParams()

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header title="배정 결과" showBack showNotification={false} showMypage={false} />
      <div className="flex-1" />
    </div>
  )
}
