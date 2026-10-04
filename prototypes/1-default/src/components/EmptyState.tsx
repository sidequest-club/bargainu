import type { ReactNode } from 'react'
import { DogMark } from './Logo'

interface EmptyStateProps {
  title: string
  children: ReactNode
  actions?: ReactNode
  headingLevel?: 'h1' | 'h2'
}

export function EmptyState({ title, children, actions, headingLevel: Heading = 'h2' }: EmptyStateProps) {
  return (
    <div className="empty">
      <DogMark className="empty__art" />
      <Heading className="empty__title">{title}</Heading>
      <p className="empty__text">{children}</p>
      {actions ? <div className="empty__actions">{actions}</div> : null}
    </div>
  )
}
