import { useCallback, useEffect, useRef, useState } from 'react'
import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { FluidBackground } from '@/components/FluidBackground'
import { Hero } from '@/components/Hero'
import { Marquee } from '@/components/Marquee'
import { Nav } from '@/components/Nav'
import { ProjectDetail } from '@/components/ProjectDetail'
import { Works } from '@/components/Works'
import { projects, type Project } from '@/data/projects'
import { prefersReducedMotion } from '@/hooks/motion'

const workFromHash = () => {
  const m = location.hash.match(/^#\/work\/(.+)$/)
  return m ? projects.find((p) => p.id === m[1]) ?? null : null
}

export default function App() {
  const [project, setProject] = useState<Project | null>(workFromHash)
  const [open, setOpen] = useState(() => workFromHash() !== null)
  const trigger = useRef<HTMLElement | null>(null)
  const closeTimer = useRef<number>(0)
  const pushed = useRef(false)

  const show = (p: Project) => {
    window.clearTimeout(closeTimer.current)
    setProject(p)
    setOpen(true)
  }

  const hide = useCallback(() => {
    setOpen(false)
    closeTimer.current = window.setTimeout(() => setProject(null), prefersReducedMotion() ? 0 : 500)
    // Wait for `inert` to be lifted before restoring focus
    window.setTimeout(() => trigger.current?.focus({ preventScroll: true }), 30)
  }, [])

  // Sync with browser back/forward so the system back gesture also closes the panel
  useEffect(() => {
    const onPop = () => {
      const p = workFromHash()
      pushed.current = false
      if (p) show(p)
      else hide()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [hide])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  const openProject = (p: Project, el?: HTMLElement) => {
    if (el) trigger.current = el
    if (open) history.replaceState(null, '', `#/work/${p.id}`)
    else {
      history.pushState(null, '', `#/work/${p.id}`)
      pushed.current = true
    }
    show(p)
  }

  const closeProject = () => {
    if (pushed.current) {
      pushed.current = false
      history.back()
    } else {
      history.replaceState(null, '', '#works')
      hide()
    }
  }

  return (
    <>
      <a href="#works" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        跳到作品
      </a>
      <div inert={open || undefined}>
        <Nav />
      </div>
      <main inert={open || undefined}>
        <Hero />
        <Marquee />
        <div data-fluid-area className="relative isolate bg-ink">
          <div aria-hidden="true" className="pointer-events-none sticky top-0 -mb-[100vh] h-screen overflow-hidden">
            <FluidBackground />
            <div className="absolute inset-0 bg-ink/35" />
          </div>
          <About />
          <Works onOpen={openProject} />
          <Contact />
        </div>
      </main>
      {project && <ProjectDetail project={project} open={open} onClose={closeProject} onNavigate={(p) => openProject(p)} />}
    </>
  )
}
