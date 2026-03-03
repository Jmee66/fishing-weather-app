import { useFishActivity } from '@/hooks/useFishActivity'
import Card from '@/components/ui/Card'

const COLORS: Record<string, string> = {
  excellent: 'text-green-600', good: 'text-lime-600',
  average: 'text-amber-600', poor: 'text-orange-600', bad: 'text-red-600',
}
const BG_COLORS: Record<string, string> = {
  excellent: 'bg-green-50 border-green-200', good: 'bg-lime-50 border-lime-200',
  average: 'bg-amber-50 border-amber-200', poor: 'bg-orange-50 border-orange-200',
  bad: 'bg-red-50 border-red-200',
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
          <div className="text-xs text-slate-700">{activity.recommendation}</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {Object.entries(activity.factors).map(([key, val]) => (
              <span key={key} className="text-[10px] bg-white rounded px-1.5 py-0.5 text-slate-600 border border-slate-200">
                {key} {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}