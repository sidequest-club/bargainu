import { createContext, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Deal } from './catalog'

export interface User {
  name: string
  email: string
}

export interface Store {
  user: User | null
  /** True until the first answer about who is signed in, and about what they saved. */
  pending: boolean
  /** Ids of saved deals, newest first. */
  favorites: string[]
  /** Leaves for Google and comes back to `returnTo`, an in-app path. */
  signIn: (returnTo: string) => void
  signOut: () => Promise<void>
  isFavorite: (id: string) => boolean
  /** Returns whether the deal is saved after the toggle. */
  toggleFavorite: (id: string) => boolean
  addFavorite: (id: string) => void
  toast: string | null
  showToast: (message: string) => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}

/** Saves or removes a deal. Signed-out users are sent to Login and brought back with the deal saved. */
export function useFavoriteAction() {
  const { user, toggleFavorite, showToast } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  return (deal: Deal) => {
    if (!user) {
      const next = `${location.pathname}${location.search}`
      void navigate(`/login?next=${encodeURIComponent(next)}&save=${encodeURIComponent(deal.id)}`)
      return
    }
    const saved = toggleFavorite(deal.id)
    showToast(
      saved ? `Saved "${deal.title}" to favorites` : `Removed "${deal.title}" from favorites`,
    )
  }
}
