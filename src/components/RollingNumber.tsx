/** Odometer-style digits, inspired by the reference site's rolling counters. */
export function RollingNumber({ value, digits = 2 }: { value: number; digits?: number }) {
  const chars = String(value).padStart(digits, '0').split('')
  return (
    <span className="inline-flex tabular-nums" aria-label={String(value)}>
      {chars.map((c, i) => (
        <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden leading-none">
          <span
            className="flex flex-col transition-transform duration-700 ease-[var(--ease-soft)]"
            style={{ transform: `translateY(-${Number(c)}em)` }}
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1em] leading-none">
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}
