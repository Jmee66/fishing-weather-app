import { useFishActivity } from '@/hooks/useFishActivity'
import Card from '@/components/ui/Card'

const COLORS: Record<string, string> = {
  excellent: 'text-green-400', good: 'text-lime-400',
  average: 'text-amber-400', poor: 'text-orange-400', bad: 'text-red-400',
}
const BG_COLORS: Record<string, string> = {
  excellent: 'bg-green-900/20 border-green-700/40', good: 'bg-lime-900/20 border-lime-700/40',
  average: 'bg-amber-900/20 border-amber-700/40', poor: 'bg-orange-900/20 border-orange-700/40',
  bad: 'bg-red-900/20 border-red-700/40',
}

export default function FishActivityIndex() {
  const activity = useFishActivity()

  if (!activity) return null

  const colorClass = COLORS[activity.label]
  const bgClass = BG_COLORS[activity.label]

  return (
    <Card className={`border ${bgClass}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 text-center">
          <div className={`text-4xl font-bold ${colorClass}`}>{activity.total.toFixed(1)}</div>
          <div className="text-xs text-slate-500 mt-0.5">/10</div>
        </div>
        <div className="flex-1">
          <div className={`font-semibold text-sm ${colorClass} mb-0.5`}>
            🎣 Activité des poissons
          </div>
          <div className="text-xs text-slate-200">{activity.recommendation}</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {Object.entries(activity.factors).map(([key, val]) => (
              <span key={key} className="text-[10px] bg-[var(--bg-surface)] rounded px-1.5 py-0.5 text-slate-300 border border-[var(--border-default)]">
                {key} {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}