// `npm run dev:session`: a signed-in browser session for the local app.
//
// Google is the only way to sign in and cannot be scripted, so this writes a test user and a
// session straight into the local database and saves the cookie as a Playwright storageState
// file. The app itself gains no sign-in shortcut: the session is made here, with Better Auth's
// testUtils plugin added to the Worker's own auth options, and signed with the local secret.
//
// It refuses, before writing anything, unless this is local development
// (scripts/dev-session-guard.ts).
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { betterAuth } from 'better-auth'
import { testUtils } from 'better-auth/plugins'
import { getPlatformProxy, unstable_readConfig } from 'wrangler'
import { authOptions } from '../worker/auth.ts'
import { createDb } from '../worker/db/index.ts'
import { checkLocalOnly } from './dev-session-guard.ts'

// Gitignored. Holds a live session token for the local database.
const STORAGE_STATE = '.dev-session/storage-state.json'

// Invented, and the same on every run, so a second run signs the same user in again.
const TEST_USER = { email: 'dev-session@example.invalid', name: 'Dev Session' }

async function main() {
  const guard = checkLocalOnly({
    args: process.argv.slice(2),
    devVars: existsSync('.dev.vars') ? readFileSync('.dev.vars', 'utf8') : null,
    d1Bindings: unstable_readConfig({}).d1_databases,
    nodeEnv: process.env.NODE_ENV,
  })
  if (!guard.ok) {
    console.error('dev:session refused. Nothing was written:')
    for (const reason of guard.refusals) console.error(`  - ${reason}`)
    return 1
  }
  const { origin, secret } = guard.config

  // The same local D1 that `npm run dev` and `npm run db:migrate:local` use, in .wrangler/state.
  const platform = await getPlatformProxy<Env>({ remoteBindings: false })
  try {
    const auth = betterAuth({
      ...authOptions(
        // The session cookie does not depend on the Google client, so the real one stays out.
        {
          BETTER_AUTH_URL: origin,
          BETTER_AUTH_SECRET: secret,
          GOOGLE_CLIENT_ID: 'dev-session',
          GOOGLE_CLIENT_SECRET: 'dev-session',
        },
        createDb(platform.env.DB),
      ),
      plugins: [testUtils()],
    })
    const { internalAdapter, test } = await auth.$context

    const existing = await internalAdapter.findUserByEmail(TEST_USER.email)
    const user =
      existing?.user ??
      (await test.saveUser(test.createUser({ ...TEST_USER, emailVerified: true })))
    const { cookies } = await test.login({ userId: user.id })

    mkdirSync(dirname(STORAGE_STATE), { recursive: true })
    writeFileSync(STORAGE_STATE, `${JSON.stringify({ cookies, origins: [] }, null, 2)}\n`, {
      mode: 0o600,
    })
    chmodSync(STORAGE_STATE, 0o600)

    const cookie = cookies.map(({ name, value }) => `${name}=${value}`).join('; ')
    console.log(
      [
        `Signed in ${user.email} against the local database.`,
        '',
        `open     ${origin}/favorites`,
        `state    ${STORAGE_STATE}  (Playwright storageState)`,
        // For a browser tool that can run page script but has no cookie API.
        `script   ${cookies.map(({ name, value, path }) => `document.cookie = ${JSON.stringify(`${name}=${value}; path=${path}; samesite=lax`)}`).join('; ')}`,
        `server   ${await probe(origin, cookie)}`,
      ].join('\n'),
    )
    return 0
  } finally {
    await platform.dispose()
  }
}

/** Whether the running dev server accepts the cookie. The session exists either way. */
async function probe(origin: string, cookie: string) {
  try {
    const response = await fetch(`${origin}/api/me`, {
      headers: { cookie },
      signal: AbortSignal.timeout(3000),
    })
    const body = (await response.json()) as { user: { email: string } | null }
    if (body.user?.email === TEST_USER.email) return `${origin} accepts the session.`
    return `${origin} answered without the user. Is it running from this folder?`
  } catch {
    return `${origin} is not reachable. Start it with \`npm run dev\`; the session works once it is up.`
  }
}

try {
  process.exitCode = await main()
} catch (error) {
  console.error(`dev:session failed: ${error instanceof Error ? error.message : String(error)}`)
  console.error('If the login tables are missing, run `npm run db:migrate:local` first.')
  process.exitCode = 1
}
