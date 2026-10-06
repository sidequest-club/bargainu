// Reads unitless motion tokens from src/styles/tokens.css so JS-driven motion
// uses the same single source as the stylesheet.
import { useEffect, useState } from 'react'

const cache = new Map<string, number>()

export function tokenNumber(name: string): number {
  const hit = cache.get(name)
  if (hit !== undefined) return hit
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name)
  const value = Number.parseFloat(raw)
  if (Number.isNaN(value)) throw new Error(`Token ${name} is not a number: "${raw}"`)
  cache.set(name, value)
  return value
}

export const spring = () => ({
  type: 'spring' as const,
  stiffness: tokenNumber('--spring-stiffness'),
  damping: tokenNumber('--spring-damping'),
})

const NEVER = Symbol('never')

/**
 * True once `--settle-ms` has passed since `key` last changed. Timers keep running when frames
 * are throttled (background tab, headless capture), so this is the failsafe that swaps an
 * entrance animation for its finished state.
 */
export function useSettled(key: unknown = null): boolean {
  const [settled, setSettled] = useState<unknown>(NEVER)
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(key), tokenNumber('--settle-ms'))
    return () => window.clearTimeout(timer)
  }, [key])
  return settled === key
}

/** False until `token` milliseconds after mount. */
export function useAfter(token: string): boolean {
  const [passed, setPassed] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setPassed(true), tokenNumber(token))
    return () => window.clearTimeout(timer)
  }, [token])
  return passed
}
