import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { demoUser } from '@shared/deals'
import { tokenNumber } from './tokens'

// Keys are prefixed per prototype: all three builds are served from one origin.
const SESSION_KEY = 'bargainu.p3.session'
const FAVORITES_KEY = 'bargainu.p3.favorites'

type User = typeof demoUser

interface Store {
  user: User | null
  favorites: string[]
  signIn: () => void
  signOut: () => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => boolean
  addFavorite: (id: string) => void
  toast: string | null
  showToast: (message: string) => void
}

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode); the app still works for the session.
  }
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read<User | null>(SESSION_KEY, null))
  const [favorites, setFavorites] = useState<string[]>(() => read<string[]>(FAVORITES_KEY, []))
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => write(SESSION_KEY, user), [user])
  useEffect(() => write(FAVORITES_KEY, favorites), [favorites])

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), tokenNumber('--toast-ms'))
  }, [])

  const value = useMemo<Store>(
    () => ({
      user,
      favorites,
      signIn: () => setUser(demoUser),
      signOut: () => setUser(null),
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        const saved = favorites.includes(id)
        setFavorites(saved ? favorites.filter((f) => f !== id) : [id, ...favorites])
        return !saved
      },
      addFavorite: (id) => setFavorites((prev) => (prev.includes(id) ? prev : [id, ...prev])),
      toast,
      showToast,
    }),
    [user, favorites, toast, showToast],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
