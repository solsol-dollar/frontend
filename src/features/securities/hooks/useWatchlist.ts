import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistStore {
  ids: number[]
  toggle: (id: number) => void
  isWatchlisted: (id: number) => boolean
}

export const useWatchlist = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id],
        })),
      isWatchlisted: (id) => get().ids.includes(id),
    }),
    { name: 'securities-watchlist' },
  ),
)
