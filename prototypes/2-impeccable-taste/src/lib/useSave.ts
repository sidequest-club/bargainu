import { useState } from 'react'
import type { Deal } from '@shared/deals'
import { href, navigate } from './router'
import { toggleFavorite, useStore } from './store'

/** Saves a deal. Signed-out shoppers are sent to sign in and the deal is saved on return. */
export function useSave(deal: Deal) {
  const { user, favorites } = useStore()
  const saved = favorites.includes(deal.id)
  const [stamped, setStamped] = useState(false)

  const toggle = () => {
    if (!user) {
      navigate(href('/login', { next: `/deal/${deal.id}`, save: deal.id }))
      return
    }
    setStamped(!saved)
    toggleFavorite(deal.id)
  }

  return { saved, stamped, toggle }
}
