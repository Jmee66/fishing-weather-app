# FishWeather

PWA React/TypeScript complete pour pecheurs et navigateurs. Fonctionne sur Chrome desktop et Chrome iPhone.

## Fonctionnalites

### Meteo
- Meteo actuelle et previsions 7 jours (horaire + quotidien)
- Selecteur de source : Open-Meteo (gratuit), OpenWeatherMap, Meteo-France
- Selecteur de modele : AROME 2.5km, AROME HD 1.3km, ARPEGE, GFS, ECMWF
- Rose des vents, pression barometrique, UV, visibilite
- Alertes meteo

### Meteo Marine
- Hauteur de vague, periode, direction swell
- Etat de la mer : echelle Beaufort + Douglas
- Vent en mer (offshore/inshore)
- Bulletins cotiers CROSS (Meteo-France)

### Marees
- Predictions PM/BM via SHOM (Service Hydrographique de la Marine)
- Coefficients de maree (vives-eaux/mortes-eaux)
- Port de reference le plus proche auto-detecte

### Cartographie
- Fond de carte : OpenStreetMap, SHOM, Satellite ESRI
- Overlay : OpenSeaMap (marques nautiques)
- Couches : spots de peche, profondeurs, courants, Vigicrues
- GPS temps reel, recherche de lieu

### Peche
- Spots : ajout/edition/suppression, categories (mer cotiere, bateau, lac, riviere, reservoir)
- Carnet : journal des sorties avec especes, tailles, conditions
- Indice d activite : algorithme combinant pression, lune, marees, vent, saison, ephemeride
- Reglementation : tailles minimales legales, quotas, fermetures saisonnieres (14 especes)

### Ephemeride
- Lever/coucher soleil et lune avec azimuts
- Crepuscules civil, nautique, astronomique
- Phases lunaires + illumination
- Optimums de peche calcules (30min avant/apres lever+coucher)

### Hydrologie (eau douce)
- Stations Vigicrues les plus proches
- Hauteur d eau et debit en temps reel
- Tendance (montant/stable/descendant)
- Vigilance crues (vert/jaune/orange/rouge)

### PWA / Offline
- Installation sur iPhone (Add to Home Screen) et desktop
- Cache Workbox : meteo 10min, tuiles OSM 30 jours, SHOM 24h
- Mode offline avec donnees recentes

## Stack technique

| Couche | Outil |
|---|---|
| Build | Vite 7 + TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Etat | Zustand 5 (persist) |
| Data fetching | TanStack Query 5 |
| Cartographie | Leaflet 1.9 + MapLibre GL 5 |
| Formulaires | React Hook Form 7 + Zod 4 |
| Offline DB | IndexedDB (idb 8) |
| Calculs astro | SunCalc 1.9 |
| Dates | date-fns 4 |
| PWA | vite-plugin-pwa + Workbox |

## Installation locale

git clone https://github.com/Jmee66/fishing-weather-app
cd fishing-weather-app
npm install
cp .env.example .env.local
npm run dev

Ouvrir http://localhost:5173

## Configuration des APIs

| Service | Obligatoire | Lien |
|---|---|---|
| Open-Meteo | Non (gratuit, sans cle) | https://open-meteo.com |
| OpenWeatherMap | Non (fonctions avancees) | https://openweathermap.org/api |
| Meteo-France | Non (AROME/ARPEGE) | https://portail-api.meteofrance.fr |
| MapTiler | Non (styles vectoriels) | https://www.maptiler.com |
| SHOM | Non (tuiles marines) | https://services.data.shom.fr |
| Vigicrues | Non (gratuit, sans cle) | https://hubeau.eaufrance.fr |

## Deploiement

L app est deployee automatiquement sur GitHub Pages a chaque push sur main.

URL : https://jmee66.github.io/fishing-weather-app

## Branches

main     -> Production (deploiement auto GitHub Pages)
develop  -> Integration features

## Licence

MIT - (c) 2025 Jmee66
