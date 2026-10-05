import { defineConfig } from 'drizzle-kit'

// Only used to generate SQL migrations into ./drizzle from the schema.
// Wrangler applies them: `npm run db:migrate:local` or `npm run db:migrate:remote`.
export default defineConfig({
  dialect: 'sqlite',
  schema: './worker/db/schema.ts',
  out: './drizzle',
})
