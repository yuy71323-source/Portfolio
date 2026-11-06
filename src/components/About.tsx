import { education, experience, profile, skills, tools } from '@/data/projects'
import { Reveal, delay } from './Reveal'

const AVATAR = [
  '..XXXXXX..',
  '.XXXXXXXX.',
  'XXXXXXXXXX',
  'XXOXXXXOXX',
  'XXOXXXXOXX',
  'XXXXXXXXXX',
  'XOXXXXXXOX',
  'XXOOOOOOXX',
  '.XXXXXXXX.',
  '..XXXXXX..',
]

function PixelAvatar() {
  return (
    <svg viewBox="0 0 10 10" className="h-full w-full" shapeRendering="crispEdges" aria-hidden>
      {AVATAR.flatMap((row, y) =>
        row.split('').map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={c === 'X' ? '#ffd93b' : '#050833'} />)),
      )}
    </svg>
  )
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 overflow-hidden pb-24 pt-16 sm:pb-36 sm:pt-24">
      {/* Scrims: blend into neighbouring sections and keep text legible */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/20" />
      <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[380px_1fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="reveal-soft mb-4 font-pixel text-xs tracking-[0.3em] text-lilac">01 — ABOUT ME · 关于我</p>
          {/* Avatar in a mini monitor frame */}
          <div className="reveal-media">
            <div className="rounded-[26px] bg-gradient-to-b from-chrome to-[#a5a2b3] p-3 shadow-[0_30px_80px_-30px_rgb(120_110_255/0.6)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-gradient-to-br from-indigo to-ink">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={`${profile.name} 的头像`} className="h-full w-full object-cover object-[50%_20%] transition-transform duration-[900ms] ease-[var(--ease-soft)] hover:scale-[1.03]" />
                ) : (
                  <div role="img" aria-label="头像占位" className="halftone grid h-full w-full place-items-center">
                    <div className="w-1/2">
                      <PixelAvatar />
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 font-pixel text-[10px] text-white/75">AVATAR · 替换头像</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-2 pt-3 font-pixel text-[10px] text-ink/60">
                <span>{profile.nameEn}</span>
                <span className="flex gap-1">
                  <span className="size-2 rounded-full bg-smile" />
                  <span className="size-2 rounded-full bg-indigo" />
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <h2 id="about-title" className="reveal-soft text-4xl font-black tracking-tight [text-shadow:0_2px_30px_rgb(5_8_51/0.6)] sm:text-6xl">
              你好，我是{profile.name}
            </h2>
            <p className="reveal-soft mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75" style={delay(100)}>
              <span>{profile.title}</span>
              <span aria-hidden className="text-lilac">/</span>
              <span>{profile.location}</span>
            </p>
            <div className="reveal-soft mt-8 space-y-4 rounded-3xl bg-ink/50 p-6 text-base leading-loose text-white/90 ring-1 ring-white/10 backdrop-blur-md sm:p-8 sm:text-lg" style={delay(180)}>
              {profile.bio.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-10 grid gap-4">
            {/* Education */}
            <article className="reveal-soft rounded-2xl bg-ink/55 p-6 ring-1 ring-white/10 backdrop-blur-md sm:p-8">
              <h3 className="mb-4 font-pixel text-xs tracking-[0.25em] text-lilac">EDUCATION · 教育背景</h3>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="text-xl font-bold">{education.school}</p>
                <p className="font-pixel text-xs text-white/70">{education.period}</p>
              </div>
              <p className="mt-1 text-white/85">{education.major}</p>
              <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-loose text-white/75 sm:text-base">{education.courses}</p>
            </article>

            {/* Project practice */}
            {experience.map((e, i) => (
              <article
                key={e.title}
                className="reveal-soft group relative overflow-hidden rounded-2xl bg-ink/55 p-6 ring-1 ring-white/10 backdrop-blur-md transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:ring-lilac/50 sm:p-8"
                style={delay(90 + i * 90)}
              >
                <h3 className="mb-4 font-pixel text-xs tracking-[0.25em] text-lilac">PROJECTS · 项目实践</h3>
                <span aria-hidden className="absolute right-5 top-5 font-pixel text-4xl text-white/[0.06] transition-colors group-hover:text-lilac/20">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold">{e.title}</span>
                  <span className="text-white/40">·</span>
                  <span className="rounded-full bg-smile px-2.5 py-0.5 text-xs font-bold text-ink">{e.tag}</span>
                </p>
                <p className="text-sm leading-loose text-white/80 sm:text-base">{e.body}</p>
                {e.note && (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan/40 px-3 py-1 text-xs text-cyan">
                    <span aria-hidden className="size-1.5 bg-cyan" />
                    {e.note}
                  </p>
                )}
              </article>
            ))}
          </Reveal>

          <Reveal className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
            {skills.map((s, i) => (
              <div key={s.group} className="reveal-soft bg-ink/70 p-6 backdrop-blur-md" style={delay(i * 90)}>
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <span aria-hidden className="size-2 bg-lilac" />
                  {s.group}
                </h3>
                <ul className="flex flex-wrap gap-2 text-sm text-white/65">
                  {s.items.map((it) => (
                    <li key={it} className="rounded-full border border-white/12 px-3 py-1">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>

          {/* Software stickers echoing the cover */}
          <Reveal className="mt-12">
            <h3 className="reveal-soft mb-5 font-pixel text-xs tracking-[0.25em] text-white/55">TOOLKIT</h3>
            <ul className="flex flex-wrap gap-4">
              {tools.map((t, i) => (
                <li key={t.name} className="reveal-soft" style={delay(i * 60)}>
                  <span
                    className="grid h-16 min-w-16 place-items-center rounded-2xl border-[3px] border-white px-3 text-lg font-black shadow-[0_10px_24px_-8px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:rotate-0"
                    style={{ background: t.bg, color: t.fg, rotate: `${[-6, 4, -3, 5, -4, 3, -5, 6][i % 8]}deg` }}
                  >
                    {t.name}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
