export const OWM_BASE_URL = 'https://api.openweathermap.org/data/3.0'
export const OWM_GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0'

export const MF_BASE_URL = 'https://public-api.meteofrance.fr/public'
export const MF_AROME_URL = `${MF_BASE_URL}/arome/1.0`
export const MF_ARPEGE_URL = `${MF_BASE_URL}/arpege/1.0`
export const MF_BULLETINS_URL = `${MF_BASE_URL}/DPBulletinsCotiers/v1`

export const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1'
export const OPENMETEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1'

export const SHOM_TIDES_URL = 'https://services.data.shom.fr/spm/wps'
export const SHOM_WMTS_URL = 'https://services.data.shom.fr/INSPIRE/wmts'

export const COPERNICUS_URL = 'https://my.cmems-du.eu/motu-web/Motu'

export const VIGICRUES_BASE_URL = 'https://hubeau.eaufrance.fr/api/v2'
export const VIGICRUES_SITES_URL = `${VIGICRUES_BASE_URL}/hydrometrie/referentiel/sites`
export const VIGICRUES_OBS_URL = `${VIGICRUES_BASE_URL}/hydrometrie/observations_tr`

export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'
export const GEOAPIGOUV_URL = 'https://geo.api.gouv.fr'

export const WEATHER_MODELS = [
  { id: 'auto', name: 'Auto (recommandé)', source: 'openmeteo', description: 'Sélection automatique du meilleur modèle' },
  { id: 'arome', name: 'AROME 2.5km', source: 'meteofrance', description: 'Haute résolution France, 2.5km' },
  { id: 'arome_hd', name: 'AROME HD 1.3km', source: 'meteofrance', description: 'Très haute résolution, 1.3km' },
  { id: 'arpege', name: 'ARPEGE 10km', source: 'meteofrance', description: 'Prévisions globales Météo-France' },
  { id: 'gfs', name: 'GFS 22km', source: 'owm', description: 'Modèle américain NOAA, global' },
  { id: 'ecmwf', name: 'ECMWF IFS', source: 'openmeteo', description: 'Centre européen, très fiable' },
  { id: 'icon', name: 'ICON-EU', source: 'openmeteo', description: 'Modèle Allemand DWD, 7km' },
] as const

export const MARINE_ZONES_CROSS = [
  { id: 'manche_est', name: 'Manche Est', region: 'manche' },
  { id: 'manche_centrale', name: 'Manche Centrale', region: 'manche' },
  { id: 'manche_ouest', name: 'Manche Ouest - Iroise', region: 'manche' },
  { id: 'nord_gascogne', name: 'Nord Gascogne', region: 'atlantique' },
  { id: 'sud_gascogne', name: 'Sud Gascogne', region: 'atlantique' },
  { id: 'cotiere_atlantique', name: 'Côtière Atlantique', region: 'atlantique' },
  { id: 'lion', name: 'Golfe du Lion', region: 'mediterranee' },
  { id: 'ligurie', name: 'Ligurie', region: 'mediterranee' },
  { id: 'cotiere_med', name: 'Côtière Méditerranée', region: 'mediterranee' },
] as const
