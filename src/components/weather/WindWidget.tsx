import { getWindDirectionLabel } from '@/utils/units'
import { getBeaufortFromMs, getBeaufortLabel, getBeaufortColor } from '@/utils/beaufort'
import { useSettingsStore } from '@/stores/settings.store'
import { formatWindSpeed } from '@/utils/units'

interface WindWidgetProps {
  windSpeed: number
  windDeg: number
  windGust?: number
  compact?: boolean
}

export default function WindWidget({ windSpeed, windDeg, windGust, compact = false }: WindWidgetProps) {
  const units = useSettingsStore((s) => s.units)
  const beaufort = getBeaufortFromMs(windSpeed)
  const color = getBeaufortColor(beaufort)

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'p-3 bg-[var(--bg-base)] rounded-xl'}`}>
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg"
          style={{ borderColor: color }}
        >
          <span style={{ display: 'inline-block', transform: `rotate(${windDeg + 180}deg)` }}>↑</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-100">{formatWindSpeed(windSpeed, units)}</span>
          {windGust && windGust > windSpeed * 1.05 && (
            <span className="flex items-baseline gap-1 ml-1">
              <span className="text-slate-500">→</span>
              <span className="text-xl font-bold text-amber-400">{formatWindSpeed(windGust, units)}</span>
              <span className="text-xs text-slate-600">raf.</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>{getWindDirectionLabel(windDeg)} ({windDeg}°)</span>
          <span className="font-medium" style={{ color }}>Bf {beaufort} — {getBeaufortLabel(beaufort)}</span>
        </div>
      </div>
    </div>
  )
}