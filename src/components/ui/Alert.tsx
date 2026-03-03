import type { ReactNode } from 'react'
type AlertType = 'info' | 'warning' | 'error' | 'success'
const STYLES: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'ℹ️' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '⚠️' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '❌' },
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '✅' },
}
export default function Alert({ type = 'info', title, children }: { type?: AlertType; title?: string; children: ReactNode }) {
  const s = STYLES[type]
  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-3 ${s.text}`}>
      {title && <p className="font-semibold text-sm flex items-center gap-1"><span>{s.icon}</span>{title}</p>}
      <div className="text-sm mt-1">{children}</div>
    </div>
  )
}