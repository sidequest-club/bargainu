import { useEffect } from 'react'
import { IconContext } from '@phosphor-icons/react'
import { EmptyState, Shell } from './components/Shell'
import { href, useRoute } from './lib/router'
import { Favorites, Login } from './pages/Account'
import { Browse } from './pages/Browse'
import { DealPage } from './pages/DealPage'
import { Home } from './pages/Home'

const titles: Record<string, string> = {
  '': 'Bargainu',
  browse: 'Browse deals - Bargainu',
  deal: 'Deal - Bargainu',
  login: 'Sign in - Bargainu',
  favorites: 'Favorites - Bargainu',
}

// Icons inherit their size from the surrounding text, so tokens set them through font-size.
const iconDefaults = { size: '1em' }

export default function App() {
  const route = useRoute()
  const [first = '', second] = route.segments

  // A new page starts at the top. Filter changes inside Browse keep the scroll position.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = titles[first] ?? 'Bargainu'
  }, [route.path, first])

  let page
  if (route.segments.length === 0) page = <Home />
  else if (first === 'browse') page = <Browse route={route} />
  else if (first === 'deal' && second) page = <DealPage id={second} />
  else if (first === 'login') page = <Login route={route} />
  else if (first === 'favorites') page = <Favorites />
  else
    page = (
      <div className="page">
        <EmptyState
          title="We could not find that page"
          actions={
            <a href={href('/')} className="button button--accent">
              Back to home
            </a>
          }
        >
          The address may be mistyped. The deals are still where you left them.
        </EmptyState>
      </div>
    )

  return (
    <IconContext.Provider value={iconDefaults}>
      <Shell route={route}>{page}</Shell>
    </IconContext.Provider>
  )
}
