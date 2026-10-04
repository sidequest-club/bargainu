import { useEffect } from 'react'
import { getDeal } from '@shared/deals'
import { EmptyState } from './components/EmptyState'
import { Shell } from './components/Shell'
import { href, useRoute } from './lib/router'
import type { Route } from './lib/router'
import { StoreProvider } from './lib/store'
import { Browse } from './pages/Browse'
import { DealDetail } from './pages/DealDetail'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

const titleFor = (route: Route) => {
  const [first, second] = route.segments
  if (!first) return 'Bargainu, the best deals in Japan sniffed out'
  if (first === 'browse') return 'Browse deals | Bargainu'
  if (first === 'deal') return `${getDeal(second ?? '')?.title ?? 'Deal not found'} | Bargainu`
  if (first === 'login') return 'Sign in | Bargainu'
  if (first === 'favorites') return 'Favorites | Bargainu'
  return 'Page not found | Bargainu'
}

function Page({ route }: { route: Route }) {
  const [first, second] = route.segments
  if (!first) return <Home />
  if (first === 'browse') return <Browse route={route} />
  if (first === 'deal') return <DealDetail key={second} id={second ?? ''} />
  if (first === 'login') return <Login route={route} />
  if (first === 'favorites') return <Favorites />

  return (
    <div className="wrap">
      <EmptyState
        headingLevel="h1"
        title="Nothing at this address"
        actions={
          <a className="btn btn--primary" href={href('/')}>
            Go to home
          </a>
        }
      >
        The page you asked for does not exist. Head back home and pick up the trail from there.
      </EmptyState>
    </div>
  )
}

export default function App() {
  const route = useRoute()

  useEffect(() => {
    document.title = titleFor(route)
  }, [route])

  return (
    <StoreProvider>
      <Shell route={route}>
        <Page route={route} />
      </Shell>
    </StoreProvider>
  )
}
