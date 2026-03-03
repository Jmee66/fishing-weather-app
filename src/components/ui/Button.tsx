import type { ReactNode, ButtonHTMLAttributes } from 'react'
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-slate-100 text-slate-100 hover:bg-slate-200 active:bg-slate-300',
  ghost: 'text-blue-600 hover:bg-sky-900/40 active:bg-blue-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
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