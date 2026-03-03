export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  dt: number
  sunrise: number
  sunset: number
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  uvi: number
  clouds: number
  visibility: number
  wind_speed: number
  wind_deg: number
  wind_gust?: number
  weather: WeatherCondition[]
  source?: string
  model?: string
}

export interface HourlyForecast {
  dt: number
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  wind_speed: number
  wind_deg: number
  wind_gust?: number
  weather: WeatherCondition[]
  pop: number
  rain?: { '1h': number }
  snow?: { '1h': number }
}

export interface DailyForecast {
  dt: number
  sunrise: number
  sunset: number
  moonrise: number
  moonset: number
  moon_phase: number
  temp: {
    day: number
    min: number
    max: number
    night: number
    eve: number
    morn: number
  }
  feels_like: {
    day: number
    night: number
    eve: number
    morn: number
  }
  pressure: number
  humidity: number
  wind_speed: number
  wind_deg: number
  wind_gust?: number
  weather: WeatherCondition[]
  clouds: number
  pop: number
  rain?: number
  snow?: number
  uvi: number
}

export interface WeatherAlert {
  sender_name: string
  event: string
  start: number
  end: number
  description: string
  tags: string[]
}

export interface WeatherData {
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
  current: CurrentWeather
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  alerts?: WeatherAlert[]
}

export type BeaufortScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type PressureTrend = 'rising_fast' | 'rising' | 'stable' | 'falling' | 'falling_fast'
