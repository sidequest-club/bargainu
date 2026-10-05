import { useSyncExternalStore } from 'react'

export interface Route {
  path: string
  segments: string[]
  query: URLSearchParams
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash

export const parseHash = (hash: string): Route => {
  const raw = hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart = ''] = raw.split('?')
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`
  return {
    path,
    segments: path.split('/').filter(Boolean).map(decodeURIComponent),
    query: new URLSearchParams(queryPart),
  }
}

export const useRoute = (): Route => parseHash(useSyncExternalStore(subscribe, getHash))

export const href = (path: string, query?: URLSearchParams | Record<string, string>) => {
  const qs = new URLSearchParams(query).toString()
  return `#${path}${qs ? `?${qs}` : ''}`
}

export const navigate = (path: string, query?: URLSearchParams | Record<string, string>, replace = false) => {
  const target = href(path, query)
  if (!replace) {
    window.location.hash = target
    return
  }
  window.history.replaceState(null, '', target)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
