import { useRef, useState } from 'react'
import figma from '@/assets/cover/icon-figma.webp'
import ps from '@/assets/cover/icon-ps.webp'
import ai from '@/assets/cover/icon-ai.webp'
import procreate from '@/assets/cover/icon-procreate.webp'
import ae from '@/assets/cover/icon-ae.webp'
import canva from '@/assets/cover/icon-canva.webp'
import folder from '@/assets/cover/icon-folder.webp'
import plate from '@/assets/cover/cover-plate.webp'
import { prefersReducedMotion } from '@/hooks/motion'
import { STAGE_H, STAGE_W, pct, type Rect } from './stage'

export interface StickerDef {
  id: string
  src: string
  rect: Rect
  name: string
  tagline: string
  color: string
  depth: number
  float: number
  pop: 'spin' | 'jelly' | 'flip'
}

export const STICKERS: StickerDef[] = [
  { id: 'figma', src: figma, rect: [199, 167, 186, 186], name: 'Figma', tagline: '界面与原型', color: '#a259ff', depth: 16, float: 6.2, pop: 'jelly' },
  { id: 'ps', src: ps, rect: [305, 10, 167, 204], name: 'Photoshop', tagline: '修图与合成', color: '#31a8ff', depth: 10, float: 7.4, pop: 'jelly' },
  { id: 'ai', src: ai, rect: [49, 397, 220, 201], name: 'Illustrator', tagline: '矢量与插画', color: '#ff9a00', depth: 24, float: 5.6, pop: 'spin' },
  { id: 'procreate', src: procreate, rect: [242, 632, 150, 160], name: 'Procreate', tagline: '手绘插画', color: '#ff7ac8', depth: 20, float: 6.8, pop: 'flip' },
  { id: 'ae', src: ae, rect: [1615, 65, 239, 269], name: 'After Effects', tagline: '动态设计', color: '#9999ff', depth: 22, float: 6, pop: 'spin' },
  { id: 'canva', src: canva, rect: [1583, 455, 150, 139], name: 'Canva', tagline: '快速排版', color: '#00c4cc', depth: 14, float: 7, pop: 'jelly' },
  { id: 'folder', src: folder, rect: [1689, 670, 164, 150], name: 'Portfolio', tagline: '打开作品集 →', color: '#ffd93b', depth: 18, float: 6.5, pop: 'flip' },
]

const POPS: Record<StickerDef['pop'], Keyframe[]> = {
  jelly: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.25, 0.8)' },
    { transform: 'scale(0.88, 1.18)' },
    { transform: 'scale(1.06, 0.95)' },
    { transform: 'scale(1)' },
  ],
  spin: [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(200deg) scale(1.2)' }, { transform: 'rotate(360deg) scale(1)' }],
  flip: [{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(180deg) scale(1.15)' }, { transform: 'perspective(400px) rotateY(360deg)' }],
}

function burst(x: number, y: number, color: string) {
  if (prefersReducedMotion()) return
  const palette = [color, '#ffffff', '#ffd93b', '#86ddff']
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('span')
    const size = 5 + Math.random() * 7
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: palette[i % palette.length],
      pointerEvents: 'none',
      zIndex: '45',
      boxShadow: '0 0 8px rgb(255 255 255 / 0.6)',
    })
    document.body.appendChild(el)
    const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4
    const d = 50 + Math.random() * 70
    el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 20}px)) scale(0.3) rotate(${Math.random() * 180}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' },
    ).onfinish = () => el.remove()
  }
}

export function animatePop(el: HTMLElement | null, kind: StickerDef['pop']) {
  if (!el || prefersReducedMotion()) return
  el.animate(POPS[kind], { duration: kind === 'jelly' ? 650 : 800, easing: 'cubic-bezier(.3,.7,.3,1)' })
}

function Sticker({ def, onActivate }: { def: StickerDef; onActivate: (d: StickerDef, x: number, y: number) => void }) {
  const btn = useRef<HTMLButtonElement>(null)
  const popEl = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; sx: number; sy: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [talk, setTalk] = useState(false)
  const talkTimer = useRef(0)

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    d.moved = true
    const el = e.currentTarget
    el.style.transition = 'none'
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-25, Math.min(25, dx * 0.08))}deg) scale(1.08)`
  }
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    suppressClick.current = true
    const el = e.currentTarget
    // Spring back home with a little overshoot
    el.style.transition = 'transform 0.9s cubic-bezier(.34,1.56,.64,1)'
    el.style.transform = ''
  }
  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    animatePop(popEl.current, def.pop)
    const r = btn.current!.getBoundingClientRect()
    burst(r.left + r.width / 2, r.top + r.height / 2, def.color)
    onActivate(def, r.left + r.width / 2, r.top + r.height / 2)
    setTalk(true)
    window.clearTimeout(talkTimer.current)
    talkTimer.current = window.setTimeout(() => setTalk(false), 1800)
  }

  const node = (
    <div style={pct(def.rect)} className="pointer-events-none">
      <div
        className="h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(calc(var(--mx, 0) * ${def.depth}px), calc(var(--my, 0) * ${def.depth * 0.6}px), 0)` }}
      >
        <button
          ref={btn}
          type="button"
          aria-label={`${def.name}：${def.tagline}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClick={onClick}
          className="sticker group pointer-events-auto relative block h-full w-full cursor-grab touch-none select-none rounded-[30%] active:cursor-grabbing"
          style={{ '--glow': def.color } as React.CSSProperties}
        >
          <div className="sticker-float h-full w-full" style={{ animationDuration: `${def.float}s`, animationDelay: `${-def.depth / 5}s` }}>
            <div ref={popEl} className="h-full w-full">
              <img src={def.src} alt="" draggable={false} className="sticker-img h-full w-full" />
            </div>
          </div>
          <span
            className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[clamp(10px,0.9vw,13px)] font-medium text-ink shadow-lg transition-all duration-300 ${
              talk ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
            }`}
          >
            <span className="mr-1.5 font-pixel" style={{ color: def.color === '#ffd93b' ? '#b58900' : def.color }}>
              {def.name}
            </span>
            {def.tagline}
          </span>
        </button>
      </div>
    </div>
  )

  return node
}

export function Stickers({ onActivate }: { onActivate: (d: StickerDef, x: number, y: number) => void }) {
  return (
    <>
      {STICKERS.map((d) => (
        <Sticker key={d.id} def={d} onActivate={onActivate} />
      ))}
    </>
  )
}

/** Small round stickers printed on the monitor, cropped from the plate so they can spin in place. */
export function Badge({
  cx,
  cy,
  r,
  label,
  motion,
  onActivate,
}: {
  cx: number
  cy: number
  r: number
  label: string
  motion: 'spin' | 'wiggle'
  onActivate: () => void
}) {
  const el = useRef<HTMLButtonElement>(null)
  const d = r * 2
  return (
    <button
      ref={el}
      type="button"
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => {
        if (!prefersReducedMotion()) {
          el.current?.animate(
            motion === 'spin'
              ? [{ transform: 'rotate(0)' }, { transform: 'rotate(380deg) scale(1.15)' }, { transform: 'rotate(360deg)' }]
              : [{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg) scale(1.1)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }],
            { duration: 750, easing: 'cubic-bezier(.3,.7,.3,1)' },
          )
        }
        onActivate()
      }}
      className={`badge rounded-full ${motion === 'spin' ? 'hover:rotate-[24deg]' : 'hover:scale-110'} transition-transform duration-500 ease-[var(--ease-soft)]`}
      style={{
        ...pct([cx - r, cy - r, d, d]),
        backgroundImage: `url(${plate})`,
        backgroundSize: `${(STAGE_W / d) * 100}% ${(STAGE_H / d) * 100}%`,
        backgroundPosition: `${((cx - r) / (STAGE_W - d)) * 100}% ${((cy - r) / (STAGE_H - d)) * 100}%`,
      }}
    />
  )
}
