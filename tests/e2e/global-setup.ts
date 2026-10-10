import { execFileSync } from 'node:child_process'

// Gets the local database ready before the tests: tables, sample deals that have not ended,
// and a signed-in session for the test user. Each command is safe to run again, and
// dev:session refuses anything that is not local development.
export default function globalSetup() {
  for (const script of ['db:migrate:local', 'db:seed:local', 'dev:session']) {
    execFileSync('npm', ['run', script], { stdio: 'inherit' })
  }
}
