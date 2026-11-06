import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { prefersReducedMotion } from '@/hooks/motion'
import { MONITOR_POLY, STAGE_H, STAGE_W } from './stage'

export interface PixelFieldHandle {
  /** Emit a ripple at client coordinates. */
  ripple: (clientX: number, clientY: number, color?: string) => void
}

const COLORS = ['#b9a8ff', '#86ddff', '#ffffff', '#ffd93b']

/**
 * Interactive pixel grid over the cover background: cells light up around the
 * pointer, clicks send out pixel ripples, and a few cells twinkle when idle.
 */
export const PixelField = forwardRef<PixelFieldHandle, { stage: React.RefObject<HTMLDivElement | null> }>(function PixelField({ stage }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const api = useRef<PixelFieldHandle>({ ripple: () => {} })
  useImperativeHandle(ref, () => ({ ripple: (x, y, c) => api.current.ripple(x, y, c) }), [])

  useEffect(() => {
    const cv = canvas.current
    if (!cv || prefersReducedMotion()) return
    const ctx = cv.getContext('2d')!
    const host = cv.parentElement!
    let cell = 16
    let cols = 0
    let rows = 0
    let energy = new Float32Array(0)
    let hue = new Uint8Array(0)
    let dpr = 1
    let raf = 0
    let visible = true
    let pointer: { x: number; y: number } | null = null
    let last: { x: number; y: number } | null = null
    const ripples: { x: number; y: number; r: number; max: number; c: number }[] = []

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = width * dpr
      cv.height = height * dpr
      cell = Math.max(10, Math.round(width / 110))
      cols = Math.ceil(width / cell)
      rows = Math.ceil(height / cell)
      energy = new Float32Array(cols * rows)
      hue = new Uint8Array(cols * rows)
      kick()
    }

    const excite = (x: number, y: number, radius: number, amount: number, c?: number) => {
      const r = Math.ceil(radius / cell)
      const cx = Math.floor(x / cell)
      const cy = Math.floor(y / cell)
      for (let j = cy - r; j <= cy + r; j++) {
        if (j < 0 || j >= rows) continue
        for (let i = cx - r; i <= cx + r; i++) {
          if (i < 0 || i >= cols) continue
          const d = Math.hypot((i + 0.5) * cell - x, (j + 0.5) * cell - y) / radius
          if (d > 1) continue
          const k = j * cols + i
          const v = amount * (1 - d) ** 1.5
          if (v > energy[k]) {
            energy[k] = Math.min(1, v)
            hue[k] = c ?? ((i + j) % 7 === 0 ? 3 : (i * 3 + j) % 3)
          }
        }
      }
    }

    const local = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect()
      return { x: clientX - r.left, y: clientY - r.top }
    }

    api.current.ripple = (clientX, clientY, color) => {
      const p = local(clientX, clientY)
      const c = color ? Math.max(0, COLORS.indexOf(color)) : Math.floor(Math.random() * 3)
      ripples.push({ ...p, r: 0, max: Math.max(host.clientWidth, host.clientHeight) * 0.45, c })
      kick()
    }

    const onMove = (e: PointerEvent) => {
      pointer = local(e.clientX, e.clientY)
      kick()
    }
    const onLeave = () => {
      pointer = null
      last = null
    }
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, [role="button"], a')) return
      api.current.ripple(e.clientX, e.clientY)
    }

    const monitorPath = () => {
      const s = stage.current?.getBoundingClientRect()
      const h = host.getBoundingClientRect()
      if (!s) return null
      const path = new Path2D()
      MONITOR_POLY.forEach(([x, y], i) => {
        const px = s.left - h.left + (x / STAGE_W) * s.width
        const py = s.top - h.top + (y / STAGE_H) * s.height
        if (i) path.lineTo(px, py)
        else path.moveTo(px, py)
      })
      path.closePath()
      return path
    }

    let idle = 0
    const frame = () => {
      raf = 0
      if (!visible) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cv.width, cv.height)

      if (pointer) {
        // Interpolate along the movement so fast swipes leave a continuous trail
        const from = last ?? pointer
        const steps = Math.max(1, Math.ceil(Math.hypot(pointer.x - from.x, pointer.y - from.y) / (cell * 0.8)))
        for (let s = 1; s <= steps; s++) excite(from.x + ((pointer.x - from.x) * s) / steps, from.y + ((pointer.y - from.y) * s) / steps, cell * 4.5, 0.9)
        last = { ...pointer }
      }

      for (let n = ripples.length - 1; n >= 0; n--) {
        const rp = ripples[n]
        rp.r += cell * 1.1
        const fade = 1 - rp.r / rp.max
        if (fade <= 0) {
          ripples.splice(n, 1)
          continue
        }
        const segs = Math.ceil((rp.r * Math.PI * 2) / cell)
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2
          excite(rp.x + Math.cos(a) * rp.r, rp.y + Math.sin(a) * rp.r, cell * 1.2, 0.85 * fade, rp.c)
        }
      }

      // Ambient twinkles
      if (++idle % 6 === 0) {
        const k = Math.floor(Math.random() * energy.length)
        if (energy[k] < 0.3) {
          energy[k] = 0.5 + Math.random() * 0.3
          hue[k] = Math.floor(Math.random() * 4)
        }
      }

      let active = 0
      for (let k = 0; k < energy.length; k++) {
        const e = energy[k]
        if (e < 0.02) {
          energy[k] = 0
          continue
        }
        active++
        const i = k % cols
        const j = (k / cols) | 0
        const size = cell * (0.25 + 0.55 * Math.sqrt(e))
        ctx.globalAlpha = Math.min(1, e * 0.9)
        ctx.fillStyle = COLORS[hue[k]]
        ctx.fillRect(i * cell + (cell - size) / 2, j * cell + (cell - size) / 2, size, size)
        energy[k] = e * 0.93
      }
      ctx.globalAlpha = 1

      // Keep pixels on the backdrop only: cut out the monitor and the (moving) stickers
      ctx.globalCompositeOperation = 'destination-out'
      const mp = monitorPath()
      if (mp) ctx.fill(mp)
      const h = host.getBoundingClientRect()
      host.querySelectorAll('.sticker-img').forEach((img) => {
        const r = img.getBoundingClientRect()
        ctx.beginPath()
        ctx.ellipse(r.left - h.left + r.width / 2, r.top - h.top + r.height / 2, r.width * 0.48, r.height * 0.48, 0, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      // Twinkles keep a slow loop alive; everything else runs only while active
      if (active || pointer || ripples.length) kick()
      else window.setTimeout(kick, 120)
    }
    function kick() {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      kick()
    })
    io.observe(host)
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    resize()
    return () => {
      cancelAnimationFrame(raf)
      visible = false
      io.disconnect()
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [stage])

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen" />
})
