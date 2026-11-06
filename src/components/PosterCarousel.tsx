import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from '@/hooks/motion'

const assets = import.meta.glob<string>('../assets/works/posters/*.{webp,png}', { eager: true, query: '?url', import: 'default' })
const posters = Object.entries(assets).sort(([a], [b]) => a.localeCompare(b)).map(([, url]) => url)

export function PosterCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const touch = useRef<number | null>(null)
  const direction = useRef(1)
  const reduced = useReducedMotion()
  const move = (delta: number) => setIndex(i => (i + delta + posters.length) % posters.length)

  useEffect(() => {
    if (paused || expanded || reduced || posters.length < 2) return
    const timer = window.setInterval(() => setIndex(i => {
      if (i >= posters.length - 1) direction.current = -1
      if (i <= 0) direction.current = 1
      return i + direction.current
    }), 650)
    return () => window.clearInterval(timer)
  }, [paused, expanded, reduced])
  useEffect(() => {
    if (!expanded) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [expanded])

  return <div className="relative overflow-hidden rounded-[18px] bg-[#0b1040] px-3 py-8 sm:px-8 sm:py-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false) }}>
    <div className="relative mx-auto h-[300px] max-w-3xl touch-pan-y sm:h-[460px]" onTouchStart={e => { touch.current = e.touches[0].clientX }} onTouchEnd={e => { if (touch.current !== null) { const diff = e.changedTouches[0].clientX - touch.current; if (Math.abs(diff) > 40) move(diff < 0 ? 1 : -1); touch.current = null } }}>
      {posters.map((src, i) => { const visible = i <= index; const step = 58 / Math.max(1, posters.length - 1); return <button key={src} type="button" aria-label={i === index ? `放大查看第 ${i + 1} 张海报` : `查看第 ${i + 1} 张海报`} tabIndex={visible ? 0 : -1} onClick={() => i === index ? setExpanded(true) : setIndex(i)} className="absolute top-1/2 h-[88%] w-[33%] transition-[left,opacity,transform] duration-300 ease-out motion-reduce:transition-none" style={{ zIndex: i + 1, opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', left: `${5 + Math.min(i, index) * step}%`, transform: `translateY(calc(-50% + ${(i % 3) * 4}px))` }}><img src={src} alt={`海报作品 ${i + 1}`} className="h-full w-full object-contain drop-shadow-[0_5px_7px_rgba(0,0,0,0.18)]" loading={i < 3 ? 'eager' : 'lazy'} /></button> })}
    </div>
    <div className="relative z-10 mt-4 flex items-center justify-center gap-5 text-white"><button type="button" aria-label="上一张海报" onClick={() => move(-1)} className="grid size-10 place-items-center rounded-full border border-white/30 hover:bg-white hover:text-ink">←</button><span className="font-pixel text-xs" aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(posters.length).padStart(2, '0')}</span><button type="button" aria-label="下一张海报" onClick={() => move(1)} className="grid size-10 place-items-center rounded-full border border-white/30 hover:bg-white hover:text-ink">→</button></div>
    {expanded && createPortal(<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={`海报作品 ${index + 1}`} onClick={() => setExpanded(false)}><button type="button" aria-label="关闭大图" onClick={() => setExpanded(false)} className="absolute right-5 top-5 z-10 rounded-full bg-white px-4 py-2 text-ink">关闭 ✕</button><img src={posters[index]} alt={`海报作品 ${index + 1}`} className="max-h-[90vh] max-w-full object-contain" onClick={e => e.stopPropagation()} /></div>, document.body)}
  </div>
}
