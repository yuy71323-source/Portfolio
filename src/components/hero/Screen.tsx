import { useEffect, useRef, useState } from 'react'
import frameImg from '@/assets/cover/screen-frame.webp'
import cnImg from '@/assets/cover/screen-cn.webp'
import enImg from '@/assets/cover/screen-en.webp'
import yearImg from '@/assets/cover/screen-year.webp'
import cursorImg from '@/assets/cover/screen-cursor.webp'
import { prefersReducedMotion, scrollToId } from '@/hooks/motion'
import { SCREEN, SCREEN_LAYERS, pct } from './stage'

export type Channel = 'title' | 'hello' | 'start' | 'smile' | 'app' | 'type'

export interface ScreenState {
  channel: Channel
  nonce: number
  app?: { name: string; tagline: string; color: string }
  typed: string
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  title: 'PORTFOLIO',
  hello: 'HELLO',
  start: 'START',
  smile: 'SMILE',
  app: 'LAUNCH',
  type: 'TYPE',
}
export const CYCLE: Channel[] = ['title', 'hello', 'start', 'smile']

let noiseUrl: string | null = null
function noise() {
  if (noiseUrl) return noiseUrl
  const c = document.createElement('canvas')
  c.width = c.height = 96
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(96, 96)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = v * 0.8
    img.data[i + 1] = v * 0.85
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return (noiseUrl = c.toDataURL())
}

function useTypewriter(text: string, speed = 70, delay = 0) {
  const [n, setN] = useState(() => (prefersReducedMotion() ? text.length : 0))
  useEffect(() => {
    if (prefersReducedMotion()) return setN(text.length)
    setN(0)
    let id = 0
    const start = window.setTimeout(() => {
      id = window.setInterval(() => setN((v) => (v >= text.length ? (window.clearInterval(id), v) : v + 1)), speed)
    }, delay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(id)
    }
  }, [text, speed, delay])
  return text.slice(0, n)
}

const rel = (r: keyof typeof SCREEN_LAYERS) => pct(SCREEN_LAYERS[r], SCREEN)

function TitleChannel({ hovered }: { hovered: boolean }) {
  // Replays the type-on sequence periodically so the screen keeps "playing"
  const [loop, setLoop] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setInterval(() => setLoop((l) => l + 1), 11000)
    return () => window.clearInterval(id)
  }, [])
  const chroma = hovered ? 'scr-chroma' : 'scr-phosphor'
  return (
    <div key={loop} className="absolute inset-0">
      <img src={cnImg} alt="" draggable={false} style={rel('cn')} className={`t-cn ${chroma} ${loop ? 't-replay' : ''}`} />
      <img src={enImg} alt="" draggable={false} style={rel('en')} className={`t-en ${chroma} ${loop ? 't-replay' : ''}`} />
      <img src={yearImg} alt="" draggable={false} style={rel('year')} className={`t-year ${chroma} ${loop ? 't-replay' : ''}`} />
    </div>
  )
}

function HelloChannel() {
  const a = useTypewriter('HELLO, WORLD!')
  const b = useTypewriter('欢迎来到我的设计作品集', 110, 1100)
  return (
    <div className="flex h-full flex-col items-start justify-center gap-[3cqw] px-[12cqw]">
      <p className="scr-text font-pixel text-[7.5cqw] leading-none">
        {a}
        {a.length < 13 && <span className="scr-caret">█</span>}
      </p>
      <p className="scr-text text-[4.4cqw] font-bold tracking-[0.2em]">
        {b}
        {a.length >= 13 && <span className="scr-caret">█</span>}
      </p>
    </div>
  )
}

function StartChannel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[4cqw]">
      <p className="scr-text scr-pulse font-pixel text-[9cqw] leading-none">PRESS START</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          scrollToId('works')
        }}
        className="scr-text rounded-[1cqw] border-[0.4cqw] border-current px-[3cqw] py-[1.2cqw] font-pixel text-[3.4cqw] transition-colors hover:bg-[#a9b8ff] hover:text-[#0b1460]"
      >
        ▶ 开始浏览作品
      </button>
    </div>
  )
}

const SMILE = ['..XXXX..', '.XXXXXX.', 'XXOXXOXX', 'XXOXXOXX', 'XXXXXXXX', 'XOXXXXOX', '.XOOOOX.', '..XXXX..']
function SmileChannel() {
  return (
    <div className="flex h-full items-center justify-center gap-[5cqw]">
      <svg viewBox="0 0 8 8" className="scr-bounce w-[22cqw]" shapeRendering="crispEdges" aria-hidden>
        {SMILE.flatMap((row, y) => row.split('').map((c, x) => (c === '.' ? null : <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" fill={c === 'X' ? '#ffd93b' : '#0b1460'} />)))}
      </svg>
      <p className="scr-text font-pixel text-[5.2cqw] leading-tight">
        HAVE A<br />
        NICE DAY
        <br />
        <span className="text-[3.4cqw] opacity-70">:) 祝你今天愉快</span>
      </p>
    </div>
  )
}

function AppChannel({ app }: { app: NonNullable<ScreenState['app']> }) {
  return (
    <div className="flex h-full flex-col justify-center gap-[2.6cqw] px-[13cqw]" style={{ '--app': app.color } as React.CSSProperties}>
      <p className="scr-text font-pixel text-[3.4cqw] opacity-70">{'C:\\> RUN '}{app.name.toUpperCase().replace(/\s/g, '_')}.EXE</p>
      <p className="font-pixel text-[7cqw] leading-none text-[var(--app)] [text-shadow:0_0_2cqw_var(--app)]">{app.name}</p>
      <div className="flex h-[3.4cqw] w-full gap-[0.8cqw] rounded-[0.6cqw] border-[0.35cqw] border-[#a9b8ff]/70 p-[0.6cqw]">
        <div className="scr-load h-full bg-[var(--app)]" />
      </div>
      <p className="scr-ready scr-text text-[3.6cqw] font-bold">READY ✓ {app.tagline}</p>
    </div>
  )
}

function TypeChannel({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-[3cqw] px-[12cqw]">
      <p className="scr-text font-pixel text-[3cqw] opacity-60">KEYBOARD INPUT</p>
      <p className="scr-text break-all font-pixel text-[7cqw] leading-tight">
        &gt; {text}
        <span className="scr-caret">█</span>
      </p>
      <p className="scr-text font-pixel text-[2.6cqw] opacity-60">ENTER 清空 · BACKSPACE 删除</p>
    </div>
  )
}

export function Screen({ state, onNext }: { state: ScreenState; onNext: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [osd, setOsd] = useState(false)
  const cursor = useRef<HTMLImageElement>(null)
  const lastKey = useRef(`${state.channel}-${state.nonce}`)
  const { channel, nonce } = state

  useEffect(() => {
    const key = `${channel}-${nonce}`
    if (key === lastKey.current) return
    lastKey.current = key
    setOsd(true)
    const t2 = window.setTimeout(() => setOsd(false), 1800)
    if (prefersReducedMotion()) return () => window.clearTimeout(t2)
    setSwitching(true)
    const t = window.setTimeout(() => setSwitching(false), 340)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [channel, nonce])

  const home = rel('cursor')
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !cursor.current) return
    const r = e.currentTarget.getBoundingClientRect()
    cursor.current.style.left = `${((e.clientX - r.left) / r.width) * 100}%`
    cursor.current.style.top = `${((e.clientY - r.top) / r.height) * 100}%`
  }
  const onLeave = () => {
    setHovered(false)
    if (cursor.current) {
      cursor.current.style.left = String(home.left)
      cursor.current.style.top = String(home.top)
    }
  }

  const chIndex = Math.max(0, CYCLE.indexOf(channel))

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`复古电视屏幕，当前频道：${CHANNEL_LABEL[channel]}。点击换台`}
      onClick={onNext}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNext()
        }
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ ...pct(SCREEN), containerType: 'size' }}
      className="group cursor-none overflow-hidden rounded-[1.4%] outline-offset-4"
    >
      {/* Breathing phosphor glow */}
      <div aria-hidden className="anim-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(150_180_255/0.5),rgb(120_110_255/0.12)_55%,transparent_75%)] mix-blend-screen" />

      <div className="crt-on absolute inset-0">
        <img src={frameImg} alt="" draggable={false} className="t-frame absolute inset-0 h-full w-full" />
        <div key={`${channel}-${nonce}`} className="absolute inset-0">
          {channel === 'title' && <TitleChannel hovered={hovered} />}
          {channel === 'hello' && <HelloChannel />}
          {channel === 'start' && <StartChannel />}
          {channel === 'smile' && <SmileChannel />}
          {channel === 'app' && state.app && <AppChannel app={state.app} />}
          {channel === 'type' && <TypeChannel text={state.typed} />}
        </div>
      </div>

      {/* Scanlines + slow sweep */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/0.16)_0_1px,transparent_1px_3px)]" />
      <div aria-hidden className="anim-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-cyan/10 to-transparent" />

      {switching && <div aria-hidden className="scr-static pointer-events-none absolute inset-0" style={{ backgroundImage: `url(${noise()})` }} />}

      <p aria-hidden className={`pointer-events-none absolute left-[12%] top-[1.6%] font-pixel text-[2.6cqw] text-[#d8ffde] transition-opacity duration-500 [text-shadow:0_0_1cqw_#5dff8a] ${osd ? 'opacity-100' : 'opacity-0'}`}>
        CH {String(channel === 'app' || channel === 'type' ? 9 : chIndex + 1).padStart(2, '0')} · {CHANNEL_LABEL[channel]}
      </p>
      <p aria-hidden className="pointer-events-none absolute bottom-[5%] right-[5%] font-pixel text-[2.2cqw] text-white/0 transition-colors duration-300 group-hover:text-white/60">
        CLICK ▸ 换台
      </p>

      <img
        ref={cursor}
        src={cursorImg}
        alt=""
        draggable={false}
        style={home}
        className={`t-cursor pointer-events-none absolute transition-[left,top] duration-100 ease-out ${channel === 'title' || hovered ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
