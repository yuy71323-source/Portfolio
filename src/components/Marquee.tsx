import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/hooks/motion'

function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges" aria-hidden>
      <path d="M4 0h2v3h1v1h3v2H7v1H6v3H4V7H3V6H0V4h3V3h1z" fill="currentColor" />
    </svg>
  )
}

function Track({ children, reverse, speed }: { children: React.ReactNode; reverse?: boolean; speed: number }) {
  return (
    <div className="marquee-track flex w-max" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
      {/* Two identical halves so translating by -50% loops seamlessly */}
      <div className="flex shrink-0 items-center">{children}</div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}

/** Crossing "Portfolio" tapes bridging the cover and the About section. */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  // Scrolling speeds the tapes up and leans them slightly, then eases back
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const anims = () => Array.from(el.querySelectorAll<HTMLElement>('.marquee-track')).flatMap((t) => t.getAnimations())
    let lastY = window.scrollY
    let boost = 0
    let raf = 0
    const tick = () => {
      boost *= 0.92
      const rate = 1 + boost
      anims().forEach((a) => (a.playbackRate = rate))
      el.style.setProperty('--lean', `${Math.max(-6, Math.min(6, boost * 1.5))}deg`)
      raf = boost > 0.01 ? requestAnimationFrame(tick) : 0
    }
    const onScroll = () => {
      const y = window.scrollY
      boost = Math.min(5, boost + Math.abs(y - lastY) * 0.03)
      lastY = y
      if (!raf) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const words = Array.from({ length: 4 })

  return (
    <div ref={root} aria-hidden className="pointer-events-none relative z-10 select-none overflow-hidden bg-ink pb-16 pt-6 sm:pb-24 sm:pt-8">
      {/* Glow continuing the cover's blue light into the page */}
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_70%_at_50%_45%,rgb(120_110_255/0.28),transparent_70%)]" />
      <div className="halftone absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      {/* Back tape */}
      <div className="marquee-lean relative -mx-8 rotate-[2.5deg] border-y border-lilac/30 bg-navy/90 py-3 sm:py-4">
        <Track reverse speed={46}>
          {words.map((_, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-pixel text-sm tracking-[0.3em] text-lilac/80 sm:text-base">
              PORTFOLIO <Star className="size-2.5 text-cyan" /> 设计作品集 <Star className="size-2.5 text-smile" /> VISUAL COMMUNICATION <Star className="size-2.5 text-cyan" /> 2026
              <Star className="size-2.5 text-smile" />
            </span>
          ))}
        </Track>
      </div>

      {/* Front tape */}
      <div
        className="marquee-lean relative -mx-8 -mt-6 -rotate-[2.5deg] bg-gradient-to-r from-lilac via-[#cfc4ff] to-cyan py-2 shadow-[0_20px_60px_-20px_rgb(120_110_255/0.8)] sm:-mt-8 sm:py-3"
      >
        <Track speed={32}>
          {words.map((_, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 text-ink sm:gap-10 sm:pr-10">
              <span className="font-script text-5xl leading-[1.25] sm:text-7xl">Portfolio</span>
              <span className="rounded-md bg-ink px-2 py-1 font-pixel text-sm text-smile sm:text-base">2026</span>
              <Star className="size-4 sm:size-5" />
              <span className="text-stroke font-pixel text-3xl sm:text-5xl">PORTFOLIO</span>
              <Star className="size-4 sm:size-5" />
            </span>
          ))}
        </Track>
      </div>
    </div>
  )
}
