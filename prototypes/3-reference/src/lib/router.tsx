import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { AnchorHTMLAttributes } from 'react'

// Tiny hash router: "#/browse?category=Shoes" -> path "/browse", query "category=Shoes".
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const getHash = () => window.location.hash.replace(/^#/, '') || '/'

export interface Route {
  path: string
  segments: string[]
  query: URLSearchParams
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  return useMemo(() => {
    const [rawPath, rawQuery = ''] = hash.split('?')
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    return {
      path,
      segments: path.split('/').filter(Boolean).map(decodeURIComponent),
      query: new URLSearchParams(rawQuery),
    }
  }, [hash])
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const url = `#${to}`
  if (!options.replace) {
    window.location.hash = to
    return
  }
  window.history.replaceState(null, '', url)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

/** Scrolls to the top when the path changes, but not when only the query does. */
export function useScrollReset(path: string) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
}

export function Link({ to, ...rest }: LinkProps) {
  return <a href={`#${to}`} {...rest} />
}
