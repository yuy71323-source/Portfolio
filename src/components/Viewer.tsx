import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Project } from '@/data/projects'
import { prefersReducedMotion } from '@/hooks/motion'
import { ProjectImage } from './PlaceholderArt'
import { RollingNumber } from './RollingNumber'

export interface ViewerItem {
  src?: string
  seed: number
  label: string
}

const COLS = 8
const ROWS = 6
const TILE_COLORS = ['#b9a8ff', '#86ddff', '#0b1460', '#ffd93b', '#ffffff', '#2c3cb0']
const SWAP_AT = 440
const MIN = 1
const MAX = 4
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Pixel tiles that cover then uncover the frame; delay follows the travel direction. */
function Tiles({ mode, dir }: { mode: 'swap' | 'open'; dir: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const c = i % COLS
        const r = Math.floor(i / COLS)
        const d =
          mode === 'open'
            ? Math.hypot(c - (COLS - 1) / 2, r - (ROWS - 1) / 2) * 45 + 260
            : (dir > 0 ? c : COLS - 1 - c) * 20 + ((r * 7 + c * 3) % 4) * 10
        return (
          <span
            key={i}
            className={mode === 'open' ? 'vtile-out' : 'vtile'}
            style={{ background: TILE_COLORS[(r * 3 + c * 5) % TILE_COLORS.length], animationDelay: `${d}ms` }}
          />
        )
      })}
    </div>
  )
}

export function Viewer({
  project,
  items,
  start,
  origin,
  onIndex,
  onClose,
}: {
  project: Project
  items: ViewerItem[]
  start: number
  origin: (i: number) => HTMLElement | null
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const [shown, setShown] = useState(start)
  const [target, setTarget] = useState(start)
  const [tiles, setTiles] = useState<{ key: number; dir: number; mode: 'swap' | 'open' }>({ key: 0, dir: 1, mode: 'open' })
  const [view, setView] = useState({ s: 1, x: 0, y: 0 })
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [closing, setClosing] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const busy = useRef(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ sx: number; sy: number; vx: number; vy: number; dist?: number; s0?: number }>({ sx: 0, sy: 0, vx: 0, vy: 0 })
  const reduced = prefersReducedMotion()
  const item = items[shown]

  // Shared-element open: fly the frame out of the clicked thumbnail
  useLayoutEffect(() => {
    closeBtn.current?.focus({ preventScroll: true })
    const from = origin(start)?.getBoundingClientRect()
    const to = frame.current?.getBoundingClientRect()
    if (reduced || !from || !to || !frame.current) return
    frame.current.animate(
      [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, borderRadius: '16px' },
        { transform: 'none', borderRadius: '22px' },
      ],
      { duration: 620, easing: 'cubic-bezier(.2,.9,.25,1.08)', fill: 'backwards' },
    )
  }, [])

  const resetView = () => setView({ s: 1, x: 0, y: 0 })

  const go = (n: number) => {
    if (busy.current || closing) return
    const next = (n + items.length) % items.length
    if (next === target) return
    const dir = n > target ? 1 : -1
    setTarget(next)
    onIndex(next)
    if (reduced) {
      setShown(next)
      resetView()
      return
    }
    busy.current = true
    setTiles((t) => ({ key: t.key + 1, dir, mode: 'swap' }))
    window.setTimeout(() => {
      setShown(next)
      resetView()
    }, SWAP_AT)
    window.setTimeout(() => (busy.current = false), SWAP_AT + 200)
  }

  const close = () => {
    if (closing) return
    setClosing(true)
    const el = frame.current
    const to = origin(target)?.getBoundingClientRect()
    const from = el?.getBoundingClientRect()
    const onScreen = to && to.bottom > 0 && to.top < innerHeight && to.width > 0
    if (reduced || !el || !from) return onClose()
    const anim = el.animate(
      onScreen
        ? [{ transform: el.style.transform || 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`, opacity: 0.6 }]
        : [{ transform: 'none' }, { transform: 'translateY(40px) scale(0.85)', opacity: 0 }],
      { duration: 420, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' },
    )
    anim.onfinish = onClose
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      } else if (e.key === 'ArrowRight') go(target + 1)
      else if (e.key === 'ArrowLeft') go(target - 1)
      else if (e.key === '+' || e.key === '=') zoomBy(1.4)
      else if (e.key === '-') zoomBy(1 / 1.4)
      else if (e.key === '0') resetView()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const bounds = (s: number, x: number, y: number) => {
    const r = frame.current?.getBoundingClientRect()
    if (!r) return { s, x, y }
    const mx = ((s - 1) * r.width) / 2
    const my = ((s - 1) * r.height) / 2
    return { s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) }
  }

  // Zoom keeping the point under (px, py) fixed; coordinates relative to frame centre
  const zoomAt = (ns: number, px = 0, py = 0) =>
    setView((v) => {
      const s = clamp(ns, MIN, MAX)
      const k = s / v.s
      return bounds(s, px - (px - v.x) * k, py - (py - v.y) * k)
    })
  const zoomBy = (f: number) => setView((v) => bounds(clamp(v.s * f, MIN, MAX), v.x * f, v.y * f))

  const rel = (cx: number, cy: number) => {
    const r = frame.current!.getBoundingClientRect()
    return [cx - r.left - r.width / 2, cy - r.top - r.height / 2]
  }

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const [px, py] = rel(e.clientX, e.clientY)
      setView((v) => {
        const s = clamp(v.s * Math.exp(-e.deltaY * 0.0018), MIN, MAX)
        const k = s / v.s
        return bounds(s, px - (px - v.x) * k, py - (py - v.y) * k)
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    if (pts.length === 2) {
      gesture.current.dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      gesture.current.s0 = view.s
    } else {
      gesture.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }
    }
    setDrag((d) => ({ ...d, active: true }))
  }
  const onMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    const g = gesture.current
    if (pts.length === 2 && g.dist && g.s0) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const [px, py] = rel((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2)
      zoomAt(g.s0 * (d / g.dist), px, py)
      return
    }
    const dx = e.clientX - g.sx
    const dy = e.clientY - g.sy
    if (view.s > 1.01) setView((v) => bounds(v.s, g.vx + dx, g.vy + dy))
    else if (Math.abs(dx) > Math.abs(dy)) setDrag({ x: dx, y: 0, active: true })
    else setDrag({ x: 0, y: Math.max(0, dy), active: true })
  }
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size) return
    const { x, y } = drag
    setDrag({ x: 0, y: 0, active: false })
    if (view.s <= 1.01) {
      if (x < -80) go(target + 1)
      else if (x > 80) go(target - 1)
      else if (y > 120) close()
    }
  }
  const onDouble = (e: React.MouseEvent) => {
    const [px, py] = rel(e.clientX, e.clientY)
    if (view.s > 1.01) resetView()
    else zoomAt(2.5, px, py)
  }

  const pull = Math.min(1, drag.y / 360)
  const zoomed = view.s > 1.01

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${project.title} 完整作品查看器`} data-closing={closing} className="viewer fixed inset-0 z-[60] flex flex-col text-white">
      <div className="viewer-backdrop halftone absolute inset-0 bg-ink/95 backdrop-blur-xl" style={{ opacity: 1 - pull * 0.7 }} onClick={close} />

      {/* Top bar */}
      <header className="viewer-chrome relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-pixel text-[10px] tracking-[0.25em] text-lilac">FULL VIEW</p>
          <p className="truncate text-sm font-bold sm:text-base">{project.title}</p>
        </div>
        <div className="flex items-baseline gap-1.5 font-pixel text-white" aria-live="polite">
          <span className="text-2xl leading-none sm:text-3xl">
            <RollingNumber value={target + 1} />
          </span>
          <span className="text-xs text-white/45">/ {String(items.length).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="glass hidden items-center rounded-full sm:flex">
            <button type="button" aria-label="缩小" onClick={() => zoomBy(1 / 1.4)} disabled={!zoomed} className="grid size-9 place-items-center rounded-full text-lg transition-colors hover:bg-white/10 disabled:opacity-30">
              −
            </button>
            <button type="button" aria-label="重置缩放" onClick={resetView} className="w-12 font-pixel text-[10px] text-white/75">
              {Math.round(view.s * 100)}%
            </button>
            <button type="button" aria-label="放大" onClick={() => zoomBy(1.4)} disabled={view.s >= MAX} className="grid size-9 place-items-center rounded-full text-lg transition-colors hover:bg-white/10 disabled:opacity-30">
              +
            </button>
          </div>
          <button ref={closeBtn} type="button" onClick={close} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink transition-transform hover:scale-105">
            <span aria-hidden>✕</span> 关闭
          </button>
        </div>
      </header>

      {/* Stage */}
      <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16" onClick={(e) => e.target === e.currentTarget && close()}>
        <button type="button" aria-label="上一张" onClick={() => go(target - 1)} className="viewer-chrome group absolute left-3 z-10 hidden size-12 place-items-center rounded-full border border-white/20 bg-ink/40 text-xl backdrop-blur transition-all hover:-translate-x-0.5 hover:bg-white hover:text-ink sm:grid">
          ←
        </button>
        <div
          ref={frame}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={onDouble}
          className={`relative aspect-[4/3] w-[min(100%,calc((100svh-210px)*4/3))] touch-none select-none overflow-hidden rounded-[22px] bg-navy shadow-[0_40px_120px_-30px_rgb(120_110_255/0.7)] ring-1 ring-white/15 ${zoomed ? (drag.active ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.02}deg) scale(${1 - pull * 0.25})`,
            transition: drag.active ? 'none' : 'transform .5s cubic-bezier(.2,.9,.3,1.2)',
          }}
        >
          <div
            className="h-full w-full"
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
              transition: drag.active ? 'none' : 'transform .45s cubic-bezier(.2,.9,.3,1.1)',
            }}
          >
            <ProjectImage
              src={item.src}
              alt={`${project.title} ${item.label}`}
              palette={project.palette}
              motif={project.motif}
              seed={item.seed}
              label={item.label}
              className={item.src ? '!object-contain' : ''}
            />
          </div>
          {!reduced && <Tiles key={tiles.key} mode={tiles.mode} dir={tiles.dir} />}
          <div aria-hidden className="viewer-scan pointer-events-none absolute inset-0" />
        </div>
        <button type="button" aria-label="下一张" onClick={() => go(target + 1)} className="viewer-chrome group absolute right-3 z-10 hidden size-12 place-items-center rounded-full border border-white/20 bg-ink/40 text-xl backdrop-blur transition-all hover:translate-x-0.5 hover:bg-white hover:text-ink sm:grid">
          →
        </button>
      </div>

      {/* Filmstrip */}
      <footer className="viewer-chrome relative z-10 flex flex-col items-center gap-3 px-4 pb-4 pt-3">
        <ol className="no-scrollbar flex max-w-full gap-2 overflow-x-auto px-1 py-1.5">
          {items.map((it, i) => (
            <li key={i}>
              <button
                type="button"
                aria-label={`第 ${i + 1} 张`}
                aria-current={i === target}
                onClick={() => go(i)}
                className={`block h-11 w-14 overflow-hidden rounded-lg ring-2 transition-all duration-300 sm:h-12 sm:w-16 ${
                  i === target ? '-translate-y-1 scale-110 ring-lilac' : 'opacity-50 ring-transparent hover:-translate-y-0.5 hover:opacity-90'
                }`}
              >
                <ProjectImage src={it.src} alt="" palette={project.palette} motif={project.motif} seed={it.seed} label="" className="[&>span]:hidden" />
              </button>
            </li>
          ))}
        </ol>
        <p className="hidden font-pixel text-[10px] tracking-wider text-white/45 sm:block">滚轮缩放 · 双击放大 · 拖动平移 · ← → 切换 · ESC 关闭</p>
        <p className="font-pixel text-[10px] tracking-wider text-white/45 sm:hidden">左右滑动切换 · 双指缩放 · 下滑关闭</p>
      </footer>
    </div>,
    document.body,
  )
}
