import { useSyncExternalStore } from 'react'

/** Minimal hash router: `#/browse?cat=Audio` -> { path: '/browse', query }. */
export interface Route {
  path: string
  segments: string[]
  query: URLSearchParams
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

const getHash = () => window.location.hash

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart = ''] = raw.split('?')
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`
  return { path, segments: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(queryPart) }
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  return parseHash(hash)
}

/** Builds an href for a route, dropping empty query values. */
export function href(path: string, query?: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return `#${path}${qs ? `?${qs}` : ''}`
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (!options.replace) {
    window.location.hash = to
    return
  }
  const url = `${window.location.pathname}${window.location.search}${to}`
  window.history.replaceState(null, '', url)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
