import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { CatalogProvider, StoreProvider } from './components/Providers'
import { EmptyState, Footer, Nav, TabBar, Ticker, Toast } from './components/Shell'
import { useCatalog } from './lib/catalog'
import { Browse } from './pages/Browse'
import { DealPage } from './pages/Deal'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

/** Stands in for a screen that needs deals while they load, fail to load, or there are none. */
function Pile({ children }: { children: ReactNode }) {
  const { status, deals, reload } = useCatalog()
  if (status === 'ready' && deals.length > 0) return children
  return (
    <div className="wrap page">
      {status === 'loading' ? (
        <EmptyState mood="sniff" title="Sniffing through the pile">
          <output>The dog is fetching today's deals.</output>
        </EmptyState>
      ) : status === 'error' ? (
        <EmptyState title="The pile is out of reach">
          <p role="alert">The deals did not load. Check your connection and try again.</p>
          <button type="button" className="btn btn--cta" onClick={reload}>
            Try again
          </button>
        </EmptyState>
      ) : (
        <EmptyState title="The pile is empty">
          <p>No store has a live deal right now. The dog checks again soon.</p>
        </EmptyState>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <div className="wrap page">
      <EmptyState title="Wrong pile">
        <p>There is no page at this address.</p>
        <Link to="/" className="btn btn--cta">
          Back to the front page
        </Link>
      </EmptyState>
    </div>
  )
}

/** Scrolls to the top when the path changes, but not when only the query does. */
function useScrollReset(path: string) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])
}

export default function App() {
  const { pathname } = useLocation()
  useScrollReset(pathname)
  return (
    <CatalogProvider>
      <StoreProvider>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Ticker />
        <Nav />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route
              index
              element={
                <Pile>
                  <Home />
                </Pile>
              }
            />
            <Route
              path="browse"
              element={
                <Pile>
                  <Browse />
                </Pile>
              }
            />
            <Route
              path="deal/:id"
              element={
                <Pile>
                  <DealPage />
                </Pile>
              }
            />
            <Route
              path="favorites"
              element={
                <Pile>
                  <Favorites />
                </Pile>
              }
            />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <TabBar />
        <Toast />
      </StoreProvider>
    </CatalogProvider>
  )
}
