'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

type HomeSectionProps = {
  children: ReactNode
  image: string
  className?: string
  id?: string
  tone?: 'dark' | 'soft'
}

export default function HomeSection({
  children,
  image,
  className = '',
  id,
  tone = 'dark',
}: HomeSectionProps) {
  return (
    <section id={id} className={`home-section home-section--${tone} ${className}`.trim()}>
      <div className="home-section__bg" aria-hidden="true">
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          className="home-section__bg-img"
        />
        <div className="home-section__veil" />
      </div>
      <div className="home-section__content">{children}</div>
    </section>
  )
}
