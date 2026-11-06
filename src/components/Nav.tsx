import { useEffect, useState } from 'react'
import { profile } from '@/data/projects'
import { scrollToId } from '@/hooks/motion'

const LINKS = [
  { id: 'about', label: '关于', en: 'ABOUT' },
  { id: 'works', label: '作品', en: 'WORKS' },
]

export function Nav() {
  const [active, setActive] = useState<string>('top')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', ...LINKS.map((l) => l.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    scrollToId(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <header className="anim-fade-up fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5" style={{ animationDelay: '700ms' }}>
      <nav
        aria-label="主导航"
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-2 py-2 transition-all duration-500 sm:px-3 ${
          scrolled ? 'glass shadow-[0_10px_40px_-12px_rgb(0_0_0/0.5)]' : 'border border-transparent'
        }`}
      >
        <a href="#top" onClick={(e) => go(e, 'top')} className="flex items-center gap-2 rounded-full px-3 py-1.5">
          <span aria-hidden className="grid size-6 place-items-center rounded-md bg-smile font-pixel text-[11px] text-ink">
            :)
          </span>
          <span className="font-pixel text-xs tracking-wider text-white sm:text-sm">{profile.nameEn}</span>
        </a>
        <ul className="flex items-center gap-1">
          {LINKS.map((l) => {
            const on = active === l.id
            return (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => go(e, l.id)}
                  aria-current={on ? 'location' : undefined}
                  className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-300 sm:px-4 ${
                    on ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{l.label}</span>
                  <span className={`hidden font-pixel text-[10px] md:inline ${on ? 'text-indigo' : 'text-white/45'}`}>{l.en}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
