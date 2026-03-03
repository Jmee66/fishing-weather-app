import type { ReactNode } from 'react'
type AlertType = 'info' | 'warning' | 'error' | 'success'
const STYLES: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  info:    { bg: 'bg-sky-900/40',   border: 'border-sky-700',   text: 'text-sky-300',   icon: 'ℹ' },
  warning: { bg: 'bg-amber-900/40', border: 'border-amber-700', text: 'text-amber-300', icon: '!' },
  error:   { bg: 'bg-red-900/40',   border: 'border-red-700',   text: 'text-red-300',   icon: '×' },
  success: { bg: 'bg-green-900/40', border: 'border-green-700', text: 'text-green-300', icon: '✓' },
}
export default function Alert({ type = 'info', title, children }: { type?: AlertType; title?: string; children: ReactNode }) {
  const s = STYLES[type]
  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-3 ${s.text}`}>
      {title && <p className="font-semibold text-sm flex items-center gap-1.5"><span className="font-bold">{s.icon}</span>{title}</p>}
      <div className="text-sm mt-1 opacity-90">{children}</div>
    </div>
  )
}
