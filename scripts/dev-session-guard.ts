// The guard for `npm run dev:session`: it refuses anything that is not local development,
// before a session is written anywhere. Kept apart from scripts/dev-session.ts so it can be
// tested without a database (scripts/dev-session-guard.test.ts).
import { parseEnv } from 'node:util'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export type GuardInput = {
  /** Arguments after the script name. The command takes none. */
  args: string[]
  /** The text of .dev.vars, or null when the file is missing. */
  devVars: string | null
  /** The D1 bindings from wrangler.jsonc. */
  d1Bindings: { binding: string; remote?: boolean }[]
  nodeEnv: string | undefined
}

/** The .dev.vars values the script uses, once the guard has passed them. */
export type LocalConfig = {
  /** The origin BETTER_AUTH_URL names, which is the local dev server. */
  origin: string
  secret: string
}

export type GuardResult = { ok: true; config: LocalConfig } | { ok: false; refusals: string[] }

// Every refusal is collected, not only the first, so one run says everything that needs changing.
export function checkLocalOnly({ args, devVars, d1Bindings, nodeEnv }: GuardInput): GuardResult {
  const refusals: string[] = []

  if (args.length > 0) {
    refusals.push(
      `It takes no arguments, but got ${args.join(' ')}. There is no --remote: a dev session is only ever written to the local database.`,
    )
  }
  if (nodeEnv === 'production') {
    refusals.push('NODE_ENV is production. A dev session is for local development only.')
  }
  for (const { binding } of d1Bindings.filter((d1) => d1.remote)) {
    refusals.push(
      `The D1 binding ${binding} in wrangler.jsonc has "remote": true, so local commands reach the deployed database.`,
    )
  }
  if (devVars === null) {
    refusals.push(
      '.dev.vars was not found. Copy .dev.vars.example to .dev.vars; the values are read from that file only.',
    )
    return { ok: false, refusals }
  }

  const vars = parseEnv(devVars)
  const origin = localOrigin(vars.BETTER_AUTH_URL)
  if (origin === null) {
    refusals.push(
      `BETTER_AUTH_URL in .dev.vars is ${JSON.stringify(vars.BETTER_AUTH_URL ?? '')}, not an http://localhost address. A deployed address means the secret beside it may be a deployed one.`,
    )
  }
  const secret = vars.BETTER_AUTH_SECRET ?? ''
  if (secret === '') {
    refusals.push(
      'BETTER_AUTH_SECRET in .dev.vars is empty. Generate one with: openssl rand -base64 32',
    )
  }

  if (refusals.length > 0 || origin === null) return { ok: false, refusals }
  return { ok: true, config: { origin, secret } }
}

/** The origin of a plain-http address on this machine, or null for anything else. */
function localOrigin(value: string | undefined): string | null {
  if (!value || !URL.canParse(value)) return null
  const url = new URL(value)
  if (url.protocol !== 'http:' || !LOCAL_HOSTS.has(url.hostname)) return null
  if (url.username !== '' || url.password !== '') return null
  return url.origin
}
