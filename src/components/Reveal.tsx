'use client'

import { ReactNode, useEffect, useRef, useState, type CSSProperties } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delayMs?: number
}

/** Scroll-reveal via IntersectionObserver (no window scroll listeners). */
export default function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`taste-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delayMs ? ({ ['--taste-delay' as string]: `${delayMs}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
