import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import { useVigicrues } from '@/hooks/useVigicrues'
import { useLocationStore } from '@/stores/location.store'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { HydrologyData } from '@/types'

const VIGILANCE_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-green-100', text: 'text-green-700', label: 'Vert — Pas de vigilance' },
  2: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Jaune — Vigilance' },
  3: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Orange — Alerte' },
  4: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rouge — Alerte maximale' },
}

const TREND_LABELS: Record<string, string> = {
  rising: '↑ Montant',
  falling: '↓ Descendant',
  stable: '→ Stable',
}

function StationCard({ item }: { item: HydrologyData }) {
  const { station, currentHeight, observations, trend, vigilance } = item
  const colorId = vigilance?.color_id ?? 1
  const vc = VIGILANCE_COLORS[colorId] ?? VIGILANCE_COLORS[1]

  const lastObs = observations[observations.length - 1]

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-100">{station.libelle_site}</p>
          <p className="text-xs text-slate-500">
            {station.libelle_commune}
            {station.distance != null ? ` — ${station.distance.toFixed(0)} km` : ''}
          </p>
        </div>
        {vigilance && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${vc.bg} ${vc.text}`}>
            {vigilance.color_label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-base)] rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Hauteur</p>
          <p className="font-semibold text-slate-100">
            {currentHeight != null ? `${currentHeight.toFixed(2)} m` : '—'}
          </p>
        </div>
        <div className="bg-[var(--bg-base)] rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Tendance</p>
          <p className="font-semibold text-slate-100">{TREND_LABELS[trend]}</p>
        </div>
      </div>

      {lastObs && (
        <p className="text-xs text-slate-500 mt-2">
          Dernière mesure :{' '}
          {format(new Date(lastObs.date_obs), "d MMM à HH:mm", { locale: fr })}
        </p>
      )}
    </Card>
  )
}

export default function HydrologyPage() {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const { data, isLoading, error } = useVigicrues(coords ?? undefined)

  if (!coords) {
    return (
      <div className="p-4">
        <Alert type="info" title="Position requise">
          Activez la géolocalisation pour voir les stations hydrométriques proches.
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-sm text-slate-300 bg-sky-900/30 rounded-xl p-3 border border-sky-800">
        Données <strong>Vigicrues / Hub'Eau</strong> — Réseau hydrométrique national français.
      </div>

      {isLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}

      {error && (
        <Alert type="error" title="Erreur Vigicrues">
          Impossible de charger les données hydrologiques.
        </Alert>
      )}

      {data && data.length === 0 && (
        <Card>
          <p className="text-slate-500 text-sm text-center py-4">
            Aucune station Vigicrues trouvée dans un rayon de 30 km.
          </p>
        </Card>
      )}

      {data && data.map((item) => (
        <StationCard key={item.station.code_site} item={item} />
      ))}
    </div>
  )
}
