import type { Motif } from '@/data/projects'

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MOTIFS: Motif[] = ['pixels', 'orbit', 'stripes', 'window', 'blob', 'type']

/** On-brand stand-in artwork. Swap for real images via the `src` prop. */
export function ProjectImage({
  src,
  alt,
  palette,
  motif,
  seed = 1,
  label,
  className = '',
}: {
  src?: string
  alt: string
  palette: [string, string, string]
  motif: Motif
  seed?: number
  label?: string
  className?: string
}) {
  if (src) {
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  }
  const m = seed === 1 ? motif : MOTIFS[(MOTIFS.indexOf(motif) + seed) % MOTIFS.length]
  const r = rng(seed * 97 + motif.length * 13)
  const [a, b, c] = palette
  const id = `g-${motif}-${seed}`

  return (
    <div role="img" aria-label={`${alt}（占位图）`} className={`relative h-full w-full overflow-hidden ${className}`}>
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#050833" />
            <stop offset="1" stopColor={a} />
          </linearGradient>
          <pattern id={`${id}-dots`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity="0.12" />
          </pattern>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <rect width="1600" height="1000" fill={`url(#${id}-bg)`} />

        {m === 'pixels' &&
          Array.from({ length: 16 * 10 }, (_, i) => {
            const x = i % 16
            const y = Math.floor(i / 16)
            const v = r()
            if (v < 0.55) return null
            return (
              <rect key={i} x={x * 100 + 6} y={y * 100 + 6} width="88" height="88" rx="6" fill={v > 0.9 ? c : v > 0.72 ? b : '#ffffff'} opacity={v > 0.72 ? 0.95 : 0.12} />
            )
          })}

        {m === 'orbit' && (
          <g transform="translate(980 500)">
            {[440, 340, 240, 140].map((rad, i) => (
              <circle key={rad} r={rad} fill="none" stroke={i % 2 ? b : '#ffffff'} strokeOpacity={0.35} strokeWidth="3" strokeDasharray={i % 2 ? '2 14' : undefined} />
            ))}
            <circle r="110" fill={b} />
            <circle cx={-340} cy={-120} r="44" fill={c} />
            <circle cx={230} cy={180} r="22" fill="#fff" />
          </g>
        )}

        {m === 'stripes' && (
          <g transform="rotate(-18 800 500)">
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={-400} y={i * 170 - 300} width="2600" height={i % 3 === 0 ? 90 : 34} fill={i % 3 === 0 ? c : i % 2 ? b : '#ffffff'} opacity={i % 3 === 0 ? 0.95 : 0.35} />
            ))}
          </g>
        )}

        {m === 'window' &&
          [0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${300 + i * 170} ${170 + i * 110})`}>
              <rect width="760" height="480" rx="22" fill={i === 2 ? '#e8e4ff' : '#0b1460'} stroke={b} strokeWidth="3" />
              <rect width="760" height="56" rx="22" fill={b} />
              {[0, 1, 2].map((d) => (
                <circle key={d} cx={38 + d * 32} cy="28" r="9" fill={d === 0 ? c : '#050833'} opacity="0.7" />
              ))}
              {i === 2 && (
                <>
                  <rect x="48" y="104" width="300" height="300" rx="16" fill={a} />
                  <rect x="390" y="110" width="300" height="34" rx="8" fill={a} opacity="0.85" />
                  <rect x="390" y="170" width="220" height="22" rx="6" fill={a} opacity="0.4" />
                  <rect x="390" y="210" width="260" height="22" rx="6" fill={a} opacity="0.4" />
                  <rect x="390" y="330" width="160" height="60" rx="30" fill={c === '#e8e4ff' ? '#86ddff' : c} />
                </>
              )}
            </g>
          ))}

        {m === 'blob' && (
          <g filter={`url(#${id}-blur)`}>
            <circle cx={500 + r() * 200} cy="420" r="300" fill={b} />
            <circle cx={1100} cy={560 + r() * 100} r="260" fill={c} opacity="0.85" />
            <circle cx="820" cy="260" r="180" fill="#ffffff" opacity="0.5" />
          </g>
        )}

        {m === 'type' && (
          <g fill="none" stroke={b} strokeWidth="2">
            <text x="800" y="680" textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize="520" fill={b} fillOpacity="0.9" stroke="none">
              {String(seed).padStart(2, '0')}
            </text>
            <path d="M120 860 H1480 M120 140 H1480" strokeOpacity="0.5" />
            <circle cx="1320" cy="250" r="60" fill={c} stroke="none" />
          </g>
        )}

        <rect width="1600" height="1000" fill={`url(#${id}-dots)`} />
      </svg>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 font-pixel text-[10px] tracking-wider text-white/75 backdrop-blur-sm">
        {label ?? 'PLACEHOLDER'}
      </span>
    </div>
  )
}
