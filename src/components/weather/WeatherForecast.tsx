import { useWeather } from '@/hooks/useWeather'
import { useSettingsStore } from '@/stores/settings.store'
import { formatTemperature } from '@/utils/units'
import { formatShortDate } from '@/utils/formatters'
import Card from '@/components/ui/Card'

export default function WeatherForecast() {
  const { data } = useWeather()
  const units = useSettingsStore((s) => s.units)

  if (!data?.daily) return null

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <h3 className="font-semibold text-slate-100 text-sm">Prévisions 7 jours</h3>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {data.daily.slice(0, 7).map((day) => (
          <div key={day.dt} className="flex items-center gap-3 px-4 py-3">
            <span className="w-16 text-sm text-slate-300 capitalize">{formatShortDate(day.dt)}</span>
            <span className="text-base w-6 text-center">{getWeatherEmoji(day.weather[0]?.id ?? 0)}</span>
            <div className="flex-1 text-xs text-slate-500 truncate">{day.weather[0]?.description}</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-100 font-medium">{formatTemperature(day.temp.max, units)}</span>
              <span className="text-slate-500">{formatTemperature(day.temp.min, units)}</span>
            </div>
            <div className="text-xs text-sky-400 w-16 text-right">
              {day.pop > 0.2 && <span>{Math.round(day.pop * 100)}% 🌧️</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function getWeatherEmoji(code: number): string {
  if (code === 0 || code === 1) return '☀️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 51 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code >= 85 && code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}