import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from '@/data/projects'
import { ProjectImage } from './PlaceholderArt'
import { PosterCarousel } from './PosterCarousel'
import { Reveal, delay } from './Reveal'
import { RollingNumber } from './RollingNumber'

export function Works({ onOpen }: { onOpen: (p: Project, trigger: HTMLElement) => void }) {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const cards = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.index))
        }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    cards.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const shown = hovered ?? current
  const total = projects.length

  return (
    <section id="works" aria-labelledby="works-title" className="relative scroll-mt-20 pb-24 pt-20 sm:pb-36 sm:pt-28">
      <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6 sm:mb-20">
          <div>
            <p className="reveal-item mb-4 font-pixel text-xs tracking-[0.3em] text-lilac">02 — SELECTED WORKS</p>
            <h2 id="works-title" className="reveal-item text-4xl font-black tracking-tight sm:text-6xl" style={delay(100)}>
              精选作品
            </h2>
          </div>
          <p className="reveal-item max-w-xs text-sm leading-relaxed text-white/60" style={delay(200)}>
            品牌、界面、动态与插画项目。点击任意作品查看完整案例。
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
          {/* Sticky index, like the reference's archive rail + counter */}
          <aside className="hidden lg:block" aria-label="作品索引">
            <div className="sticky top-28">
              <div className="flex items-baseline gap-2 font-pixel text-white">
                <span className="text-7xl leading-none">
                  <RollingNumber value={shown + 1} />
                </span>
                <span className="text-sm text-white/40">/ {String(total).padStart(2, '0')}</span>
              </div>
              <div className="mt-4 h-px w-full bg-white/10">
                <div className="h-px bg-lilac transition-[width] duration-700 ease-[var(--ease-soft)]" style={{ width: `${((shown + 1) / total) * 100}%` }} />
              </div>
              <ol className="mt-6 space-y-1">
                {projects.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(i)}
                      onBlur={() => setHovered(null)}
                      onClick={(e) => onOpen(p, e.currentTarget)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-all duration-300 ${
                        i === shown ? 'translate-x-1 bg-white/[0.06] text-white' : 'text-white/45 hover:text-white/80'
                      }`}
                    >
                      <span className="font-pixel text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                      <span className="truncate">{p.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="space-y-20 sm:space-y-28">
            {projects.map((p, i) => (
              <Reveal key={p.id} as="article">
                <div ref={(el) => void (cards.current[i] = el)} data-index={i}>
                  {p.id === 'poster' && <PosterCarousel />}
                  <button
                    type="button"
                    onClick={(e) => onOpen(p, e.currentTarget)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={`查看作品：${p.title}`}
                    className={`group block w-full text-left ${hovered !== null && hovered !== i ? 'lg:opacity-60' : ''} transition-opacity duration-500`}
                  >
                    {p.id !== 'poster' && <div className="reveal-media">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-navy shadow-[0_30px_80px_-30px_rgb(20_30_160/0.6)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-1.5 group-hover:shadow-[0_40px_90px_-30px_rgb(120_110_255/0.55)] group-focus-visible:-translate-y-1.5">
                        <div className="h-full w-full transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.035]">
                          <ProjectImage src={p.cover} alt={p.title} palette={p.palette} motif={p.motif} label={`WORK ${String(i + 1).padStart(2, '0')}`} className={['brand-packaging', 'web-design'].includes(p.id) ? 'object-top' : ''} />
                        </div>
                        <span className="absolute right-4 top-4 flex translate-y-1 items-center gap-2 rounded-full bg-white px-3.5 py-1.5 font-pixel text-[11px] text-ink opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                          OPEN <span aria-hidden>↗</span>
                        </span>
                      </div>
                    </div>}
                    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="reveal-item mb-2 flex items-center gap-3 font-pixel text-[11px] tracking-widest text-white/50" style={delay(150)}>
                          <span className="text-lilac">{String(i + 1).padStart(2, '0')}</span>
                          <span>{p.category}</span>
                          <span>·</span>
                          <span>{p.year}</span>
                        </p>
                        <h3 className="reveal-item text-2xl font-bold transition-colors group-hover:text-lilac sm:text-3xl" style={delay(250)}>
                          {p.title}
                          <span className="ml-3 align-middle font-pixel text-xs font-normal text-white/40">{p.titleEn}</span>
                        </h3>
                        <p className="reveal-item mt-3 max-w-xl text-sm leading-relaxed text-white/60" style={delay(350)}>
                          {p.summary}
                        </p>
                      </div>
                      <ul className="reveal-item flex flex-wrap gap-1.5 sm:justify-end" style={delay(400)}>
                        {p.tools.map((t) => (
                          <li key={t} className="rounded-md border border-white/15 px-2 py-1 font-pixel text-[10px] text-white/70">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
