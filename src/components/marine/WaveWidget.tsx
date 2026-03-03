import { getDouglasFromHeight, getDouglasLabel, getDouglasColor } from '@/utils/douglas'
import { useSettingsStore } from '@/stores/settings.store'
import { formatHeight } from '@/utils/units'
import type { WaveData } from '@/types'

interface WaveWidgetProps { wave: WaveData; compact?: boolean }

export default function WaveWidget({ wave, compact = false }: WaveWidgetProps) {
  const units = useSettingsStore((s) => s.units)
  const douglas = getDouglasFromHeight(wave.wave_height)
  const douglasColor = getDouglasColor(douglas)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-sky-300">{formatHeight(wave.wave_height, units)}</span>
        <div>
          <div className="text-xs font-medium" style={{ color: douglasColor }}>{getDouglasLabel(douglas)}</div>
          <div className="text-[10px] text-slate-500">{wave.wave_period.toFixed(1)}s · {wave.wave_direction}°</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-3 bg-sky-900/30 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl font-bold text-sky-300">{formatHeight(wave.wave_height, units)}</span>
          <span className="text-sm text-sky-400 ml-1">Hs</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: douglasColor }}>
            Douglas {douglas} — {getDouglasLabel(douglas)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Période {wave.wave_period.toFixed(1)}s</div>
        </div>
      </div>
      {wave.swell_wave_height && (
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="bg-[var(--bg-surface)] rounded-lg p-2">
            <div className="font-medium text-slate-100">Houle</div>
            <div>{formatHeight(wave.swell_wave_height, units)} — {wave.swell_wave_period?.toFixed(1)}s</div>
            <div>{wave.swell_wave_direction}°</div>
          </div>
          {wave.wind_wave_height && (
            <div className="bg-[var(--bg-surface)] rounded-lg p-2">
              <div className="font-medium text-slate-100">Mer du vent</div>
              <div>{formatHeight(wave.wind_wave_height, units)} — {wave.wind_wave_period?.toFixed(1)}s</div>
              <div>{wave.wind_wave_direction}°</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}