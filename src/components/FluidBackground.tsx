import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/hooks/motion'

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

// Domain-warped noise gives large, slowly folding "silk" colour fields.
// OCT is injected at compile time (fewer octaves on phones).
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uStir;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < OCT; i++) { v += a * noise(p); p = m * p; a *= 0.47; }
  return v;
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 1.2;
  float t = uTime * 0.035;

  // Pointer swirl: rotate space around the cursor, fading with distance
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0) * 1.2;
  float d = length(p - m);
  float swirl = (0.25 + uStir * 2.2) * exp(-d * d * 3.5);
  p = m + rot(swirl) * (p - m);

  p = rot(t * 0.6) * p;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 2.8 * q + vec2(1.7, 9.2) + t * 1.1), fbm(p + 2.8 * q + vec2(8.3, 2.8) - t * 0.9));
  float f = fbm(p + 2.6 * r);

  vec3 deep = vec3(0.020, 0.031, 0.200);
  vec3 navy = vec3(0.043, 0.078, 0.420);
  vec3 electric = vec3(0.170, 0.300, 1.000);
  vec3 violet = vec3(0.480, 0.300, 1.000);
  vec3 ice = vec3(0.560, 0.860, 1.000);

  vec3 col = mix(deep, navy, smoothstep(0.25, 0.55, f));
  col = mix(col, electric, smoothstep(0.55, 0.85, length(q)) * 0.8);
  col = mix(col, violet, smoothstep(0.5, 0.75, r.x) * 0.75);
  col = mix(col, deep, smoothstep(0.45, 0.2, r.y) * 0.6);
  col = mix(col, ice, smoothstep(0.62, 0.8, f * r.y * 1.8) * 0.4);

  // Soft satin sheen along the folds
  float fold = smoothstep(0.09, 0.0, abs(f - 0.52)) * 0.22 + smoothstep(0.05, 0.0, abs(r.x - 0.6)) * 0.1;
  col += vec3(0.65, 0.75, 1.0) * fold;

  // Pointer glow
  col += vec3(0.24, 0.30, 0.8) * exp(-d * d * 8.0) * (0.04 + uStir * 0.24);

  // Vignette keeps edges calm for text readability
  float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(1.1, 1.4)));
  col *= mix(0.55, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}
`

/**
 * Slow liquid-silk background. Interactive (pointer swirls the colour fields),
 * pauses off-screen, renders a single static frame for reduced motion, and
 * falls back to CSS gradients without WebGL.
 */
export function FluidBackground({ className = '' }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const fallback = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const host = cv.parentElement!
    const area = host.closest<HTMLElement>('[data-fluid-area]') ?? host.parentElement ?? host
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      cv.style.display = 'none'
      return
    }
    if (fallback.current) fallback.current.style.opacity = '0'

    const mobile = matchMedia('(max-width: 768px), (pointer: coarse)').matches
    const reduced = prefersReducedMotion()
    const scale = mobile ? 0.35 : 0.55 // render small, upscale: free soft focus + cheap
    const fpsCap = mobile ? 30 : 60

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG.replace(/OCT/g, mobile ? '3' : '4')))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      cv.style.display = 'none'
      if (fallback.current) fallback.current.style.opacity = '1'
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')
    const uStir = gl.getUniformLocation(prog, 'uStir')

    const mouse = { x: 0.65, y: 0.55, tx: 0.65, ty: 0.55 }
    let stir = 0
    const start = performance.now() - 40000 // start mid-flow, not from a blank seed
    let raf = 0
    let last = 0
    let visible = false
    let intersecting = false

    const resize = () => {
      const r = host.getBoundingClientRect()
      cv.width = Math.max(1, Math.round(r.width * scale))
      cv.height = Math.max(1, Math.round(r.height * scale))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(uRes, cv.width, cv.height)
      if (reduced) draw(40)
    }
    const draw = (time: number) => {
      gl.uniform1f(uTime, time)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uStir, stir)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0
      if (now - last < 1000 / fpsCap - 2) return
      last = now
      // Ease the pointer so the swirl follows smoothly
      mouse.x += (mouse.tx - mouse.x) * 0.09
      mouse.y += (mouse.ty - mouse.y) * 0.09
      stir *= 0.965
      draw((now - start) / 1000)
    }

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
      const y = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height))
      const movement = Math.hypot(x - mouse.tx, y - mouse.ty)
      stir = Math.min(1.4, stir + movement * 4)
      mouse.tx = x
      mouse.ty = y
    }
    const onDown = (e: PointerEvent) => {
      onMove(e)
      stir = Math.min(1.6, stir + 0.9)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduced) {
      draw(40)
      return () => ro.disconnect()
    }

    const kick = () => {
      visible = intersecting && !document.hidden
      if (visible && !raf) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      intersecting = e.isIntersecting
      kick()
    })
    io.observe(host)
    const onVis = kick
    document.addEventListener('visibilitychange', onVis)
    area.addEventListener('pointermove', onMove)
    area.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      visible = false
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Static fallback (no WebGL) */}
      <div
        ref={fallback}
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(40% 50% at 25% 35%, rgb(43 76 255 / 0.7), transparent 70%), radial-gradient(45% 55% at 75% 60%, rgb(122 77 255 / 0.6), transparent 70%), radial-gradient(25% 30% at 60% 25%, rgb(143 220 255 / 0.35), transparent 70%), #050833',
        }}
      />
      <canvas ref={canvas} className="fluid-canvas absolute inset-0 h-full w-full" />
    </div>
  )
}
