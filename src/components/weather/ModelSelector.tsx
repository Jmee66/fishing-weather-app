import { useSettingsStore } from '@/stores/settings.store'
import { WEATHER_MODELS } from '@/constants/api.constants'
import type { WeatherModel, WeatherSource } from '@/types'

export default function ModelSelector() {
  const { weatherSource, weatherModel, setWeatherSource, setWeatherModel } = useSettingsStore()

  const SOURCES = [
    { id: 'openmeteo', label: 'Open-Meteo', description: 'Gratuit, ECMWF' },
    { id: 'owm', label: 'OpenWeatherMap', description: 'Clé API requise' },
    { id: 'meteofrance', label: 'Météo-France', description: 'AROME/ARPEGE, clé requise' },
  ] as const

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Source météo</label>
        <div className="grid grid-cols-3 gap-2">
          {SOURCES.map((src) => (
            <button
              key={src.id}
              onClick={() => setWeatherSource(src.id as WeatherSource)}
              className={`p-2 rounded-xl border text-xs text-left transition-colors ${weatherSource === src.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <div className="font-medium">{src.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{src.description}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Modèle de prévision</label>
        <div className="space-y-1">
          {WEATHER_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setWeatherModel(model.id as WeatherModel)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-sm transition-colors ${weatherModel === model.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
            >
              <span className="font-medium">{model.name}</span>
              <span className="text-xs opacity-60">{model.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}