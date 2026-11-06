import { profile } from '@/data/projects'
import { scrollToId } from '@/hooks/motion'
import figmaIcon from '@/assets/cover/icon-figma.webp'
import aiIcon from '@/assets/cover/icon-ai.webp'
import aeIcon from '@/assets/cover/icon-ae.webp'
import { Reveal, delay } from './Reveal'

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-20 overflow-hidden pb-10 pt-24 sm:pt-36">
      <div aria-hidden="true" className="halftone pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="reveal-item mb-4 font-pixel text-xs tracking-[0.3em] text-lilac">03 — THE END</p>
          <div className="reveal-item overflow-hidden rounded-2xl border border-white/20 bg-ink/70 shadow-[0_40px_100px_-40px_rgb(120_110_255/0.7)] backdrop-blur-xl" style={delay(100)}>
            <div className="flex items-center justify-between border-b border-white/15 bg-lilac px-4 py-2.5 text-ink">
              <span className="font-pixel text-xs">CONTACT.EXE</span>
              <span className="flex gap-1.5" aria-hidden="true"><span className="size-3 rounded-sm bg-ink/70" /><span className="size-3 rounded-sm bg-ink/70" /><span className="size-3 rounded-sm bg-smile ring-1 ring-ink/40" /></span>
            </div>
            <div className="relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
              <div aria-hidden="true" className="mb-8 flex items-center justify-center gap-3 sm:gap-6">
                {[figmaIcon, aiIcon, aeIcon].map((icon, i) => <img key={icon} src={icon} alt="" className="sticker-float h-14 w-14 object-contain sm:h-20 sm:w-20" style={{ animationDelay: `${i * -1.4}s` }} />)}
              </div>
              <h2 id="contact-title" className="sr-only">联系方式</h2>
              <p className="text-sm text-white/65">电话</p>
              <a href="tel:17347789358" className="mt-2 block break-all text-2xl font-bold tracking-wide text-white transition-colors hover:text-cyan sm:text-3xl">17347789358</a>
              <p className="mt-6 text-sm text-white/65">邮箱</p>
              <a href="mailto:2646681325@qq.com" className="mt-2 block break-all text-xl font-bold tracking-wide text-white transition-colors hover:text-cyan sm:text-2xl">2646681325@qq.com</a>
              <a href="#top" onClick={(e) => { e.preventDefault(); scrollToId('top'); history.replaceState(null, '', '#top') }} className="mt-8 inline-flex items-center gap-3 rounded-full bg-smile px-6 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-1 hover:shadow-[0_0_24px_rgb(255_225_64/0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><span aria-hidden="true">↑</span> 返回顶部</a>
            </div>
          </div>
        </Reveal>
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 font-pixel text-[10px] text-white/60">
          <span>© 2026 {profile.nameEn} · PORTFOLIO</span>
          <span className="flex items-center gap-2"><span className="size-2 bg-smile" aria-hidden="true" /> MADE WITH PIXELS &amp; CARE</span>
        </footer>
      </div>
    </section>
  )
}
