import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import type { FishingLogEntry, FishingTechnique, CatchRecord } from '@/types'
import { useWeather } from '@/hooks/useWeather'
import { useTides } from '@/hooks/useTides'
import { useEphemeris } from '@/hooks/useEphemeris'
import { useFishActivity } from '@/hooks/useFishActivity'

const schema = z.object({
  date: z.string().min(1, 'Date requise'),
  spotId: z.string().min(1, 'Sélectionnez un spot'),
  spotName: z.string(),
  duration: z.number().min(0).max(24),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5),
})
type FormData = z.infer<typeof schema>

const TECHNIQUE_OPTIONS: { value: FishingTechnique; label: string }[] = [
  { value: 'surfcasting', label: 'Surfcasting' }, { value: 'spinning', label: 'Spinning' },
  { value: 'fly', label: 'Mouche' }, { value: 'bottom', label: 'Fond' },
  { value: 'trolling', label: 'Traîne' }, { value: 'jigging', label: 'Jigging' },
  { value: 'bait', label: 'Appât' }, { value: 'feeder', label: 'Feeder' },
  { value: 'match', label: 'Match' }, { value: 'carpfishing', label: 'Carpe' },
  { value: 'other', label: 'Autre' },
]

interface LogEntryFormProps {
  spots: Array<{ id: string; name: string }>
  entryToEdit?: FishingLogEntry
  onSave: (entry: FishingLogEntry) => void
  onClose: () => void
}

interface CatchInput {
  species: string
  count: number
  totalWeight: string
  biggestLength: string
  released: boolean
}

export default function LogEntryForm({ spots, entryToEdit, onSave, onClose }: LogEntryFormProps) {
  const { data: weather } = useWeather()
  const { data: tides } = useTides()
  const ephemeris = useEphemeris()
  const fishActivity = useFishActivity()

  const [techniques, setTechniques] = useState<FishingTechnique[]>(entryToEdit?.techniques ?? [])
  const [catches, setCatches] = useState<CatchInput[]>(
    entryToEdit?.catches.map((c) => ({
      species: c.species, count: c.count,
      totalWeight: c.totalWeight?.toString() ?? '',
      biggestLength: c.biggestLength?.toString() ?? '',
      released: c.released,
    })) ?? []
  )
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(entryToEdit?.rating ?? 3)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: entryToEdit ? format(new Date(entryToEdit.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      spotId: entryToEdit?.spotId ?? '',
      spotName: entryToEdit?.spotName ?? '',
      duration: entryToEdit?.duration ?? 3,
      notes: entryToEdit?.notes ?? '',
      rating: entryToEdit?.rating ?? 3,
    },
  })

  const selectedSpotId = watch('spotId')

  const handleSpotChange = (id: string) => {
    const spot = spots.find((s) => s.id === id)
    setValue('spotId', id)
    setValue('spotName', spot?.name ?? '')
  }

  const addCatch = () => setCatches((prev) => [...prev, { species: '', count: 1, totalWeight: '', biggestLength: '', released: false }])
  const removeCatch = (i: number) => setCatches((prev) => prev.filter((_, idx) => idx !== i))
  const updateCatch = (i: number, field: keyof CatchInput, value: string | number | boolean) =>
    setCatches((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))

  const toggleTechnique = (t: FishingTechnique) =>
    setTechniques((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const onSubmit = (data: FormData) => {
    const now = Date.now()
    const dateMs = new Date(data.date).getTime()

    const catchRecords: CatchRecord[] = catches
      .filter((c) => c.species.trim())
      .map((c) => ({
        species: c.species.trim(),
        count: c.count,
        totalWeight: c.totalWeight ? parseFloat(c.totalWeight) : undefined,
        biggestLength: c.biggestLength ? parseFloat(c.biggestLength) : undefined,
        released: c.released,
      }))

    // Conditions auto depuis hooks
    const currentWeather = weather?.current
    const currentTide = tides?.nextEvent
    const pressureHistory = weather?.hourly?.slice(0, 6).map((h) => h.pressure) ?? []
    const pressureDiff = pressureHistory.length >= 2 ? pressureHistory[pressureHistory.length - 1] - pressureHistory[0] : 0
    const pressureTrend = pressureDiff > 2 ? 'rising' : pressureDiff < -2 ? 'falling' : 'stable'

    const entry: FishingLogEntry = {
      id: entryToEdit?.id ?? `log_${now}_${Math.random().toString(36).slice(2, 6)}`,
      spotId: data.spotId,
      spotName: data.spotName,
      date: dateMs,
      duration: data.duration,
      catches: catchRecords,
      techniques,
      notes: data.notes ?? '',
      rating,
      conditions: {
        weatherSummary: currentWeather?.weather?.[0]?.description ?? '',
        windSpeed: currentWeather?.wind_speed ?? 0,
        windDirection: currentWeather?.wind_deg ?? 0,
        windGust: currentWeather?.wind_gust,
        temperature: currentWeather?.temp ?? 0,
        pressure: currentWeather?.pressure ?? 1013,
        pressureTrend: pressureTrend as 'rising' | 'stable' | 'falling',
        tidePhase: currentTide?.type === 'PM' ? 'high' : currentTide?.type === 'BM' ? 'low' : undefined,
        tideCoefficient: tides?.coefficient,
        lunarPhase: ephemeris?.moonPhaseName ?? '',
        lunarIllumination: ephemeris?.moonIllumination ?? 0,
        fishActivityIndex: fishActivity?.total ?? 0,
        waveHeight: undefined,
      },
    }
    onSave(entry)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full max-w-md rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-100 text-lg">
            {entryToEdit ? '✏️ Modifier la sortie' : '📖 Nouvelle sortie'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date + Durée */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date *</label>
              <input
                {...register('date')} type="date"
                className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)]"
              />
              {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Durée (h)</label>
              <input
                {...register('duration', { valueAsNumber: true })} type="number" min="0" max="24" step="0.5"
                className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)]"
              />
            </div>
          </div>

          {/* Spot */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Spot de pêche *</label>
            <select
              value={selectedSpotId}
              onChange={(e) => handleSpotChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)]"
            >
              <option value="">— Sélectionner un spot —</option>
              {spots.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.spotId && <p className="text-xs text-red-400 mt-1">Sélectionnez un spot</p>}
          </div>

          {/* Prises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Prises</label>
              <button type="button" onClick={addCatch} className="text-xs text-sky-400 hover:text-sky-300 font-medium">
                + Ajouter une prise
              </button>
            </div>
            <div className="space-y-2">
              {catches.map((c, i) => (
                <div key={i} className="rounded-xl border p-3 space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center gap-2">
                    <input
                      value={c.species}
                      onChange={(e) => updateCatch(i, 'species', e.target.value)}
                      placeholder="Espèce (ex: Bar)"
                      className="flex-1 px-2 py-1.5 rounded-lg border text-sm text-slate-100 outline-none bg-[var(--bg-elevated)] border-[var(--border-default)]"
                    />
                    <input
                      value={c.count}
                      onChange={(e) => updateCatch(i, 'count', parseInt(e.target.value) || 1)}
                      type="number" min="1" max="999"
                      className="w-16 px-2 py-1.5 rounded-lg border text-sm text-slate-100 outline-none bg-[var(--bg-elevated)] border-[var(--border-default)] text-center"
                      placeholder="nb"
                    />
                    <button type="button" onClick={() => removeCatch(i)} className="text-slate-600 hover:text-red-400">×</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={c.totalWeight}
                      onChange={(e) => updateCatch(i, 'totalWeight', e.target.value)}
                      type="number" step="0.1" placeholder="Poids (kg)"
                      className="px-2 py-1.5 rounded-lg border text-xs text-slate-100 outline-none bg-[var(--bg-elevated)] border-[var(--border-default)]"
                    />
                    <input
                      value={c.biggestLength}
                      onChange={(e) => updateCatch(i, 'biggestLength', e.target.value)}
                      type="number" step="0.1" placeholder="Taille max (cm)"
                      className="px-2 py-1.5 rounded-lg border text-xs text-slate-100 outline-none bg-[var(--bg-elevated)] border-[var(--border-default)]"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox" checked={c.released}
                      onChange={(e) => updateCatch(i, 'released', e.target.checked)}
                      className="rounded"
                    />
                    Relâché(s)
                  </label>
                </div>
              ))}
              {catches.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">Aucune prise enregistrée</p>
              )}
            </div>
          </div>

          {/* Techniques */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Techniques utilisées</label>
            <div className="flex flex-wrap gap-1.5">
              {TECHNIQUE_OPTIONS.map((t) => (
                <button
                  key={t.value} type="button"
                  onClick={() => toggleTechnique(t.value)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    backgroundColor: techniques.includes(t.value) ? 'rgb(14 165 233 / 0.2)' : 'var(--bg-surface)',
                    borderColor: techniques.includes(t.value) ? 'rgb(14 165 233 / 0.5)' : 'var(--border-default)',
                    color: techniques.includes(t.value) ? 'rgb(56 189 248)' : 'var(--text-secondary)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note globale */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Note de la sortie</label>
            <div className="flex gap-1">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n} type="button"
                  onClick={() => setRating(n)}
                  className={`text-xl transition-opacity ${n <= rating ? 'opacity-100' : 'opacity-30'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Conditions auto */}
          {weather?.current && (
            <div className="rounded-xl border p-3 text-xs text-slate-500 space-y-1" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              <p className="font-medium text-slate-400 mb-1">🌤 Conditions auto (au moment de la saisie)</p>
              <p>Temp. {weather.current.temp.toFixed(1)}°C · Vent {(weather.current.wind_speed * 3.6).toFixed(0)} km/h · Pression {weather.current.pressure} hPa</p>
              {ephemeris && <p>{ephemeris.moonPhaseName} — {Math.round(ephemeris.moonIllumination * 100)}% illuminé</p>}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Observations, appâts utilisés, conseils..."
              className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'rgb(14 165 233)', color: 'white' }}
            >
              {entryToEdit ? 'Modifier' : '📖 Sauver la sortie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
