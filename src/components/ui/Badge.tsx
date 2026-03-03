import type { ReactNode } from 'react'
type Color = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'teal' | 'orange'
const COLORS: Record<Color, string> = {
  blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800',
  slate: 'bg-slate-100 text-slate-700', teal: 'bg-teal-100 text-teal-800',
  orange: 'bg-orange-100 text-orange-800',
}
export default function Badge({ children, color = 'slate', className = '' }: { children: ReactNode; color?: Color; className?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[color]} ${className}`}>{children}</span>
}