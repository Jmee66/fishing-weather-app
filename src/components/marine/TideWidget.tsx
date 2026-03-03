import { useTides } from '@/hooks/useTides'
import { useSettingsStore } from '@/stores/settings.store'
import { formatTime } from '@/utils/formatters'
import { formatHeight } from '@/utils/units'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function TideWidget() {
  const { data, isLoading } = useTides()
  const units = useSettingsStore((s) => s.units)

  if (isLoading) return <div className="flex justify-center p-4"><Spinner /></div>
  if (!data) return null

  const now = Date.now() / 1000
  const upcomingEvents = data.events.filter((e) => e.dt >= now - 3600).slice(0, 4)

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-100">Marées — {data.harbourName}</h3>
        <span className="text-xs text-slate-500">{data.distance.toFixed(0)} km</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {upcomingEvents.map((event) => (
          <div key={event.dt} className={`rounded-xl p-3 ${event.type === 'PM' ? 'bg-sky-900/30 border border-sky-700/40' : 'bg-[var(--bg-base)] border border-[var(--border-subtle)]'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${event.type === 'PM' ? 'text-sky-300' : 'text-slate-400'}`}>
                {event.type === 'PM' ? '▲ Pleine mer' : '▼ Basse mer'}
              </span>
              {event.coefficient && (
                <span className="text-xs text-slate-500 font-medium">Coef. {event.coefficient}</span>
              )}
            </div>
            <div className="text-lg font-bold text-slate-100">{formatTime(event.dt)}</div>
            <div className="text-sm text-slate-300">{formatHeight(event.height, units)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}