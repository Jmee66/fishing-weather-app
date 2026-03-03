import { useWeather } from '@/hooks/useWeather'
import { useSettingsStore } from '@/stores/settings.store'
import { formatTemperature } from '@/utils/units'
import { formatTime } from '@/utils/formatters'
import WindWidget from './WindWidget'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
import {
  IconSun, IconCloud, IconRain, IconStorm, IconSnow,
  IconPartlyCloud, IconHumidity, IconPressure, IconUV, IconVisibility
} from '@/components/ui/icons/WeatherIcons'

/** Choisit l'icône weather flat selon le code OWM */
function WeatherIcon({ code, size = 56 }: { code: number; size?: number }) {
  if (code >= 200 && code < 300) return <IconStorm size={size} />
  if (code >= 300 && code < 600) return <IconRain size={size} />
  if (code >= 600 && code < 700) return <IconSnow size={size} />
  if (code === 800) return <IconSun size={size} />
  if (code === 801 || code === 802) return <IconPartlyCloud size={size} />
  return <IconCloud size={size} />
}

export default function CurrentWeather() {
  const { data, isLoading, error } = useWeather()
  const units = useSettingsStore((s) => s.units)

  if (isLoading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>
  if (error) return <div className="p-4 text-red-600 text-sm">Impossible de charger la météo. Vérifiez votre connexion.</div>
  if (!data?.current) return null

  const c = data.current

  const weatherCode = c.weather[0]?.id ?? 800

  return (
    <Card className="space-y-4">
      {/* Temp + icône */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-5xl font-light text-slate-100 leading-none">{formatTemperature(c.temp, units)}</div>
          <div className="text-slate-500 text-sm mt-1.5">Ressenti {formatTemperature(c.feels_like, units)}</div>
          <div className="text-slate-200 font-medium mt-1 capitalize text-sm">{c.weather[0]?.description ?? ''}</div>
        </div>
        <div className="flex-shrink-0 drop-shadow-lg">
          <WeatherIcon code={weatherCode} size={68} />
        </div>
      </div>

      {/* Grille info */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
          <IconHumidity size={24} />
          <span className="text-xs font-semibold text-slate-200">{c.humidity}%</span>
          <span className="text-[10px] text-slate-500">Humidité</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
          <IconPressure size={24} />
          <span className="text-xs font-semibold text-slate-200">{c.pressure}</span>
          <span className="text-[10px] text-slate-500">hPa</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
          <IconVisibility size={24} />
          <span className="text-xs font-semibold text-slate-200">{(c.visibility).toFixed(0)}</span>
          <span className="text-[10px] text-slate-500">km</span>
        </div>
        {c.uvi > 0 ? (
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
            <IconUV size={24} />
            <span className="text-xs font-semibold text-slate-200">{c.uvi.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">UV</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
            <IconCloud size={24} />
            <span className="text-xs font-semibold text-slate-200">{c.clouds}%</span>
            <span className="text-[10px] text-slate-500">Nuages</span>
          </div>
        )}
      </div>

      <WindWidget windSpeed={c.wind_speed} windDeg={c.wind_deg} windGust={c.wind_gust} />

      <div className="flex justify-between text-xs text-slate-500 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="flex items-center gap-1">
          <IconSun size={14} /> {formatTime(c.sunrise)}
        </span>
        <span className="text-slate-600">lever · coucher</span>
        <span className="flex items-center gap-1">
          {formatTime(c.sunset)} <IconSun size={14} />
        </span>
      </div>
    </Card>
  )
}