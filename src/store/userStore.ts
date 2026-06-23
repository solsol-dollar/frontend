import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  isOnboarded: boolean
  fcmToken: string | null
  setOnboarded: (value: boolean) => void
  setFcmToken: (token: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      fcmToken: null,
      setOnboarded: (value) => set({ isOnboarded: value }),
      setFcmToken: (token) => set({ fcmToken: token }),
    }),
    { name: 'eclipse-user' },
  ),
)
