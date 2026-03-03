import type { ReactNode, ButtonHTMLAttributes } from 'react'
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-sky-700/80 text-sky-100 hover:bg-sky-600/80 active:bg-sky-800/80 border border-sky-500/40',
  secondary: 'bg-[var(--bg-surface)] text-slate-300 hover:bg-[var(--bg-elevated)] active:bg-[var(--bg-elevated)] border border-[var(--border-default)]',
  ghost: 'text-sky-400 hover:bg-sky-900/40 active:bg-sky-900/60',
  danger: 'bg-red-800/60 text-red-200 hover:bg-red-700/70 active:bg-red-800/80 border border-red-600/40',
}
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: 'sm' | 'md' | 'lg'; children: ReactNode
}
export default function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}