import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import { useEphemeris } from '@/hooks/useEphemeris'
import { useLocationStore } from '@/stores/location.store'
import { getEphemeris } from '@/utils/ephemeris'
import DayArcChart from '@/components/ephemeris/DayArcChart'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

function fmt(d: Date | null) {
  return d && !isNaN(d.getTime()) ? format(d, 'HH:mm') : '--'
}

export default function EphemeridePage() {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const today = useEphemeris()

  if (!coords) {
    return (
      <div className="p-4">
        <Alert type="info" title="Position requise">
          Activez la géolocalisation pour afficher l'éphéméride.
        </Alert>
      </div>
    )
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  return (
    <div className="space-y-4 p-4">
      {today && (
        <div className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-xs mb-3 capitalize">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-300 text-xs mb-2">☀️ Soleil</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Lever</span>
                  <span className="font-semibold">{fmt(today.sunrise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Coucher</span>
                  <span className="font-semibold">{fmt(today.sunset)}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-blue-300 text-xs mb-2">{today.moonPhaseEmoji} Lune</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Lever</span>
                  <span className="font-semibold">{fmt(today.moonrise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Coucher</span>
                  <span className="font-semibold">{fmt(today.moonset)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-700">
            <p className="text-blue-300 text-xs mb-2">🎣 Optimums de pêche</p>
            <div className="flex flex-wrap gap-2">
              {today.fishingOptimums.map((opt, i) => (
                <span key={i} className="bg-blue-700/50 rounded-lg px-2 py-1 text-xs">
                  {fmt(opt.start)} – {fmt(opt.end)} ({opt.reason})
                </span>
              ))}
            </div>
          </div>
          <p className="text-blue-300 text-xs mt-3">
            {today.moonPhaseName} — Illumination {Math.round(today.moonIllumination * 100)}%
          </p>
        </div>
      )}

      {today && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-200">Chronogramme solaire & lunaire</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber-400"/>Soleil</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-slate-400"/>Lune</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500 opacity-70"/>Pêche</span>
            </div>
          </div>
          <DayArcChart eph={today} date={new Date()} />
        </Card>
      )}

      <Card padding="none">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <h3 className="font-semibold text-slate-100 text-sm">Éphéméride 7 jours</h3>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {days.map((day) => {
            const eph = getEphemeris(day, coords.lat, coords.lon)
            return (
              <div key={day.toDateString()} className="px-4 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-200 capitalize">
                    {format(day, 'EEEE d MMM', { locale: fr })}
                  </span>
                  <span className="text-sm">
                    {eph.moonPhaseEmoji} {Math.round(eph.moonIllumination * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs text-slate-500">
                  <div className="text-center">
                    <div className="text-amber-500">🌅</div>
                    <div>{fmt(eph.sunrise)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400">🌇</div>
                    <div>{fmt(eph.sunset)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500">🌙</div>
                    <div>{fmt(eph.moonrise)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-300">🌑</div>
                    <div>{fmt(eph.moonset)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
