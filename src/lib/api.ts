import { hc } from 'hono/client'
import type { AppType } from '../../worker'

// Typed client for the Worker's /api routes. Paths and response shapes come from AppType.
export const api = hc<AppType>('/').api
