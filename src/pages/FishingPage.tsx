import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { useFishingData } from '@/hooks/useFishingData'
import { useLocationStore } from '@/stores/location.store'
import { useFishActivity } from '@/hooks/useFishActivity'
import { SPECIES_REGULATIONS } from '@/constants/fishing.constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const CATEGORY_LABELS: Record<string, string> = {
  coastal: '🌊 Mer côtière',
  boat: '⛵ Bateau',
  freshwater_lake: '🏞️ Lac',
  freshwater_river: '🏞️ Rivière',
  reservoir: '💧 Réservoir',
}

const ACTIVITY_FACTOR_LABELS: Record<string, string> = {
  pressure: 'Pression baro.',
  lunar: 'Phase lunaire',
  tides: 'Marées',
  wind: 'Vent',
  season: 'Saison',
  ephemeris: 'Éphéméride',
}

export default function FishingPage() {
  const [tab, setTab] = useState('spots')
  const coords = useLocationStore((s) => s.getActiveLocation())
  const { spots, log, isLoaded } = useFishingData()
  const fishActivity = useFishActivity()

  const tabs = [
    { id: 'spots', label: 'Spots' },
    { id: 'log', label: 'Carnet' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'reglementation', label: 'Réglementation' },
  ]

  const speciesList = Object.values(SPECIES_REGULATIONS)

  return (
    <div className="space-y-3 p-4">
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {!isLoaded && <div className="flex justify-center py-8"><Spinner /></div>}

      {tab === 'spots' && isLoaded && (
        <div className="space-y-3">
          {spots.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📌</div>
              <p className="text-slate-500 text-sm">Aucun spot enregistré.</p>
              <p className="text-slate-400 text-xs mt-1">
                Longue pression sur la carte pour ajouter un spot.
              </p>
            </div>
          ) : (
            spots.map((spot) => (
              <Card key={spot.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{spot.name}</p>
                    <Badge color="blue" className="mt-1">
                      {CATEGORY_LABELS[spot.category] ?? spot.category}
                    </Badge>
                    {spot.description && (
                      <p className="text-sm text-slate-500 mt-1">{spot.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {spot.coordinates.lat.toFixed(4)}°N, {spot.coordinates.lon.toFixed(4)}°E
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'log' && isLoaded && (
        <div className="space-y-3">
          {log.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-slate-500 text-sm">Aucune sortie enregistrée.</p>
            </div>
          ) : (
            log.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-slate-800">
                    {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                  <Badge color={entry.catches.length > 0 ? 'green' : 'slate'}>
                    {entry.catches.length} prise{entry.catches.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {entry.catches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.catches.map((c, i) => (
                      <Badge key={i} color="teal">
                        {c.species}
                        {c.totalWeight != null ? ` ${c.totalWeight}kg` : ''}
                        {c.biggestLength != null ? ` ${c.biggestLength}cm` : ''}
                      </Badge>
                    ))}
                  </div>
                )}
                {entry.notes && (
                  <p className="text-sm text-slate-500 mt-2">{entry.notes}</p>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'conditions' && (
        <div className="space-y-3">
          {!coords ? (
            <Card>
              <p className="text-slate-500 text-sm text-center py-4">
                Activez la géolocalisation pour voir les conditions de pêche.
              </p>
            </Card>
          ) : (
            <>
              <Card>
                <p className="text-xs text-slate-500 mb-2">Indice d'activité pêche</p>
                {fishActivity ? (
                  <>
                    <div className="flex items-end gap-3 mb-3">
                      <p className="text-5xl font-bold text-slate-800">
                        {fishActivity.total.toFixed(1)}
                      </p>
                      <p className="text-xl font-semibold text-slate-500 mb-1">/ 10</p>
                      <Badge
                        color={
                          fishActivity.label === 'excellent' ? 'green' :
                          fishActivity.label === 'good' ? 'teal' :
                          fishActivity.label === 'average' ? 'amber' : 'red'
                        }
                        className="mb-1"
                      >
                        {fishActivity.label}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          fishActivity.total >= 7 ? 'bg-green-500' :
                          fishActivity.total >= 4 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${fishActivity.total * 10}%` }}
                      />
                    </div>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {Object.entries(fishActivity.factors).map(([key, score]) => (
                        <li key={key} className="flex items-center gap-1">
                          <span>{score >= 6 ? '✅' : score >= 3 ? '⚠️' : '❌'}</span>
                          <span>
                            {ACTIVITY_FACTOR_LABELS[key] ?? key} : {score.toFixed(1)}/10
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-400 mt-2">{fishActivity.recommendation}</p>
                  </>
                ) : (
                  <Spinner />
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {tab === 'reglementation' && (
        <div className="space-y-2">
          {speciesList.map((spec) => {
            const defaultSize = spec.minSize?.default
            const quota = spec.quotaPerDay?.recreational
            const closedSeason = spec.closedSeasons?.[0]
            return (
              <Card key={spec.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{spec.name}</p>
                    <p className="text-xs text-slate-400 italic">{spec.scientificName}</p>
                  </div>
                  <Badge color={defaultSize ? 'blue' : 'slate'}>
                    {defaultSize ? `≥ ${defaultSize} cm` : 'Pas de taille min.'}
                  </Badge>
                </div>
                {quota != null && (
                  <p className="text-xs text-slate-500 mt-1">
                    Quota journalier : {quota}
                  </p>
                )}
                {closedSeason && (
                  <p className="text-xs text-amber-600 mt-1">
                    Fermeture : {closedSeason.start} → {closedSeason.end}
                    {closedSeason.region !== 'general' && ` (${closedSeason.region})`}
                  </p>
                )}
                {spec.notes && (
                  <p className="text-xs text-orange-600 mt-1">{spec.notes}</p>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
