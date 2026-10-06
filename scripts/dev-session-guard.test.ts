import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkLocalOnly } from './dev-session-guard.ts'
import type { GuardInput } from './dev-session-guard.ts'

const LOCAL_VARS = 'BETTER_AUTH_URL=http://localhost:5173\nBETTER_AUTH_SECRET=local-secret\n'

const input = (overrides: Partial<GuardInput> = {}): GuardInput => ({
  args: [],
  devVars: LOCAL_VARS,
  d1Bindings: [{ binding: 'DB' }],
  nodeEnv: undefined,
  ...overrides,
})

const refusals = (overrides: Partial<GuardInput>) => {
  const result = checkLocalOnly(input(overrides))
  assert.equal(result.ok, false)
  return result.ok ? [] : result.refusals
}

await test('passes a local .dev.vars and hands back its values', () => {
  assert.deepEqual(checkLocalOnly(input()), {
    ok: true,
    config: { origin: 'http://localhost:5173', secret: 'local-secret' },
  })
})

await test('accepts the loopback addresses on any port', () => {
  for (const url of ['http://127.0.0.1:5173', 'http://[::1]:8787', 'http://localhost:3000/']) {
    const result = checkLocalOnly(
      input({ devVars: `BETTER_AUTH_URL=${url}\nBETTER_AUTH_SECRET=local-secret\n` }),
    )
    assert.equal(result.ok, true, url)
  }
})

await test('refuses a deployed BETTER_AUTH_URL', () => {
  for (const url of [
    'https://bargainu.sidequest-club.workers.dev',
    'https://localhost:5173',
    'http://localhost.example.com:5173',
    'http://user:pass@localhost:5173',
    'localhost:5173',
    '',
  ]) {
    const [reason, ...rest] = refusals({
      devVars: `BETTER_AUTH_URL=${url}\nBETTER_AUTH_SECRET=local-secret\n`,
    })
    assert.match(reason ?? '', /BETTER_AUTH_URL/, url)
    assert.deepEqual(rest, [], url)
  }
})

await test('refuses an empty or missing secret', () => {
  for (const devVars of [
    'BETTER_AUTH_URL=http://localhost:5173\nBETTER_AUTH_SECRET=\n',
    'BETTER_AUTH_URL=http://localhost:5173\n',
  ]) {
    assert.match(refusals({ devVars }).join('\n'), /BETTER_AUTH_SECRET/)
  }
})

await test('refuses when .dev.vars is missing', () => {
  assert.match(refusals({ devVars: null }).join('\n'), /\.dev\.vars was not found/)
})

await test('refuses --remote and any other argument', () => {
  assert.match(refusals({ args: ['--remote'] }).join('\n'), /no arguments/)
  assert.match(refusals({ args: ['--local'] }).join('\n'), /no arguments/)
})

await test('refuses a D1 binding that is set to remote', () => {
  const reasons = refusals({ d1Bindings: [{ binding: 'DB', remote: true }] })
  assert.match(reasons.join('\n'), /binding DB .*"remote": true/)
})

await test('refuses NODE_ENV=production', () => {
  assert.match(refusals({ nodeEnv: 'production' }).join('\n'), /NODE_ENV is production/)
})

await test('reports every reason at once', () => {
  const reasons = refusals({
    args: ['--remote'],
    devVars: 'BETTER_AUTH_URL=https://example.com\n',
    d1Bindings: [{ binding: 'DB', remote: true }],
    nodeEnv: 'production',
  })
  assert.equal(reasons.length, 5)
})
