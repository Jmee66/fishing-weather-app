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
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padClass} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}