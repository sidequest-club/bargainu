import { useState } from 'react'
import { Heart } from 'lucide-react'
import type { Deal } from '@shared/deals'
import { navigate, useRoute } from '../lib/router'
import { useStore } from '../lib/store'

interface SaveButtonProps {
  deal: Deal
  variant?: 'icon' | 'full'
  className?: string
}

export function SaveButton({ deal, variant = 'icon', className = '' }: SaveButtonProps) {
  const { user, favorites, isFavorite, toggleFavorite, restoreFavorites, notify } = useStore()
  const route = useRoute()
  const saved = Boolean(user) && isFavorite(deal.id)
  const [justSaved, setJustSaved] = useState(false)
  const pop = saved && justSaved ? 'save--pop' : ''

  const onClick = () => {
    if (!user) {
      navigate('/login', { next: route.path, save: deal.id })
      return
    }
    const nowSaved = toggleFavorite(deal.id)
    setJustSaved(nowSaved)
    // Removing is the one destructive action in the app, so it always offers a way back.
    if (nowSaved) notify('Saved to favorites')
    else notify('Removed from favorites', () => restoreFavorites(favorites))
  }

  const label = saved ? `Remove ${deal.title} from favorites` : `Save ${deal.title} to favorites`

  if (variant === 'full') {
    return (
      <button type="button" className={`btn btn--outline ${pop} ${className}`} aria-pressed={saved} onClick={onClick}>
        <Heart className="save__heart" aria-hidden="true" />
        {saved ? 'Saved' : 'Save'}
        <span className="sr-only"> {deal.title}</span>
      </button>
    )
  }

  return (
    <button type="button" className={`save ${pop} ${className}`} aria-pressed={saved} aria-label={label} onClick={onClick}>
      <Heart className="save__heart" aria-hidden="true" />
    </button>
  )
}
