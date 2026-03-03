import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTides } from '@/hooks/useTides'
import { useLocationStore } from '@/stores/location.store'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function TidesPage() {
  const coords = useLocationStore((s) => s.getActiveLocation())
  const { data: tides, isLoading, error } = useTides(coords ?? undefined)

  if (!coords) {
    return (
      <div className="p-4">
        <Alert type="info" title="Position requise">
          Activez la géolocalisation pour afficher les marées du port le plus proche.
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {isLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}

      {error && (
        <Alert type="error" title="Erreur SHOM">
          Impossible de charger les prédictions de marée.
        </Alert>
      )}

      {tides && (
        <>
          <Card>
            <p className="text-xs text-slate-500 mb-1">Port de référence</p>
            <p className="text-xl font-semibold text-slate-100">{tides.harbourName}</p>
            <p className="text-sm text-slate-500">
              {tides.distance.toFixed(0)} km de votre position
            </p>
          </Card>

          <Card padding="none">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-semibold text-slate-100 text-sm">Prochaines marées</h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {tides.events.map((ev, i) => (
                <div key={i} className="flex items-center px-4 py-3 gap-3">
                  <Badge color={ev.type === 'PM' ? 'blue' : 'teal'} className="w-10 justify-center">
                    {ev.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100 capitalize">
                      {format(new Date(ev.dt * 1000), "EEEE d MMMM", { locale: fr })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(ev.dt * 1000), "HH:mm")} — {ev.height.toFixed(2)} m
                    </p>
                  </div>
                  {ev.coefficient != null && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-200">{ev.coefficient}</p>
                      <p className="text-xs text-slate-500">
                        {ev.coefficient >= 95 ? 'Grandes VE' :
                         ev.coefficient >= 80 ? 'Vives-eaux' :
                         ev.coefficient >= 45 ? 'Moyennes' : 'Mortes-eaux'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="text-xs text-slate-500 text-center">
            Données SHOM — Service Hydrographique et Océanographique de la Marine
          </div>
        </>
      )}
    </div>
  )
}
