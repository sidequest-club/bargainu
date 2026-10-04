import { useSyncExternalStore } from 'react'
import { demoUser } from '@shared/deals'

/** Client-side session and favorites, persisted in localStorage. */
export interface User {
  name: string
  email: string
}

interface State {
  user: User | null
  favorites: string[]
  /** Last thing that happened, shown as a toast and announced to screen readers. */
  notice: { id: number; text: string } | null
}

const SESSION_KEY = 'bargainu.p2.session'
const FAVORITES_KEY = 'bargainu.p2.favorites'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode). The app still works for the session.
  }
}

let state: State = {
  user: read<User | null>(SESSION_KEY, null),
  favorites: read<string[]>(FAVORITES_KEY, []),
  notice: null,
}

let noticeId = 0

const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// Keep several tabs in step.
window.addEventListener('storage', (e) => {
  if (e.key !== SESSION_KEY && e.key !== FAVORITES_KEY) return
  set({ ...state, user: read<User | null>(SESSION_KEY, null), favorites: read<string[]>(FAVORITES_KEY, []) })
})

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state)
}

export function announce(text: string) {
  noticeId += 1
  set({ ...state, notice: { id: noticeId, text } })
}

export function dismissNotice(id: number) {
  if (state.notice?.id !== id) return
  set({ ...state, notice: null })
}

/** There is no backend: any input signs in as the demo user. */
export function signIn() {
  write(SESSION_KEY, demoUser)
  set({ ...state, user: demoUser })
}

export function signOut() {
  write(SESSION_KEY, null)
  set({ ...state, user: null })
  announce('Signed out')
}

export function addFavorite(id: string) {
  if (state.favorites.includes(id)) return
  const favorites = [id, ...state.favorites]
  write(FAVORITES_KEY, favorites)
  set({ ...state, favorites })
  announce('Saved to favorites')
}

export function removeFavorite(id: string) {
  const favorites = state.favorites.filter((f) => f !== id)
  write(FAVORITES_KEY, favorites)
  set({ ...state, favorites })
  announce('Removed from favorites')
}

export function toggleFavorite(id: string) {
  if (state.favorites.includes(id)) removeFavorite(id)
  else addFavorite(id)
}
