import { useMutation } from '@tanstack/react-query'
import { loginWithPin } from '@/lib/auth'

export function useLogin() {
  return useMutation({
    mutationFn: (pin: string) => loginWithPin(pin),
  })
}
