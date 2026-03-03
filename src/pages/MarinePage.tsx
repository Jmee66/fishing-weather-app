import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useMarineWeather } from '@/hooks/useMarineWeather'
import { useTides } from '@/hooks/useTides'
import { useLocationStore } from '@/stores/location.store'
import { getBeaufortFromMs, getBeaufortLabel } from '@/utils/beaufort'
import { getDouglasFromHeight, getDouglasLabel } from '@/utils/douglas'
import { formatWindSpeed } from '@/utils/units'
import { useSettingsStore } from '@/stores/settings.store'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function MarinePage() {
  const [tab, setTab] = useState('summary')
  const coords = useLocationStore((s) => s.getActiveLocation())
  const { units } = useSettingsStore()
  const { data: marine, isLoading: marineLoading, error: marineError } = useMarineWeather(coords ?? undefined)
  const { data: tides, isLoading: tidesLoading } = useTides(coords ?? undefined)

  const tabs = [
    { id: 'summary', label: 'Résumé' },
    { id: 'waves', label: 'Vagues' },
    { id: 'tides', label: 'Marées' },
  ]

  if (!coords) {
    return (
      <div className="p-4">
        <Alert type="info" title="Position requise">
          Activez la géolocalisation depuis l'accueil pour afficher la météo marine.
        </Alert>
      </div>
    )
  }

  // First hourly entry as "current"
  const currentMarine = marine?.hourly?.[0]

  return (
    <div className="space-y-3 p-4">
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {marineLoading && tab !== 'tides' && (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      )}

      {marineError && (
        <Alert type="error" title="Erreur données marines">
          Impossible de charger les données marines (Open-Meteo).
        </Alert>
      )}

      {tab === 'summary' && currentMarine && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-slate-500 mb-1">Hauteur vague</p>
              <p className="text-2xl font-semibold text-blue-700">
                {currentMarine.wave_height.toFixed(1)} m
              </p>
              <p className="text-sm text-slate-500">
                {getDouglasLabel(getDouglasFromHeight(currentMarine.wave_height))}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">Vent offshore</p>
              <p className="text-2xl font-semibold text-slate-800">
                {formatWindSpeed(currentMarine.wind_speed_10m, units)}
              </p>
              <p className="text-sm text-slate-500">
                Beaufort {getBeaufortFromMs(currentMarine.wind_speed_10m)} —{' '}
                {getBeaufortLabel(getBeaufortFromMs(currentMarine.wind_speed_10m))}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">Période vague</p>
              <p className="text-2xl font-semibold text-slate-800">
                {currentMarine.wave_period?.toFixed(0) ?? '—'} s
              </p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">Direction houle</p>
              <p className="text-2xl font-semibold text-slate-800">
                {currentMarine.wave_direction?.toFixed(0) ?? '—'}°
              </p>
            </Card>
          </div>
        </div>
      )}

      {tab === 'waves' && marine && (
        <Card padding="none">
          <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-700">
            Prévisions vagues 48h
          </div>
          <div className="divide-y divide-slate-50">
            {marine.hourly.slice(0, 48).filter((_, i) => i % 3 === 0).map((h) => (
              <div key={h.dt} className="flex items-center px-4 py-2.5 gap-3">
                <span className="text-slate-500 text-sm w-14">
                  {format(new Date(h.dt * 1000), 'HH:mm')}
                </span>
                <span className="font-semibold text-blue-700 w-16">
                  {h.wave_height.toFixed(1)} m
                </span>
                <div className="flex-1 text-xs text-slate-500">
                  {h.wave_period?.toFixed(0)}s —{' '}
                  {formatWindSpeed(h.wind_speed_10m, units)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'tides' && (
        <>
          {tidesLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}
          {tides && (
            <div className="space-y-3">
              <Card>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Port de référence
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {tides.harbourName}
                </p>
                <p className="text-sm text-slate-500">
                  {tides.distance.toFixed(0)} km de votre position
                </p>
              </Card>
              <Card padding="none">
                <div className="divide-y divide-slate-50">
                  {tides.events.slice(0, 12).map((ev, i) => (
                    <div key={i} className="flex items-center px-4 py-3 gap-3">
                      <Badge color={ev.type === 'PM' ? 'blue' : 'slate'}>
                        {ev.type}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {format(new Date(ev.dt * 1000), "EEEE d MMM 'à' HH:mm", { locale: fr })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ev.height.toFixed(2)} m
                          {ev.coefficient != null && ` — Coeff. ${ev.coefficient}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
