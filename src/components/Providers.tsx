import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'
import { authClient } from '../lib/auth-client'
import { buildCatalog, CatalogContext, toDeals } from '../lib/catalog'
import type { CatalogState, Deal } from '../lib/catalog'
import { StoreContext } from '../lib/store'
import type { Store } from '../lib/store'
import { tokenNumber } from '../lib/tokens'

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; deals: Deal[] }

const NO_DEALS: Deal[] = []

/** Fetches the live deals once and shares them with every screen. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let stale = false
    api.deals
      .$get()
      .then(async (res) => {
        if (!res.ok) throw new Error(`GET /api/deals answered ${res.status}`)
        const deals = toDeals(await res.json())
        if (!stale) setLoad({ status: 'ready', deals })
      })
      .catch(() => {
        if (!stale) setLoad({ status: 'error' })
      })
    return () => {
      stale = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setLoad({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  const deals = load.status === 'ready' ? load.deals : NO_DEALS
  const value = useMemo<CatalogState>(
    () => ({ ...buildCatalog(deals), status: load.status, reload }),
    [deals, load.status, reload],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

const NO_FAVORITES: string[] = []

/** The Better Auth session, the signed-in user's favorites and the toast. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  // Favorites are kept per user id, so a list fetched for one account is never shown to another.
  const [saved, setSaved] = useState<{ userId: string; ids: string[] } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), tokenNumber('--toast-ms'))
  }, [])

  useEffect(() => {
    if (!userId) return
    let stale = false
    api.favorites
      .$get()
      .then(async (res) => {
        if (!res.ok) throw new Error(`GET /api/favorites answered ${res.status}`)
        const { dealIds } = await res.json()
        // Keep anything saved while the list was on its way.
        if (!stale) {
          setSaved((prev) => {
            const early = prev?.userId === userId ? prev.ids : NO_FAVORITES
            return { userId, ids: [...new Set([...early, ...dealIds])] }
          })
        }
      })
      .catch(() => {
        if (stale) return
        setSaved((prev) => (prev?.userId === userId ? prev : { userId, ids: NO_FAVORITES }))
        showToast('Could not fetch your favorites. Reload to try again.')
      })
    return () => {
      stale = true
    }
  }, [userId, showToast])

  const loaded = saved !== null && saved.userId === userId
  const favorites = loaded ? saved.ids : NO_FAVORITES

  const value = useMemo<Store>(() => {
    const setIds = (change: (ids: string[]) => string[]) => {
      if (!userId) return
      setSaved((prev) => ({ userId, ids: change(prev?.userId === userId ? prev.ids : []) }))
    }
    const add = (id: string) => setIds((ids) => (ids.includes(id) ? ids : [id, ...ids]))
    const remove = (id: string) => setIds((ids) => ids.filter((f) => f !== id))

    // The screen changes at once; if the API refuses, the change is taken back.
    const save = (id: string) => {
      add(id)
      api.favorites[':dealId']
        .$put({ param: { dealId: id } })
        .then((res) => {
          if (!res.ok) throw new Error(`PUT /api/favorites answered ${res.status}`)
        })
        .catch(() => {
          remove(id)
          showToast('Could not save that deal. Try again.')
        })
    }
    const unsave = (id: string) => {
      remove(id)
      api.favorites[':dealId']
        .$delete({ param: { dealId: id } })
        .then((res) => {
          if (!res.ok) throw new Error(`DELETE /api/favorites answered ${res.status}`)
        })
        .catch(() => {
          add(id)
          showToast('Could not remove that deal. Try again.')
        })
    }

    return {
      user: session ? { name: session.user.name, email: session.user.email } : null,
      pending: sessionPending || (userId !== undefined && !loaded),
      favorites,
      signIn: (returnTo) => {
        authClient.signIn
          .social({ provider: 'google', callbackURL: returnTo })
          .then(({ error }) => {
            if (error) showToast('Google sign-in did not start. Try again.')
          })
          .catch(() => showToast('Google sign-in did not start. Try again.'))
      },
      signOut: async () => {
        await authClient.signOut()
      },
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        const wasSaved = favorites.includes(id)
        if (wasSaved) unsave(id)
        else save(id)
        return !wasSaved
      },
      addFavorite: (id) => {
        if (!favorites.includes(id)) save(id)
      },
      toast,
      showToast,
    }
  }, [session, sessionPending, userId, loaded, favorites, toast, showToast])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
