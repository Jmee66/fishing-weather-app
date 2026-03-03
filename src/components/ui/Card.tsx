import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md'
}

export default function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  const padClass = padding === 'none' ? '' : padding === 'sm' ? 'p-3' : 'p-4'
  return (
    <div
      className={`rounded-2xl border ${padClass} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
