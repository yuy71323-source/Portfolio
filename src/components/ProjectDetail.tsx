import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from '@/data/projects'
import { prefersReducedMotion } from '@/hooks/motion'
import { ProjectImage } from './PlaceholderArt'
import { PosterCarousel } from './PosterCarousel'
import { CourseworkCarousel } from './CourseworkCarousel'
import packagingVideo from '@/assets/works/packaging-motion/packaging.mp4'
import packagingPoster from '@/assets/works/packaging-motion/frame1.png'
import uiShowcaseVideo from '@/assets/works/ui-showcase-web.mp4'
import uiCaseStudy from '@/assets/works/ui-case-study.png'
import aigcSceneVideo from '@/assets/works/aigc-scene.mp4'
import { Viewer, type ViewerItem } from './Viewer'

export function ProjectDetail({
  project,
  open,
  onClose,
  onNavigate,
}: {
  project: Project
  open: boolean
  onClose: () => void
  onNavigate: (p: Project) => void
}) {
  const [state, setState] = useState<'closed' | 'open'>('closed')
  const scroller = useRef<HTMLDivElement>(null)
  const backBtn = useRef<HTMLButtonElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const [plate, setPlate] = useState(0)
  const [viewer, setViewer] = useState<number | null>(null)
  const coverRef = useRef<HTMLButtonElement>(null)
  const openedFrom = useRef<HTMLElement | null>(null)

  const index = projects.findIndex((p) => p.id === project.id)
  const next = projects[(index + 1) % projects.length]
  const count = (project.images?.length ?? project.galleryCount) + (project.id === 'aigc' ? 1 : 0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setState(open ? 'open' : 'closed'))
    return () => cancelAnimationFrame(id)
  }, [open])

  // Reset when switching projects
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    strip.current?.scrollTo({ left: 0 })
    setPlate(0)
    setViewer(null)
    backBtn.current?.focus({ preventScroll: true })
  }, [project.id])

  useEffect(() => {
    if (!open || viewer !== null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goPlate(plate + 1)
      if (e.key === 'ArrowLeft') goPlate(plate - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  // Vertical wheel scrolls the strip horizontally until it reaches either end
  useEffect(() => {
    const el = strip.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0
      if (atStart || atEnd) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const goPlate = (i: number) => {
    const el = strip.current
    const clamped = Math.max(0, Math.min(count - 1, i))
    const target = el?.children[clamped] as HTMLElement | undefined
    if (!el || !target) return
    el.scrollTo({ left: target.offsetLeft - el.offsetLeft - (el.clientWidth - target.clientWidth) / 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  // Viewer items: cover first, then the gallery
  const items: ViewerItem[] = [
    { src: project.cover, seed: 1, label: 'COVER' },
    ...Array.from({ length: count }, (_, i) => ({ src: project.images?.[i], seed: i + 2, label: `IMG ${String(i + 1).padStart(2, '0')}` })),
  ]
  const originOf = (i: number) => (i === 0 ? coverRef.current : ((strip.current?.children[i - 1] as HTMLElement | undefined) ?? null))
  const openViewer = (i: number) => {
    openedFrom.current = originOf(i)
    setViewer(i)
  }
  // Keep the strip in sync so closing flies back to the right thumbnail
  const syncFromViewer = (i: number) => {
    const el = strip.current
    const t = i > 0 ? (el?.children[i - 1] as HTMLElement | undefined) : undefined
    if (el && t) el.scrollTo({ left: t.offsetLeft - el.offsetLeft - (el.clientWidth - t.clientWidth) / 2 })
    openedFrom.current = originOf(i)
  }

  const onStripScroll = () => {
    const el = strip.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let dist = Infinity
    Array.from(el.children).forEach((c, i) => {
      const h = c as HTMLElement
      const d = Math.abs(h.offsetLeft - el.offsetLeft + h.clientWidth / 2 - center)
      if (d < dist) {
        dist = d
        best = i
      }
    })
    setPlate(best)
  }

  return (
    <div data-state={state} role="dialog" aria-modal="true" aria-labelledby="detail-title" className="fixed inset-0 z-50">
      <div className="panel-backdrop absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />
      <div ref={scroller} className="panel-sheet absolute inset-0 overflow-y-auto overscroll-contain bg-ink sm:inset-x-4 sm:bottom-0 sm:top-4 sm:rounded-t-[28px] sm:ring-1 sm:ring-white/10">
        <div aria-hidden className="halftone pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        {/* Sticky top bar with clear back entry */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-ink/75 px-4 py-3 backdrop-blur-xl sm:px-8">
          <button
            ref={backBtn}
            type="button"
            onClick={onClose}
            className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink transition-transform hover:-translate-x-0.5"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">←</span>
            返回作品
          </button>
          <div className="flex items-center gap-4 font-pixel text-[11px] text-white/55">
            <span className="hidden sm:inline">ESC 关闭</span>
            <span>
              <span className="text-white">{String(index + 1).padStart(2, '0')}</span> / {String(projects.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <article className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
          <header className="anim-fade-up mb-8" key={project.id}>
            <p className="mb-3 font-pixel text-xs tracking-[0.25em] text-lilac">
              {project.category} · {project.year}
            </p>
            <h2 id="detail-title" className="text-4xl font-black tracking-tight sm:text-6xl">
              {project.title}
            </h2>
            <p className="mt-2 font-pixel text-sm text-white/45">{project.titleEn}</p>
          </header>

          {/* Cover in a chrome bezel, nodding to the cover's monitor */}
          <div className="rounded-[26px] bg-gradient-to-b from-chrome to-[#a9a6b6] p-2 shadow-[0_40px_100px_-40px_rgb(120_110_255/0.6)] sm:p-3">
            {project.id === 'poster' ? <PosterCarousel /> : project.id === 'coursework' ? <CourseworkCarousel /> :
            <button
              ref={coverRef}
              type="button"
              onClick={() => openViewer(0)}
              aria-label="查看完整作品"
              className={`zoomable group relative block w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-navy ${['brand-packaging', 'web-design'].includes(project.id) ? '' : 'aspect-[16/9]'}`}
            >
              {['brand-packaging', 'web-design'].includes(project.id) ? <img src={project.cover} alt={`${project.title} 完整作品`} className="block h-auto w-full" /> : <div className="h-full w-full transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.03]">
                <ProjectImage src={project.cover} alt={`${project.title} 封面`} palette={project.palette} motif={project.motif} label="COVER" />
              </div>}
              <span className="zoom-badge absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white py-2 pl-3 pr-4 text-sm font-bold text-ink shadow-xl sm:bottom-6 sm:right-6">
                <span aria-hidden className="zoom-badge-icon grid size-6 place-items-center rounded-full bg-ink font-pixel text-[11px] text-smile">⤢</span>
                查看完整作品
              </span>
            </button>
            }
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 self-start text-sm md:grid-cols-1">
              {[
                ['角色', project.role],
                ['年份', project.year],
                ['类型', project.category],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-white/10 pt-3">
                  <dt className="mb-1 font-pixel text-[10px] tracking-widest text-white/45">{k}</dt>
                  <dd className="text-white/90">{v}</dd>
                </div>
              ))}
              <div className="border-t border-white/10 pt-3">
                <dt className="mb-2 font-pixel text-[10px] tracking-widest text-white/45">工具</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.tools.map((t) => (
                    <span key={t} className="rounded-md bg-lilac/15 px-2 py-1 font-pixel text-[10px] text-lilac">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="space-y-5 text-base leading-loose text-white/75 sm:text-lg">
              <p className="text-xl font-medium leading-relaxed text-white sm:text-2xl">{project.summary}</p>
              {project.intro.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>

          {/* Horizontal plate strip with counter, like the reference's floating plates */}
          <section aria-label="更多作品图片" className="mt-20">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-pixel text-xs tracking-[0.25em] text-white/60">MORE IMAGES</h3>
              <div className="flex items-center gap-3">
                {!(['brand-packaging', 'ui-design'].includes(project.id) && plate === 0) && <button
                  type="button"
                  onClick={() => openViewer(plate + 1)}
                  className="hidden items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 font-pixel text-[11px] transition-colors hover:border-lilac hover:text-lilac sm:flex"
                >
                  ⤢ 全屏浏览
                </button>}
                <span className="font-pixel text-xs text-white/55" aria-live="polite">
                  <span className="text-white">{String(plate + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')}
                </span>
                {[
                  [-1, '上一幅', '←'],
                  [1, '下一幅', '→'],
                ].map(([step, label, icon]) => (
                  <button
                    key={label as string}
                    type="button"
                    aria-label={label as string}
                    disabled={(step === -1 && plate === 0) || (step === 1 && plate === count - 1)}
                    onClick={() => goPlate(plate + (step as number))}
                    className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div ref={strip} onScroll={onStripScroll} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
              {Array.from({ length: count }, (_, i) => (
                project.id === 'brand-packaging' && i === 0 ? (
                  <div key={i} className={`relative aspect-square w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-[opacity,transform] duration-500 sm:w-[58%] ${i === plate ? 'opacity-100' : 'scale-[0.97] opacity-55'}`}>
                    <video aria-label="玛氏宠物零食包装设计轮播" className="h-full w-full object-contain" src={packagingVideo} poster={packagingPoster} autoPlay loop muted playsInline preload="metadata" onMouseEnter={(e) => e.currentTarget.pause()} onMouseLeave={(e) => { void e.currentTarget.play().catch(() => {}) }} />
                  </div>
                ) : project.id === 'ui-design' && i === 0 ? (
                  <div key={i} className={`relative aspect-video w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-[opacity,transform] duration-500 sm:w-[58%] ${i === plate ? 'opacity-100' : 'scale-[0.97] opacity-55'}`}>
                    <video aria-label="UI 界面设计展示视频" className="h-full w-full object-contain" src={uiShowcaseVideo} controls playsInline preload="metadata" />
                  </div>
                ) : project.id === 'aigc' && i === count - 1 ? (
                  <div key={i} className={`relative aspect-video w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-[opacity,transform] duration-500 sm:w-[58%] ${i === plate ? 'opacity-100' : 'scale-[0.97] opacity-55'}`}>
                    <video aria-label="AIGC 场景展示视频" className="h-full w-full object-contain" src={aigcSceneVideo} controls playsInline preload="metadata" />
                  </div>
                ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => openViewer(i + 1)}
                  aria-label={`放大查看图片 ${i + 1}`}
                  className={`zoomable group relative aspect-[4/3] w-[82%] shrink-0 cursor-zoom-in snap-center overflow-hidden rounded-2xl ring-1 ring-white/10 transition-[opacity,transform] duration-500 sm:w-[58%] ${
                    i === plate ? 'opacity-100' : 'scale-[0.97] opacity-55'
                  }`}
                >
                  <div className="h-full w-full transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.04]">
                    <ProjectImage src={project.images?.[i]} alt={`${project.title} 图片 ${i + 1}`} palette={project.palette} motif={project.motif} seed={i + 2} label={`IMG ${String(i + 1).padStart(2, '0')}`} />
                  </div>
                  <span aria-hidden className="zoom-badge absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white font-pixel text-sm text-ink shadow-lg">
                    <span className="zoom-badge-icon">⤢</span>
                  </span>
                </button>
                )
              ))}
            </div>
          </section>

          {project.id === 'ui-design' && (
            <section aria-label="眠光 UI 设计作品集" className="mt-16 overflow-hidden rounded-2xl">
              <img src={uiCaseStudy} alt="眠光睡眠与情绪管理应用 UI 设计作品集" loading="lazy" className="block h-auto w-full" />
            </section>
          )}

          {project.id === 'web-design' && (
            <section aria-label="网页设计页面展示" className="mt-16 space-y-6">
              {project.images?.map((src, i) => (
                <img key={src} src={src} alt={`网页设计页面 ${i + 2}`} loading="lazy" className="block h-auto w-full rounded-2xl" />
              ))}
            </section>
          )}

          {/* Next project */}
          <button
            type="button"
            onClick={() => onNavigate(next)}
            className="group mt-24 flex w-full items-center justify-between gap-6 border-t border-white/10 pt-8 text-left"
          >
            <div>
              <p className="mb-2 font-pixel text-[11px] tracking-widest text-white/45">NEXT PROJECT</p>
              <p className="text-2xl font-bold transition-colors group-hover:text-lilac sm:text-4xl">{next.title}</p>
            </div>
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-xl text-ink transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          </button>
        </article>
      </div>
      {viewer !== null && (
        <Viewer
          key={project.id}
          project={project}
          items={items}
          start={viewer}
          origin={originOf}
          onIndex={syncFromViewer}
          onClose={() => {
            const back = openedFrom.current
            setViewer(null)
            back?.focus({ preventScroll: true })
          }}
        />
      )}
    </div>
  )
}
