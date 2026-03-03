/**
 * Flat-color weather & app icons — style météo illustré
 * Inspiré du style Shutterstock / Meteocons / Weather Icons packs
 * Toutes les icônes sont des SVG inline avec dégradés et formes pleines
 */

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

/* ─── Soleil ─── */
export function IconSun({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="sun-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor="#FFB800" />
        </radialGradient>
      </defs>
      {/* Rayons */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <rect key={i}
          x="22.5" y="4" width="3" height="7" rx="1.5"
          fill="#FFD000"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      {/* Corps */}
      <circle cx="24" cy="24" r="11" fill="url(#sun-g)" />
    </svg>
  )
}

/* ─── Nuage ─── */
export function IconCloud({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="cloud-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8F4FF" />
          <stop offset="100%" stopColor="#BDD8F5" />
        </linearGradient>
      </defs>
      <path d="M36 34H14a9 9 0 1 1 1.6-17.8A10 10 0 0 1 36 20a8 8 0 0 1 0 14z" fill="url(#cloud-g)" />
    </svg>
  )
}

/* ─── Soleil + Nuage ─── */
export function IconPartlyCloud({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="sun2-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor="#FFB800" />
        </radialGradient>
        <linearGradient id="cloud2-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0F8FF" />
          <stop offset="100%" stopColor="#C5DCEF" />
        </linearGradient>
      </defs>
      {[0,60,120,180,240,300].map((deg, i) => (
        <rect key={i} x="15.5" y="5" width="2.5" height="5" rx="1.25"
          fill="#FFD000" transform={`rotate(${deg} 17 17)`} />
      ))}
      <circle cx="17" cy="17" r="8" fill="url(#sun2-g)" />
      <path d="M38 37H20a7 7 0 1 1 1.3-13.9A8 8 0 0 1 38 27a6 6 0 0 1 0 10z" fill="url(#cloud2-g)" />
    </svg>
  )
}

/* ─── Pluie ─── */
export function IconRain({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="rain-cloud-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8BAED4" />
          <stop offset="100%" stopColor="#6090BA" />
        </linearGradient>
        <linearGradient id="drop-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60ACEE" />
          <stop offset="100%" stopColor="#2575C4" />
        </linearGradient>
      </defs>
      <path d="M34 26H14a8 8 0 1 1 1.4-15.9A9 9 0 0 1 34 14a7 7 0 0 1 0 12z" fill="url(#rain-cloud-g)" />
      {/* Gouttes */}
      <path d="M16 32 Q15 35 16 38" stroke="url(#drop-g)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 34 Q21 37 22 40" stroke="url(#drop-g)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 32 Q27 35 28 38" stroke="url(#drop-g)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Orage ─── */
export function IconStorm({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="storm-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#607080" />
          <stop offset="100%" stopColor="#3A4A5A" />
        </linearGradient>
      </defs>
      <path d="M34 24H14a8 8 0 1 1 1.4-15.9A9 9 0 0 1 34 12a7 7 0 0 1 0 12z" fill="url(#storm-g)" />
      <path d="M26 27l-5 9h5l-4 8 9-12h-6l4-5z" fill="#FFE000" />
    </svg>
  )
}

/* ─── Neige ─── */
export function IconSnow({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="snow-cloud-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D6E8F8" />
          <stop offset="100%" stopColor="#B2CDE0" />
        </linearGradient>
      </defs>
      <path d="M34 26H14a8 8 0 1 1 1.4-15.9A9 9 0 0 1 34 14a7 7 0 0 1 0 12z" fill="url(#snow-cloud-g)" />
      <circle cx="16" cy="34" r="2.5" fill="#9AC8E8" />
      <circle cx="24" cy="38" r="2.5" fill="#9AC8E8" />
      <circle cx="32" cy="34" r="2.5" fill="#9AC8E8" />
    </svg>
  )
}

/* ─── Vent ─── */
export function IconWind({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <path d="M6 16h22a6 6 0 1 0-6-6" stroke="#78A8CC" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 24h30a5 5 0 1 0-5-5" stroke="#4D8AB5" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 32h18a4 4 0 1 0 4 4" stroke="#78A8CC" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Vagues ─── */
export function IconWave({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="wave1-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E88D4" />
          <stop offset="100%" stopColor="#0D5FA8" />
        </linearGradient>
        <linearGradient id="wave2-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2FA8E8" />
          <stop offset="100%" stopColor="#1070C0" />
        </linearGradient>
      </defs>
      <path d="M4 20 C8 16 12 16 16 20 C20 24 24 24 28 20 C32 16 36 16 40 20 C44 24 44 24 44 24 L44 38 C44 40 42 42 40 42 L8 42 C6 42 4 40 4 38 Z" fill="url(#wave2-g)" opacity="0.7"/>
      <path d="M4 16 C8 12 12 12 16 16 C20 20 24 20 28 16 C32 12 36 12 40 16 C44 20 44 22 44 22 L4 22 Z" fill="url(#wave1-g)" />
      <path d="M4 16 C8 12 12 12 16 16 C20 20 24 20 28 16 C32 12 36 12 40 16" stroke="#60C8F8" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

/* ─── Marée montante ─── */
export function IconTideUp({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="tide-g" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
      </defs>
      <rect x="4" y="28" width="40" height="16" rx="3" fill="url(#tide-g)" opacity="0.85"/>
      <path d="M4 28 C10 24 14 24 20 28 C26 32 30 32 36 28 C40 25 42 26 44 28" stroke="#64B5F6" strokeWidth="2" fill="none"/>
      <path d="M24 6 L16 16 H22 V24 H26 V16 H32 Z" fill="#42A5F5" />
    </svg>
  )
}

/* ─── Marée descendante ─── */
export function IconTideDown({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="tide-d-g" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
      </defs>
      <rect x="4" y="28" width="40" height="16" rx="3" fill="url(#tide-d-g)" opacity="0.85"/>
      <path d="M4 28 C10 24 14 24 20 28 C26 32 30 32 36 28 C40 25 42 26 44 28" stroke="#64B5F6" strokeWidth="2" fill="none"/>
      <path d="M24 26 L16 16 H22 V8 H26 V16 H32 Z" fill="#64B5F6" />
    </svg>
  )
}

/* ─── Lune (croissant) ─── */
export function IconMoon({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="moon-g" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="100%" stopColor="#E8CC80" />
        </radialGradient>
      </defs>
      <path d="M30 10 A16 16 0 1 0 30 38 A11 11 0 1 1 30 10Z" fill="url(#moon-g)" />
    </svg>
  )
}

/* ─── Thermomètre ─── */
export function IconThermo({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <rect x="20" y="6" width="8" height="26" rx="4" fill="#E0E8F0" />
      <rect x="22" y="14" width="4" height="18" rx="2" fill="#FF5252" />
      <circle cx="24" cy="36" r="7" fill="#FF5252" />
      <circle cx="24" cy="36" r="4" fill="#FF8A80" />
    </svg>
  )
}

/* ─── Baromètre / Pression ─── */
export function IconPressure({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="baro-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A90D9" />
          <stop offset="100%" stopColor="#1A5FA0" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="26" r="18" fill="url(#baro-g)" opacity="0.15" stroke="#4A90D9" strokeWidth="2"/>
      <path d="M12 34 A15 15 0 0 1 36 34" stroke="#8AB8E0" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M24 26 L30 16" stroke="#FF5252" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="26" r="3" fill="#4A90D9" />
    </svg>
  )
}

/* ─── Humidité / Goutte ─── */
export function IconHumidity({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="drop2-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60CFFF" />
          <stop offset="100%" stopColor="#1A7ACC" />
        </linearGradient>
      </defs>
      <path d="M24 8 C24 8 10 24 10 32 A14 14 0 0 0 38 32 C38 24 24 8 24 8Z" fill="url(#drop2-g)" />
      <path d="M18 33 C18 30 20 28 24 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

/* ─── UV ─── */
export function IconUV({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="uv-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#FF8800" />
        </radialGradient>
      </defs>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <rect key={i} x="22.5" y="4" width="3" height="6" rx="1.5"
          fill="#FF9900" transform={`rotate(${deg} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="10" fill="url(#uv-g)" />
      <text x="24" y="28" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7A3000">UV</text>
    </svg>
  )
}

/* ─── Visibilité ─── */
export function IconVisibility({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <path d="M6 24 C12 14 20 10 24 10 C28 10 36 14 42 24 C36 34 28 38 24 38 C20 38 12 34 6 24Z" fill="#1A6BAA" opacity="0.2" stroke="#4A9AD4" strokeWidth="2"/>
      <circle cx="24" cy="24" r="7" fill="#4A9AD4" />
      <circle cx="24" cy="24" r="4" fill="#A0D4F5" />
      <circle cx="26" cy="22" r="1.5" fill="white" opacity="0.8"/>
    </svg>
  )
}

/* ─── Poisson / Pêche ─── */
export function IconFish({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="fish-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#40C8F0" />
          <stop offset="100%" stopColor="#0870C8" />
        </linearGradient>
        <linearGradient id="fish-belly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60D8FF" />
          <stop offset="100%" stopColor="#2090E0" />
        </linearGradient>
      </defs>
      {/* Queue */}
      <path d="M6 24 L14 16 L14 32 Z" fill="#0860B8" />
      {/* Corps */}
      <ellipse cx="28" cy="24" rx="16" ry="10" fill="url(#fish-g)" />
      {/* Ventre */}
      <ellipse cx="28" cy="26" rx="13" ry="6" fill="url(#fish-belly)" opacity="0.5"/>
      {/* Écailles */}
      <path d="M22 20 Q24 17 27 20" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M28 18 Q30 15 33 18" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M20 25 Q22 22 25 25" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4"/>
      {/* Nageoire dorsale */}
      <path d="M22 18 Q26 10 32 16" stroke="#0050A0" strokeWidth="2" fill="none"/>
      {/* Œil */}
      <circle cx="38" cy="22" r="3" fill="white" />
      <circle cx="38.8" cy="22" r="1.8" fill="#001A40" />
      <circle cx="39.3" cy="21.2" r="0.7" fill="white"/>
      {/* Bouche */}
      <path d="M43 24 Q44 25 43 26" stroke="#0050A0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Carte / Map ─── */
export function IconMap({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="map-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4CAF7A" />
          <stop offset="100%" stopColor="#2E7D52" />
        </linearGradient>
        <linearGradient id="map-sea" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A9AD4" />
          <stop offset="100%" stopColor="#1E5FA0" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="40" height="36" rx="4" fill="url(#map-sea)" />
      <path d="M4 20 L14 14 L22 22 L32 12 L44 18 L44 42 L4 42 Z" fill="url(#map-g)" opacity="0.9"/>
      <polygon points="4,6 14,6 14,14 4,20" fill="url(#map-g)" opacity="0.7"/>
      {/* Route */}
      <path d="M10 36 Q18 30 24 32 Q32 34 38 28" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.7"/>
      {/* Pin */}
      <circle cx="30" cy="22" r="4" fill="#FF5252" />
      <circle cx="30" cy="22" r="2" fill="white" />
    </svg>
  )
}

/* ─── Maison / Accueil ─── */
export function IconHome({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="home-roof" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B9BD5" />
          <stop offset="100%" stopColor="#2E6FAA" />
        </linearGradient>
        <linearGradient id="home-wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0F6FF" />
          <stop offset="100%" stopColor="#D0E4F8" />
        </linearGradient>
      </defs>
      {/* Mur */}
      <rect x="9" y="24" width="30" height="20" rx="2" fill="url(#home-wall)" />
      {/* Toit */}
      <path d="M4 26 L24 8 L44 26 Z" fill="url(#home-roof)" />
      {/* Porte */}
      <rect x="19" y="32" width="10" height="12" rx="2" fill="#6090C0" />
      <circle cx="27" cy="38" r="1.2" fill="white" />
      {/* Fenêtre gauche */}
      <rect x="11" y="28" width="8" height="7" rx="1.5" fill="#A0C8E8" />
      {/* Fenêtre droite */}
      <rect x="29" y="28" width="8" height="7" rx="1.5" fill="#A0C8E8" />
    </svg>
  )
}

/* ─── Ancre / Marine ─── */
export function IconAnchor({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="anchor-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A9AD4" />
          <stop offset="100%" stopColor="#1A5A90" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="12" r="5" stroke="url(#anchor-g)" strokeWidth="3" fill="none"/>
      <line x1="24" y1="17" x2="24" y2="40" stroke="url(#anchor-g)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M12 24 L18 24" stroke="url(#anchor-g)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M36 24 L30 24" stroke="url(#anchor-g)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M12 40 Q12 34 24 34 Q36 34 36 40" stroke="url(#anchor-g)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

/* ─── Rivière / Hydrologie ─── */
export function IconRiver({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="river-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#29B6F6" />
          <stop offset="100%" stopColor="#0277BD" />
        </linearGradient>
      </defs>
      <path d="M6 12 Q16 16 14 24 Q12 32 22 36 Q30 40 42 36" stroke="url(#river-g)" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M6 20 Q12 24 12 30 Q12 36 20 40 Q28 44 42 42" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Arbres / rives */}
      <path d="M6 8 L10 16 L2 16 Z" fill="#4CAF50" opacity="0.7"/>
      <path d="M38 8 L42 16 L34 16 Z" fill="#4CAF50" opacity="0.7"/>
    </svg>
  )
}

/* ─── Phase lunaire ─── */
export function IconFullMoon({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="fullmoon-g" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFDE4" />
          <stop offset="60%" stopColor="#F0E080" />
          <stop offset="100%" stopColor="#C8B040" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="18" fill="url(#fullmoon-g)" />
      <circle cx="18" cy="18" r="3.5" fill="#D4B840" opacity="0.4"/>
      <circle cx="30" cy="22" r="2" fill="#D4B840" opacity="0.3"/>
      <circle cx="22" cy="30" r="2.5" fill="#D4B840" opacity="0.35"/>
    </svg>
  )
}

/* ─── Engrenage / Paramètres ─── */
export function IconSettings({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="gear-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78909C" />
          <stop offset="100%" stopColor="#455A64" />
        </linearGradient>
      </defs>
      <path d="M24 4 L27 10 L33 8 L35 14 L41 14 L40 21 L46 24 L40 27 L41 34 L35 34 L33 40 L27 38 L24 44 L21 38 L15 40 L13 34 L7 34 L8 27 L2 24 L8 21 L7 14 L13 14 L15 8 L21 10 Z"
        fill="url(#gear-g)" />
      <circle cx="24" cy="24" r="8" fill="#263238" />
      <circle cx="24" cy="24" r="5" fill="url(#gear-g)" opacity="0.5"/>
    </svg>
  )
}

/* ─── GPS / Localisation ─── */
export function IconGPS({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="gps-g" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FF7043" />
          <stop offset="100%" stopColor="#BF360C" />
        </radialGradient>
      </defs>
      <path d="M24 4 A16 16 0 0 1 40 20 C40 30 24 44 24 44 C24 44 8 30 8 20 A16 16 0 0 1 24 4 Z" fill="url(#gps-g)" />
      <circle cx="24" cy="20" r="6" fill="white" />
      <circle cx="24" cy="20" r="3.5" fill="#FF5722" />
    </svg>
  )
}

/* ─── Étoile ─── */
type StarProps = IconProps & { filled?: boolean }
export function IconStar({ size = 24, filled = true, ...p }: StarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="star-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      <path
        d="M24 4 L28.5 17 L42 17 L31 25.5 L35 38.5 L24 30 L13 38.5 L17 25.5 L6 17 L19.5 17 Z"
        fill={filled ? 'url(#star-g)' : 'none'}
        stroke={filled ? 'none' : '#FFB300'}
        strokeWidth={filled ? 0 : 2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Compas ─── */
export function IconCompass({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <radialGradient id="compass-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#37474F" />
          <stop offset="100%" stopColor="#263238" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#compass-g)" stroke="#546E7A" strokeWidth="2"/>
      <circle cx="24" cy="24" r="16" stroke="#455A64" strokeWidth="1" fill="none"/>
      {/* Aiguilles N/S */}
      <path d="M24 8 L21 24 L24 22 L27 24 Z" fill="#FF5252" />
      <path d="M24 40 L21 24 L24 26 L27 24 Z" fill="#ECEFF1" />
      {/* Points cardinaux */}
      <text x="24" y="7" textAnchor="middle" fontSize="5.5" fill="#FF5252" fontWeight="bold">N</text>
      <text x="24" y="45" textAnchor="middle" fontSize="5.5" fill="#90A4AE">S</text>
      <text x="5" y="25.5" textAnchor="middle" fontSize="5.5" fill="#90A4AE">O</text>
      <text x="43" y="25.5" textAnchor="middle" fontSize="5.5" fill="#90A4AE">E</text>
    </svg>
  )
}

/* ─── Alerte / Warning ─── */
export function IconAlert({ size = 24, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...p}>
      <defs>
        <linearGradient id="alert-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
      </defs>
      <path d="M24 4 L44 42 L4 42 Z" fill="url(#alert-g)" />
      <rect x="22" y="18" width="4" height="13" rx="2" fill="white" />
      <circle cx="24" cy="36" r="2.5" fill="white" />
    </svg>
  )
}
