import type { ElementType, ReactNode } from 'react'
import { useInView } from '@/hooks/motion'

/** Wrapper that flips data-in when visible; children use .reveal-item / .reveal-media with --d delays. */
export function Reveal({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag ref={ref} data-in={inView} className={className}>
      {children}
    </Tag>
  )
}

export const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties
