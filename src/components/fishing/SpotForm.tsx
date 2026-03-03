import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FishingCategory, FishingTechnique, FishingSpot } from '@/types'
import { useLocationStore } from '@/stores/location.store'

const schema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  category: z.enum(['coastal', 'boat', 'freshwater_lake', 'freshwater_river', 'reservoir'] as const),
  description: z.string().optional(),
  lat: z.number({ error: 'Latitude requise' }),
  lon: z.number({ error: 'Longitude requise' }),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORY_OPTIONS: { value: FishingCategory; label: string; emoji: string }[] = [
  { value: 'coastal',         label: 'Mer côtière',  emoji: '🌊' },
  { value: 'boat',            label: 'Au large',     emoji: '⛵' },
  { value: 'freshwater_lake', label: 'Lac',          emoji: '🏞️' },
  { value: 'freshwater_river',label: 'Rivière',      emoji: '🌊' },
  { value: 'reservoir',       label: 'Réservoir',    emoji: '💧' },
]

const TECHNIQUE_OPTIONS: { value: FishingTechnique; label: string }[] = [
  { value: 'surfcasting', label: 'Surfcasting' },
  { value: 'spinning',    label: 'Spinning' },
  { value: 'fly',         label: 'Mouche' },
  { value: 'bottom',      label: 'Fond' },
  { value: 'trolling',    label: 'Traîne' },
  { value: 'jigging',     label: 'Jigging' },
  { value: 'bait',        label: 'Appât naturel' },
  { value: 'feeder',      label: 'Feeder' },
  { value: 'match',       label: 'Match' },
  { value: 'carpfishing', label: 'Carpe' },
  { value: 'other',       label: 'Autre' },
]

interface SpotFormProps {
  initialCoords?: { lat: number; lon: number }
  spotToEdit?: FishingSpot
  onSave: (spot: FishingSpot) => void
  onClose: () => void
}

export default function SpotForm({ initialCoords, spotToEdit, onSave, onClose }: SpotFormProps) {
  const activeCoords = useLocationStore((s) => s.getActiveLocation())
  const defaultLat = initialCoords?.lat ?? spotToEdit?.coordinates.lat ?? activeCoords?.lat ?? 0
  const defaultLon = initialCoords?.lon ?? spotToEdit?.coordinates.lon ?? activeCoords?.lon ?? 0

  const [techniques, setTechniques] = useState<FishingTechnique[]>(spotToEdit?.techniques ?? [])
  const [species, setSpecies] = useState<string[]>(spotToEdit?.species ?? [])
  const [speciesInput, setSpeciesInput] = useState('')
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(spotToEdit?.rating ?? 3)

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: spotToEdit?.name ?? '',
      category: spotToEdit?.category ?? 'coastal',
      description: spotToEdit?.description ?? '',
      lat: defaultLat,
      lon: defaultLon,
      notes: spotToEdit?.notes ?? '',
    },
  })

  const activeCategory = useWatch({ control, name: 'category' })

  const toggleTechnique = (t: FishingTechnique) =>
    setTechniques((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const addSpecies = () => {
    const s = speciesInput.trim()
    if (s && !species.includes(s)) setSpecies((prev) => [...prev, s])
    setSpeciesInput('')
  }

  const onSubmit = (data: FormData) => {
    const now = Date.now()
    const spot: FishingSpot = {
      id: spotToEdit?.id ?? `spot_${now}_${Math.random().toString(36).slice(2, 6)}`,
      name: data.name,
      category: data.category,
      coordinates: { lat: data.lat, lon: data.lon },
      description: data.description ?? '',
      techniques,
      species,
      notes: data.notes,
      rating,
      createdAt: spotToEdit?.createdAt ?? now,
      updatedAt: now,
    }
    onSave(spot)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full max-w-md rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-100 text-lg">
            {spotToEdit ? '✏️ Modifier le spot' : '📌 Nouveau spot de pêche'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nom du spot *</label>
            <input
              {...register('name')}
              placeholder="Ex : Pointe des Corbeaux"
              className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)]"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          {/* Catégorie */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Catégorie *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((opt) => {
                const isActive = activeCategory === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('category', opt.value)}
                    className="text-center p-2 rounded-xl border text-xs transition-colors"
                    style={{
                      backgroundColor: isActive ? 'rgb(14 165 233 / 0.15)' : 'var(--bg-surface)',
                      borderColor: isActive ? 'rgb(56 189 248 / 0.6)' : 'var(--border-default)',
                      color: isActive ? 'rgb(125 211 252)' : 'var(--text-secondary)',
                    }}
                  >
                    <div className="text-base mb-0.5">{opt.emoji}</div>
                    <div className="font-medium">{opt.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Coordonnées */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Latitude</label>
              <input
                {...register('lat', { valueAsNumber: true })}
                type="number" step="0.0001"
                className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)] font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Longitude</label>
              <input
                {...register('lon', { valueAsNumber: true })}
                type="number" step="0.0001"
                className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)] font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Ex : Bon spot pour le bar en automne..."
              className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)] resize-none"
            />
          </div>

          {/* Techniques */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Techniques de pêche</label>
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

          {/* Espèces */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Espèces ciblées</label>
            <div className="flex gap-2 mb-2">
              <input
                value={speciesInput}
                onChange={(e) => setSpeciesInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecies())}
                placeholder="Ex : Bar, Dorade..."
                className="flex-1 px-3 py-1.5 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)]"
              />
              <button
                type="button" onClick={addSpecies}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-sky-400 border border-sky-800/50 hover:bg-sky-900/20"
              >
                +
              </button>
            </div>
            {species.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {species.map((s) => (
                  <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-900/30 text-teal-400 border border-teal-800/40">
                    {s}
                    <button type="button" onClick={() => setSpecies((prev) => prev.filter((x) => x !== s))} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Note personnelle</label>
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

          {/* Notes libres */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes libres</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Observations personnelles..."
              className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600 bg-[var(--bg-surface)] border-[var(--border-default)] resize-none"
            />
          </div>

          {/* Boutons */}
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
              {spotToEdit ? 'Modifier' : '📌 Sauver le spot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
