import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { photo } from '@/lib/images'
import { hero } from '@/lib/motion'

/** Dark card over a full-bleed photo, the same look as the contact form. */
export function AuthCard({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-16 md:min-h-svh md:pb-24">
      <motion.img
        {...photo('/images/gallery/gallery-01.jpg')}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={hero.photo}
      />
      <div className="absolute inset-0 -z-10 bg-black/30" />
      <div className="container-site">
        <Reveal
          onMount
          y={40}
          transition={hero.title}
          className="mx-auto max-w-[480px] space-y-6 rounded-xl bg-forest/95 px-6 py-10 text-center text-sand md:px-12"
        >
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-heading font-medium text-cream">{title}</h1>
          <p>{text}</p>
          {children}
        </Reveal>
      </div>
    </section>
  )
}
