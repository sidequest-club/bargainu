import type { MouseEvent } from 'react'
import { EmptyState, Footer, Nav, TabBar, Ticker, Toast } from './components/Shell'
import { Link, useRoute, useScrollReset } from './lib/router'
import { StoreProvider } from './lib/store'
import { Browse } from './pages/Browse'
import { DealPage } from './pages/Deal'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

function Page() {
  const { segments, query } = useRoute()
  const [first, second] = segments
  if (first === undefined) return <Home />
  if (first === 'browse') return <Browse query={query} />
  if (first === 'deal' && second) return <DealPage id={second} />
  if (first === 'login') return <Login query={query} />
  if (first === 'favorites') return <Favorites />
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

export default function App() {
  const { path } = useRoute()
  useScrollReset(path)
  return (
    <StoreProvider>
      <a href="#main" className="skip" onClick={skipToMain}>
        Skip to content
      </a>
      <Ticker />
      <Nav path={path} />
      <main id="main" tabIndex={-1}>
        <Page />
      </main>
      <Footer />
      <TabBar path={path} />
      <Toast />
    </StoreProvider>
  )
}

// "#main" would overwrite the hash route, so move focus by hand.
function skipToMain(event: MouseEvent) {
  event.preventDefault()
  document.getElementById('main')?.focus()
}
