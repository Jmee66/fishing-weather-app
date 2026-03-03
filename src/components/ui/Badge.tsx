import type { ReactNode }  from 'react'
type Color = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'teal' | 'orange' | 'cyan'
const COLORS: Record<Color, string> = {
  blue:   'bg-sky-900/50 text-sky-300 border border-sky-800',
  green:  'bg-green-900/50 text-green-300 border border-green-800',
  amber:  'bg-amber-900/50 text-amber-300 border border-amber-800',
  red:    'bg-red-900/50 text-red-300 border border-red-800',
  slate:  'bg-slate-800 text-slate-300 border border-slate-700',
  teal:   'bg-teal-900/50 text-teal-300 border border-teal-800',
  orange: 'bg-orange-900/50 text-orange-300 border border-orange-800',
  cyan:   'bg-cyan-900/50 text-cyan-300 border border-cyan-800',
}
export default function Badge({ children, color = 'slate', className = '' }: { children: ReactNode; color?: Color; className?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[color]} ${className}`}>{children}</span>
}
