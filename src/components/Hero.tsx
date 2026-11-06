import { useCallback, useEffect, useRef, useState } from 'react'
import plate from '@/assets/cover/cover-plate.webp'
import blurFill from '@/assets/cover/cover-blur.webp'
import { prefersReducedMotion, scrollToId } from '@/hooks/motion'
import { PixelField, type PixelFieldHandle } from './hero/PixelField'
import { CYCLE, Screen, type ScreenState } from './hero/Screen'
import { Badge, Stickers, type StickerDef } from './hero/Stickers'

const IDLE_RETURN = 12000

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const field = useRef<PixelFieldHandle>(null)
  const [screen, setScreen] = useState<ScreenState>({ channel: 'title', nonce: 0, typed: '' })
  const inView = useRef(true)

  const tune = useCallback((patch: Partial<ScreenState>) => setScreen((s) => ({ ...s, ...patch, nonce: s.nonce + 1 })), [])

  const next = () => {
    const i = CYCLE.indexOf(screen.channel)
    tune({ channel: CYCLE[(i + 1) % CYCLE.length] })
  }

  // Drift back to the title after a while
  useEffect(() => {
    if (screen.channel === 'title') return
    const t = window.setTimeout(() => tune({ channel: 'title', typed: '' }), IDLE_RETURN)
    return () => window.clearTimeout(t)
  }, [screen.channel, screen.nonce, screen.typed, tune])

  // Pointer parallax via CSS variables (no re-render)
  useEffect(() => {
    const el = section.current
    if (!el || prefersReducedMotion() || !matchMedia('(pointer: fine)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', String(((e.clientX - r.left) / r.width - 0.5) * 2))
        el.style.setProperty('--my', String(((e.clientY - r.top) / r.height - 0.5) * 2))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--mx', '0')
      el.style.setProperty('--my', '0')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Type on the real keyboard while the cover is in view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (inView.current = e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] })
    if (section.current) io.observe(section.current)
    const onKey = (e: KeyboardEvent) => {
      if (!inView.current || e.metaKey || e.ctrlKey || e.altKey) return
      if (document.querySelector('[role="dialog"]')) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable="true"]')) return
      setScreen((s) => {
        const typing = s.channel === 'type'
        if (e.key === 'Backspace' && typing) return { ...s, typed: s.typed.slice(0, -1) }
        if (e.key === 'Enter' && typing && t === document.body) return { ...s, typed: '' }
        if (e.key.length !== 1) return s
        if (e.key === ' ' && (!typing || t !== document.body)) return s
        if (t !== document.body && (e.key === ' ' || e.key === 'Enter')) return s
        const typed = (typing ? s.typed : '') + e.key.toUpperCase()
        return { ...s, channel: 'type', typed: typed.slice(-18), nonce: typing ? s.nonce : s.nonce + 1 }
      })
      if (e.key === ' ' && t === document.body && screen.channel === 'type') e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      io.disconnect()
    }
  }, [screen.channel])

  const launch = (d: StickerDef, x: number, y: number) => {
    field.current?.ripple(x, y, '#ffffff')
    tune({ channel: 'app', app: { name: d.name, tagline: d.tagline, color: d.color } })
    if (d.id === 'folder') window.setTimeout(() => scrollToId('works'), 1400)
  }

  return (
    <section ref={section} id="top" aria-label="封面" className="relative grid min-h-svh touch-pan-y place-items-center overflow-hidden bg-ink">
      {/* Blurred fill so the full cover stays visible at any aspect ratio */}
      <img src={blurFill} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-2xl" />
      <div aria-hidden className="halftone absolute inset-0 opacity-60" />

      <div
        className="relative w-[min(100vw,calc(100svh*16/9))] transition-transform duration-700 ease-out"
        style={{ transform: 'translate3d(calc(var(--mx, 0) * -6px), calc(var(--my, 0) * -4px), 0)' }}
      >
        <div ref={stage} className="anim-hero-in relative aspect-[16/9] w-full">
          <img src={plate} alt="设计作品集 Portfolio 2026 —— 复古电脑与设计软件贴纸封面" draggable={false} className="pointer-events-none h-full w-full select-none object-contain" />
          <Screen state={screen} onNext={next} />
          <Badge cx={1260} cy={162} r={25} label="笑脸贴纸：换到笑脸频道" motion="spin" onActivate={() => tune({ channel: 'smile' })} />
          <Badge cx={1494} cy={398} r={31} label="像素外星人贴纸：发射像素波" motion="wiggle" onActivate={() => {
            const r = stage.current?.getBoundingClientRect()
            if (r) field.current?.ripple(r.left + (1494 / 1920) * r.width, r.top + (398 / 1080) * r.height, '#b9a8ff')
          }} />
          <Badge cx={473} cy={944} r={33} label="键盘上的笑脸：打个招呼" motion="spin" onActivate={() => tune({ channel: 'hello' })} />
          <Stickers onActivate={launch} />
        </div>
      </div>

      <PixelField ref={field} stage={stage} />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />

      <div className="anim-fade-up absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 sm:bottom-7" style={{ animationDelay: '1400ms' }}>
        <p className="glass absolute bottom-1 left-6 hidden items-center gap-3 rounded-full px-4 py-1.5 text-xs text-white/80 lg:flex">
          <span>拖拽贴纸</span>
          <span aria-hidden className="size-1 bg-white/40" />
          <span>点击屏幕换台</span>
          <span aria-hidden className="size-1 bg-white/40" />
          <span>敲键盘打字</span>
        </p>
        <p className="glass flex items-center gap-3 rounded-full px-4 py-1.5 text-xs text-white/80 lg:hidden">
          <span>点按贴纸</span>
          <span aria-hidden className="size-1 bg-white/40" />
          <span>点屏幕换台</span>
        </p>
        <button type="button" onClick={() => scrollToId('about')} className="flex flex-col items-center gap-1.5 rounded-full px-4 py-1 text-white/75 transition-colors hover:text-white">
          <span className="font-pixel text-[10px] tracking-[0.3em]">SCROLL</span>
          <span className="anim-bob grid h-8 w-5 place-items-start justify-center rounded-full border border-white/40 pt-1.5">
            <span className="block size-1.5 bg-white" />
          </span>
          <span className="sr-only">向下滚动了解我</span>
        </button>
      </div>
    </section>
  )
}
