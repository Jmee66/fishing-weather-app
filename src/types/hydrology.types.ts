export type VigicrueLevel = 1 | 2 | 3 | 4

export interface HydrologyStation {
  code_site: string
  libelle_site: string
  code_commune_site: string
  libelle_commune: string
  coordonnee_x: number
  coordonnee_y: number
  altitude_ref_alti: number
  distance?: number
}

export interface RiverObservation {
  code_site: string
  date_obs: string
  resultat_obs: number
  code_statut: string
  libelle_statut: string
}

export interface RiverFlow {
  code_site: string
  date_obs: string
  resultat_obs: number
  code_methode_obs: string
  libelle_methode_obs: string
}

export interface VigicrueAlert {
  territory_code: string
  territory_label: string
  color_id: VigicrueLevel
  color_label: string
  short_label: string
  qualification: string
}

export interface HydrologyData {
  station: HydrologyStation
  currentHeight?: number
  currentFlow?: number
  observations: RiverObservation[]
  trend: 'rising' | 'stable' | 'falling'
  vigilance?: VigicrueAlert
}
