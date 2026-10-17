import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'
import { hero } from '@/lib/motion'

interface PageHeroProps {
  image: string
  eyebrow?: string
  title: ReactNode
  text?: string
  /** Buttons under the text. */
  actions?: ReactNode
  /** Panel pinned to the bottom of the hero, e.g. the booking bar. */
  footer?: ReactNode
  className?: string
}

/** Full-height photo hero with the load-in sequence from the template. */
export function PageHero({
  image,
  eyebrow,
  title,
  text,
  actions,
  footer,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative isolate flex min-h-svh flex-col overflow-hidden text-white',
        className,
      )}
    >
      <motion.img
        src={image}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={hero.photo}
      />
      <div className="grain absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/45 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-black/40 to-transparent" />

      <div className="container-site flex flex-1 flex-col justify-end gap-10 pt-32 pb-8 md:pb-10">
        <div className="max-w-[640px] space-y-5">
          {eyebrow && (
            <Reveal onMount y={40} transition={hero.eyebrow}>
              <Eyebrow decoration="stars" className="text-white">
                {eyebrow}
              </Eyebrow>
            </Reveal>
          )}
          <Reveal as="h1" onMount y={30} transition={hero.title} className="text-display">
            {title}
          </Reveal>
          {text && (
            <Reveal as="p" onMount transition={hero.text} className="max-w-[420px] text-white">
              {text}
            </Reveal>
          )}
          {actions && (
            <Reveal onMount transition={hero.actions} className="pt-2">
              {actions}
            </Reveal>
          )}
        </div>
        {footer && (
          <Reveal onMount transition={hero.actions}>
            {footer}
          </Reveal>
        )}
      </div>
    </section>
  )
}
