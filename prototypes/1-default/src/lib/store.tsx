import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { demoUser } from '@shared/deals'

type User = typeof demoUser

export interface Toast {
  message: string
  undo?: () => void
}

interface Store {
  user: User | null
  signIn: () => void
  signOut: () => void
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => boolean
  restoreFavorites: (list: string[]) => void
  toast: Toast | null
  notify: (message: string, undo?: () => void) => void
  dismissToast: () => void
}

const SESSION_KEY = 'bargainu.p1.session'
const FAVORITES_KEY = 'bargainu.p1.favorites'

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
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be blocked (private mode); the session then lasts until reload.
  }
}

const toastDuration = (withAction: boolean) =>
  Number(
    getComputedStyle(document.documentElement).getPropertyValue(withAction ? '--toast-duration-action' : '--toast-duration'),
  ) || 0

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read<User | null>(SESSION_KEY, null))
  const [favorites, setFavorites] = useState<string[]>(() => read<string[]>(FAVORITES_KEY, []))
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => write(SESSION_KEY, user), [user])
  useEffect(() => write(FAVORITES_KEY, favorites), [favorites])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const notify = useCallback((message: string, undo?: () => void) => {
    window.clearTimeout(timer.current)
    setToast({ message, undo })
    timer.current = window.setTimeout(() => setToast(null), toastDuration(Boolean(undo)))
  }, [])

  const dismissToast = useCallback(() => {
    window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const value = useMemo<Store>(
    () => ({
      user,
      signIn: () => setUser(demoUser),
      signOut: () => setUser(null),
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        const saved = favorites.includes(id)
        setFavorites(saved ? favorites.filter((f) => f !== id) : [id, ...favorites])
        return !saved
      },
      restoreFavorites: (list) => setFavorites(list),
      dismissToast,
      toast,
      notify,
    }),
    [user, favorites, toast, notify, dismissToast],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
