import { useEffect, useState } from 'react'
import { api } from './lib/api'
import { authClient } from './lib/auth-client'

type Health = 'checking' | 'ok' | 'down'

// Starter page for the initial project setup. It proves the three pieces talk to each
// other (page, API, database) and that Google sign-in is wired. Replace it with the real
// Home screen from prototypes/3-reference.
export default function App() {
  const [health, setHealth] = useState<Health>('checking')
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    api.health
      .$get()
      .then((res) => setHealth(res.ok ? 'ok' : 'down'))
      .catch(() => setHealth('down'))
  }, [])

  return (
    <main className="wrap setup">
      <p className="eyebrow">Initial project setup</p>
      <h1 className="shout">Bargainu</h1>
      <p className="aside">Every sale, sniffed out. Nothing to sniff yet.</p>

      <dl className="setup__status">
        <div className="setup__row">
          <dt>API and database</dt>
          <dd>
            <span className="tag" data-state={health}>
              {health === 'checking' ? 'Checking' : health === 'ok' ? 'Connected' : 'Not reachable'}
            </span>
          </dd>
        </div>
        <div className="setup__row">
          <dt>Signed in as</dt>
          <dd>{isPending ? 'Checking' : (session?.user.name ?? 'Nobody')}</dd>
        </div>
      </dl>

      {session ? (
        <button type="button" className="btn btn--paper" onClick={() => authClient.signOut()}>
          Sign out
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--cta"
          onClick={() => authClient.signIn.social({ provider: 'google' })}
        >
          Sign in with Google
        </button>
      )}
    </main>
  )
}
