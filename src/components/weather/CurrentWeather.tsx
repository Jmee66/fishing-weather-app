import { useWeather } from '@/hooks/useWeather'
import { useSettingsStore } from '@/stores/settings.store'
import { formatTemperature } from '@/utils/units'
import { formatTime } from '@/utils/formatters'
import WindWidget from './WindWidget'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'

export default function CurrentWeather() {
  const { data, isLoading, error } = useWeather()
  const units = useSettingsStore((s) => s.units)

  if (isLoading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>
  if (error) return <div className="p-4 text-red-600 text-sm">Impossible de charger la météo. Vérifiez votre connexion.</div>
  if (!data?.current) return null

  const c = data.current

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-5xl font-light text-slate-800">{formatTemperature(c.temp, units)}</div>
          <div className="text-slate-500 text-sm mt-1">Ressenti {formatTemperature(c.feels_like, units)}</div>
          <div className="text-slate-700 font-medium mt-1 capitalize">{c.weather[0]?.description ?? ''}</div>
        </div>
        <div className="text-right text-sm text-slate-500 space-y-1">
          <div>Humidité {c.humidity}%</div>
          <div>Pression {c.pressure} hPa</div>
          <div>Visibilité {(c.visibility).toFixed(0)} km</div>
          {c.uvi > 0 && <div>UV {c.uvi.toFixed(1)}</div>}
        </div>
      </div>
      <WindWidget windSpeed={c.wind_speed} windDeg={c.wind_deg} windGust={c.wind_gust} />
      <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span>🌅 {formatTime(c.sunrise)}</span>
        <span>Nuages {c.clouds}%</span>
        <span>🌇 {formatTime(c.sunset)}</span>
      </div>
    </Card>
  )
}