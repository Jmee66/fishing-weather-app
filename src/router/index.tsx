import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '@/layouts/MainLayout'
import MapLayout from '@/layouts/MapLayout'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full min-h-screen">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

const wrap = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
)

const HomePage = lazy(() => import('@/pages/HomePage'))
const WeatherPage = lazy(() => import('@/pages/WeatherPage'))
const MarinePage = lazy(() => import('@/pages/MarinePage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const FishingPage = lazy(() => import('@/pages/FishingPage'))
const TidesPage = lazy(() => import('@/pages/TidesPage'))
const EphemeridePage = lazy(() => import('@/pages/EphemeridePage'))
const HydrologyPage = lazy(() => import('@/pages/HydrologyPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const OfflinePage = lazy(() => import('@/pages/OfflinePage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: wrap(HomePage) },
      { path: 'weather', element: wrap(WeatherPage) },
      { path: 'marine', element: wrap(MarinePage) },
      { path: 'fishing/*', element: wrap(FishingPage) },
      { path: 'tides', element: wrap(TidesPage) },
      { path: 'ephemeris', element: wrap(EphemeridePage) },
      { path: 'hydrology', element: wrap(HydrologyPage) },
      { path: 'settings', element: wrap(SettingsPage) },
    ],
  },
  {
    path: '/map',
    element: <MapLayout />,
    children: [{ index: true, element: wrap(MapPage) }],
  },
  { path: '/offline', element: wrap(OfflinePage) },
  { path: '*', element: <Navigate to="/" replace /> },
])
