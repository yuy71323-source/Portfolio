import { useEffect, useState, useRef } from 'react'
import './CourseworkCarousel.css'

const images = Object.entries(import.meta.glob<string>('../assets/works/coursework/*.png', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, url]) => url)

export function CourseworkCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const touch = useRef<number | null>(null)
  const count = images.length
  const move = (n: number) => setCurrent(i => (i + n + count) % count)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (paused || reduced || count < 2) return
    const timer = window.setInterval(() => move(1), 2600)
    return () => window.clearInterval(timer)
  }, [paused, reduced, count])

  if (!count) return null
  const at = (offset: number) => (current + offset + count) % count
  return (
    <section className="coursework-carousel" aria-label="二十四节气作品轮播" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false) }} onTouchStart={e => { touch.current = e.touches[0].clientX }} onTouchEnd={e => { if (touch.current !== null) { const delta = e.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1); touch.current = null } }}>
      <div className="coursework-thumbs coursework-thumbs-left">
        {[-3, -2, -1].map(n => <button key={n} onClick={() => move(n)} aria-label={`查看第 ${at(n) + 1} 张作品`}><img src={images[at(n)]} alt="" /></button>)}
      </div>
      <div className="coursework-stage" aria-live="off">
        <img className="coursework-layer coursework-layer-back" src={images[at(2)]} alt="" />
        <img className="coursework-layer coursework-layer-mid" src={images[at(1)]} alt="" />
        {images.map((src, i) => <img key={src} className={`coursework-main ${i === current ? 'is-active' : ''}`} src={src} alt={i === current ? `二十四节气作品，第 ${i + 1} 张，共 ${count} 张` : ''} aria-hidden={i !== current} />)}
      </div>
      <div className="coursework-thumbs coursework-thumbs-right">
        {[1, 2, 3].map(n => <button key={n} onClick={() => move(n)} aria-label={`查看第 ${at(n) + 1} 张作品`}><img src={images[at(n)]} alt="" /></button>)}
      </div>
      <div className="coursework-controls">
        <button onClick={() => move(-1)} aria-label="上一张">←</button>
        <span>{String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        <button onClick={() => move(1)} aria-label="下一张">→</button>
      </div>
    </section>
  )
}
