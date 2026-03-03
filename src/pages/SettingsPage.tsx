import { useSettingsStore } from '@/stores/settings.store'
import Card from '@/components/ui/Card'
import type { ApiKeys, UnitSystem } from '@/types'

export default function SettingsPage() {
  const { apiKeys, units, setApiKey, setUnits } = useSettingsStore()

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

  const UNIT_OPTIONS: Array<{ value: UnitSystem; label: string; desc: string }> = [
    { value: 'metric', label: 'Métrique', desc: 'km/h, °C, km' },
    { value: 'nautical', label: 'Nautique', desc: 'nœuds, °C, nm' },
    { value: 'imperial', label: 'Impérial', desc: 'mph, °F, mi' },
  ]

  return (
    <div className="space-y-4 p-4">
      {/* Units */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-3">Unités</h2>
        <div className="grid grid-cols-3 gap-2">
          {UNIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUnits(opt.value)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                units === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
        <h2 className="font-semibold text-slate-800 mb-3">Clés API</h2>
        <p className="text-xs text-slate-500 mb-4">
          Stockées uniquement sur votre appareil. Les APIs sans clé (Open-Meteo, Vigicrues, OSM) fonctionnent sans configuration.
        </p>
        <div className="space-y-4">
          {API_FIELDS.map(({ key, label, placeholder, link, required }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">
                  {label}
                  {!required && (
                    <span className="ml-1 text-xs text-slate-400">(optionnel)</span>
                  )}
                </label>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Obtenir une clé ↗
                </a>
              </div>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
                placeholder={placeholder}
                value={apiKeys[key]}
                onChange={(e) => setApiKey(key, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Copernicus Marine (nom d'utilisateur)
              <span className="ml-1 text-xs text-slate-400">(optionnel)</span>
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Nom d'utilisateur CMEMS..."
              value={apiKeys.copernicus_user}
              onChange={(e) => setApiKey('copernicus_user', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Free APIs status */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-3">APIs gratuites (sans clé)</h2>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            { name: 'Open-Meteo', desc: 'Météo + Vagues + Modèles ECMWF', ok: true },
            { name: "Vigicrues / Hub'Eau", desc: 'Débits rivières France', ok: true },
            { name: 'OpenStreetMap / Nominatim', desc: 'Cartes + Géocodage', ok: true },
            { name: 'OpenSeaMap', desc: 'Marques nautiques', ok: true },
            { name: 'SHOM WPS (marées)', desc: 'Prédictions marées', ok: true },
          ].map(({ name, desc, ok }) => (
            <div key={name} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
              <div>
                <div className="font-medium text-slate-800">{name}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
              <span className="text-xs text-green-600 font-medium">{ok ? '✅ Actif' : '❌'}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-slate-400 text-center pb-2">
        FishWeather v1.0 — PWA React/TypeScript
      </p>
    </div>
  )
}
