import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useWeather } from '@/hooks/useWeather'
import { useLocationStore } from '@/stores/location.store'
import { useSettingsStore } from '@/stores/settings.store'
import { formatTemperature, formatWindSpeed, getWindDirectionLabel } from '@/utils/units'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const MODEL_LABELS: Record<string, string> = {
  auto: 'Auto', arome: 'AROME 2.5km', arome_hd: 'AROME HD 1.3km',
  arpege: 'ARPEGE 10km', gfs: 'GFS', ecmwf: 'ECMWF', icon: 'ICON',
}

const WMO_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

function wmoIcon(code: number): string {
  return WMO_ICONS[code] ?? '🌡️'
}

export default function WeatherPage() {
  const [tab, setTab] = useState('current')
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const { weatherModel, units, setWeatherModel } = useSettingsStore()
  const { data, isLoading, error } = useWeather(coords ?? undefined)

  const tabs = [
    { id: 'current', label: 'Actuelle' },
    { id: 'hourly', label: 'Heure/heure' },
    { id: 'daily', label: '7 jours' },
  ]

  if (!coords) {
    return (
      <div className="p-4">
        <Alert type="info" title="Position requise">
          Activez la géolocalisation depuis l'accueil pour afficher la météo.
        </Alert>
      </div>
    )
  }

  const cur = data?.current
  const weatherCondition = cur?.weather?.[0]

  return (
    <div className="space-y-3 p-4">
      {/* Model selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(MODEL_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setWeatherModel(key as any)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              weatherModel === key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert type="error" title="Erreur météo">
          {error instanceof Error ? error.message : 'Impossible de charger les données météo. Vérifiez votre connexion.'}
        </Alert>
      )}

      {data && cur && tab === 'current' && (
        <div className="space-y-3">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-5xl font-light text-slate-100">
                  {formatTemperature(cur.temp, units)}
                </p>
                <p className="text-slate-500 mt-1 capitalize">
                  {weatherCondition?.description ?? '—'}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Ressenti {formatTemperature(cur.feels_like, units)}
                </p>
              </div>
              <div className="text-6xl">
                {weatherCondition ? wmoIcon(weatherCondition.id) : '🌡️'}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-slate-500 mb-1">Vent</p>
              <p className="font-semibold text-slate-100">
                {formatWindSpeed(cur.wind_speed, units)}
              </p>
              <p className="text-sm text-slate-500">
                {getWindDirectionLabel(cur.wind_deg)}
                {cur.wind_gust != null && ` — Raf. ${formatWindSpeed(cur.wind_gust, units)}`}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">Pression</p>
              <p className="font-semibold text-slate-100">{cur.pressure} hPa</p>
              <p className="text-sm text-slate-500">Hum. {cur.humidity}%</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">Visibilité</p>
              <p className="font-semibold text-slate-100">
                {(cur.visibility / 1000).toFixed(1)} km
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">UV / Nuages</p>
              <p className="font-semibold text-slate-100">UV {cur.uvi?.toFixed(0) ?? '—'}</p>
              <p className="text-sm text-slate-500">Couverture {cur.clouds}%</p>
            </Card>
          </div>

          {data.alerts && data.alerts.length > 0 && (
            <Alert type="warning" title={`⚠️ ${data.alerts[0].event}`}>
              {data.alerts[0].description.slice(0, 200)}
            </Alert>
          )}
        </div>
      )}

      {data && tab === 'hourly' && (
        <Card padding="none">
          <div className="divide-y divide-[var(--border-subtle)]">
            {data.hourly.slice(0, 24).map((h) => {
              const cond = h.weather?.[0]
              return (
                <div key={h.dt} className="flex items-center px-4 py-2.5 gap-3">
                  <span className="text-slate-500 text-sm w-12">
                    {format(new Date(h.dt * 1000), 'HH:mm')}
                  </span>
                  <span className="text-xl w-8">
                    {cond ? wmoIcon(cond.id) : '🌡️'}
                  </span>
                  <span className="font-semibold text-slate-100 text-sm w-16">
                    {formatTemperature(h.temp, units)}
                  </span>
                  <div className="flex-1 text-xs text-slate-500">
                    {formatWindSpeed(h.wind_speed, units)}{' '}
                    {getWindDirectionLabel(h.wind_deg)}
                    {h.pop > 0.2 && (
                      <span className="ml-2 text-blue-500">
                        {Math.round(h.pop * 100)}% pluie
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {data && tab === 'daily' && (
        <Card padding="none">
          <div className="divide-y divide-[var(--border-subtle)]">
            {data.daily.map((d) => {
              const cond = d.weather?.[0]
              return (
                <div key={d.dt} className="flex items-center px-4 py-3 gap-3">
                  <div className="w-24">
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {format(new Date(d.dt * 1000), 'EEEE', { locale: fr })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(d.dt * 1000), 'd MMM', { locale: fr })}
                    </p>
                  </div>
                  <span className="text-xl">{cond ? wmoIcon(cond.id) : '🌡️'}</span>
                  <div className="flex-1 text-sm text-slate-300 text-right">
                    <span className="font-semibold text-slate-100">
                      {formatTemperature(d.temp.max, units)}
                    </span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span>{formatTemperature(d.temp.min, units)}</span>
                  </div>
                  {d.rain != null && d.rain > 0 && (
                    <Badge color="blue">{d.rain.toFixed(1)}mm</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
