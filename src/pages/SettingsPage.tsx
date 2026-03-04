import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useSettingsStore } from '@/stores/settings.store'
import { useLocationStore } from '@/stores/location.store'
import { useFishingStore } from '@/stores/fishing.store'
import { spotsStorage } from '@/services/storage/spots.storage'
import { logStorage } from '@/services/storage/log.storage'
import { exportBackup, importBackup } from '@/services/storage/backup.service'
import Card from '@/components/ui/Card'
import type { ApiKeys, UnitSystem, WeatherSource, WeatherModel } from '@/types'

export default function SettingsPage() {
  const { apiKeys, units, weatherSource, weatherModel, defaultTileSource, activeLayers, defaultLocation, language, setApiKey, setUnits, setWeatherSource, setWeatherModel } = useSettingsStore()
  const { favourites } = useLocationStore()

  const [isExporting, setIsExporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{ ok: boolean; message: string } | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportBackup(
        { weatherSource, weatherModel, units, defaultTileSource, activeLayers, defaultLocation, language, apiKeys },
        favourites
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus(null)
    try {
      const data = await importBackup(file)
      // 1. Restaurer settings
      useSettingsStore.setState({
        weatherSource: data.settings.weatherSource,
        weatherModel: data.settings.weatherModel,
        units: data.settings.units,
        defaultTileSource: data.settings.defaultTileSource,
        activeLayers: data.settings.activeLayers,
        defaultLocation: data.settings.defaultLocation,
        language: data.settings.language,
        apiKeys: data.settings.apiKeys,
      })
      // 2. Restaurer favoris
      useLocationStore.setState({ favourites: data.favourites })
      // 3. Restaurer spots IndexedDB
      for (const spot of data.spots) await spotsStorage.save(spot)
      // 4. Restaurer carnet IndexedDB
      for (const entry of data.log) await logStorage.save(entry)
      // 5. Forcer rechargement fishing store
      useFishingStore.setState({ isLoaded: false })
      setImportStatus({
        ok: true,
        message: `✅ Restauration réussie — ${data.spots.length} spot${data.spots.length > 1 ? 's' : ''}, ${data.log.length} sortie${data.log.length > 1 ? 's' : ''}, ${data.favourites.length} favori${data.favourites.length > 1 ? 's' : ''}. Rechargement dans 2s…`,
      })
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      setImportStatus({
        ok: false,
        message: `❌ Fichier invalide : ${err instanceof Error ? err.message : 'format incorrect'}`,
      })
    }
    // Reset input pour permettre re-import du même fichier
    e.target.value = ''
  }

  const API_FIELDS: Array<{
    key: keyof ApiKeys
    label: string
    placeholder: string
    link: string
    required: boolean
  }> = [
    {
      key: 'owm', label: 'OpenWeatherMap', placeholder: 'Clé OWM...',
      link: 'https://openweathermap.org/api', required: false,
    },
    {
      key: 'meteofrance', label: 'Météo-France Portail API', placeholder: 'Clé MF...',
      link: 'https://portail-api.meteofrance.fr', required: false,
    },
    {
      key: 'maptiler', label: 'MapTiler (styles vectoriels)', placeholder: 'Clé MapTiler...',
      link: 'https://www.maptiler.com', required: false,
    },
    {
      key: 'shom', label: 'SHOM (cartes marines WMTS)', placeholder: 'Clé SHOM...',
      link: 'https://services.data.shom.fr', required: false,
    },
  ]

  const SOURCE_OPTIONS: Array<{ value: WeatherSource; label: string; desc: string; needsKey?: keyof ApiKeys }> = [
    { value: 'openmeteo', label: 'Open-Meteo', desc: 'Gratuit · ECMWF · Global' },
    { value: 'meteofrance', label: 'Météo-France', desc: 'Officiel · France uniquement', needsKey: 'meteofrance' },
    { value: 'owm', label: 'OpenWeatherMap', desc: 'Global · Clé API requise', needsKey: 'owm' },
  ]

  const MODEL_OPTIONS: Record<WeatherSource, Array<{ value: WeatherModel; label: string }>> = {
    openmeteo: [
      { value: 'auto', label: 'Auto (recommandé)' },
      { value: 'ecmwf', label: 'ECMWF IFS' },
      { value: 'gfs', label: 'GFS (NOAA)' },
      { value: 'icon', label: 'ICON (DWD)' },
      { value: 'arome_france', label: 'AROME (MF)' },
    ],
    meteofrance: [
      { value: 'arome_france', label: 'AROME (2.5 km)' },
      { value: 'arome_france_hd', label: 'AROME HD (1.3 km)' },
      { value: 'arpege', label: 'ARPEGE (Global)' },
    ],
    owm: [
      { value: 'auto', label: 'Standard (par défaut)' },
    ],
  }

  const UNIT_OPTIONS: Array<{ value: UnitSystem; label: string; desc: string }> = [
    { value: 'metric', label: 'Métrique', desc: 'km/h, °C, km' },
    { value: 'nautical', label: 'Nautique', desc: 'nœuds, °C, nm' },
    { value: 'imperial', label: 'Impérial', desc: 'mph, °F, mi' },
  ]

  return (
    <div className="space-y-4 p-4">

      {/* Sauvegarde & Restauration */}
      <Card>
        <h2 className="font-semibold text-slate-100 mb-1">Sauvegarde & Restauration</h2>
        <p className="text-xs text-slate-500 mb-4">
          Exporte clés API, préférences, favoris, spots et carnet dans un fichier JSON local.
        </p>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-900/20 text-sky-300 text-sm font-medium hover:bg-sky-900/40 transition-colors disabled:opacity-50"
        >
          {isExporting ? '⏳ Export en cours…' : '📥 Exporter la sauvegarde'}
        </button>

        <label className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-600 bg-[var(--bg-surface)] text-slate-300 text-sm font-medium hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer">
          📤 Importer une sauvegarde
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>

        {importStatus && (
          <div className={`mt-3 p-3 rounded-xl text-xs ${importStatus.ok ? 'bg-green-900/30 border border-green-700/40 text-green-300' : 'bg-red-900/30 border border-red-700/40 text-red-300'}`}>
            {importStatus.message}
          </div>
        )}
      </Card>

      {/* Weather Source */}
      <Card>
        <h2 className="font-semibold text-slate-100 mb-3">Source météo</h2>
        <div className="space-y-2 mb-4">
          {SOURCE_OPTIONS.map((opt) => {
            const isActive = weatherSource === opt.value
            const missingKey = opt.needsKey && !apiKeys[opt.needsKey]
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setWeatherSource(opt.value)
                  // Reset model to first available
                  const models = MODEL_OPTIONS[opt.value]
                  if (models.length > 0) setWeatherModel(models[0].value)
                }}
                className="w-full text-left p-3 rounded-xl border transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgb(14 165 233 / 0.12)' : 'var(--bg-surface)',
                  borderColor: isActive ? 'rgb(56 189 248 / 0.5)' : 'var(--border-default)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-medium ${isActive ? 'text-sky-300' : 'text-slate-300'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {missingKey && (
                      <span className="text-xs text-amber-500">⚠️ Clé manquante</span>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-sky-400" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Modèle de prévision</h3>
        <div className="grid grid-cols-2 gap-2">
          {MODEL_OPTIONS[weatherSource].map((opt) => {
            const isActive = weatherModel === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setWeatherModel(opt.value)}
                className="p-2 rounded-xl border text-left text-xs transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgb(14 165 233 / 0.15)' : 'var(--bg-surface)',
                  borderColor: isActive ? 'rgb(56 189 248 / 0.5)' : 'var(--border-default)',
                  color: isActive ? 'rgb(125 211 252)' : 'var(--text-secondary)',
                }}
              >
                <span className={isActive ? 'font-semibold' : ''}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Units */}
      <Card>
        <h2 className="font-semibold text-slate-100 mb-3">Unités</h2>
        <div className="grid grid-cols-3 gap-2">
          {UNIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUnits(opt.value)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                units === opt.value
                  ? 'border-sky-500/60 bg-sky-900/30 text-sky-300'
                  : 'border-[var(--border-default)] text-slate-400 hover:bg-[var(--bg-elevated)] hover:text-slate-300'
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="opacity-70 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* API Keys */}
      <Card>
        <h2 className="font-semibold text-slate-100 mb-3">Clés API</h2>
        <p className="text-xs text-slate-500 mb-4">
          Stockées uniquement sur votre appareil. Les APIs sans clé (Open-Meteo, Vigicrues, OSM) fonctionnent sans configuration.
        </p>
        <div className="space-y-4">
          {API_FIELDS.map(({ key, label, placeholder, link, required }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-200">
                  {label}
                  {!required && (
                    <span className="ml-1 text-xs text-slate-500">(optionnel)</span>
                  )}
                </label>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline"
                >
                  Obtenir une clé ↗
                </a>
              </div>
              <input
                type="password"
                className="w-full border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
                placeholder={placeholder}
                value={apiKeys[key]}
                onChange={(e) => setApiKey(key, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-slate-200 block mb-1">
              Copernicus Marine (nom d'utilisateur)
              <span className="ml-1 text-xs text-slate-500">(optionnel)</span>
            </label>
            <input
              type="text"
              className="w-full border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Nom d'utilisateur CMEMS..."
              value={apiKeys.copernicus_user}
              onChange={(e) => setApiKey('copernicus_user', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Free APIs status */}
      <Card>
        <h2 className="font-semibold text-slate-100 mb-3">APIs gratuites (sans clé)</h2>
        <div className="space-y-2 text-sm text-slate-300">
          {[
            { name: 'Open-Meteo', desc: 'Météo + Vagues + Modèles ECMWF', ok: true },
            { name: "Vigicrues / Hub'Eau", desc: 'Débits rivières France', ok: true },
            { name: 'OpenStreetMap / Nominatim', desc: 'Cartes + Géocodage', ok: true },
            { name: 'OpenSeaMap', desc: 'Marques nautiques', ok: true },
            { name: 'SHOM WPS (marées)', desc: 'Prédictions marées', ok: true },
          ].map(({ name, desc, ok }) => (
            <div key={name} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <div>
                <div className="font-medium text-slate-100">{name}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
              <span className="text-xs text-green-600 font-medium">{ok ? '✅ Actif' : '❌'}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center pb-2 space-y-1">
        <p className="text-xs text-slate-500">
          FishWeather <span className="font-mono text-slate-400">v{__APP_VERSION__}</span>
        </p>
        <p className="text-[10px] text-slate-600">PWA React 19 · TypeScript 5 · Vite 7</p>
      </div>
    </div>
  )
}
