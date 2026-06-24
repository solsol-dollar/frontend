import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { registerPushToken } from '@/lib/firebase'

export function useRequestNotification() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.requestNotification) {
      registerPushToken()
      navigate('.', { replace: true, state: {} })
    }
  }, [])
}
