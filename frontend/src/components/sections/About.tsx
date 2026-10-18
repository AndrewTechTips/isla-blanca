import { motion } from 'motion/react'
import { useRef } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { useParallax } from '@/hooks/useParallax'
import { asset } from '@/lib/assets'
import { inViewOnce, spring, tween } from '@/lib/motion'
import { sketch } from '@/lib/sketch'

/** Home "More than just a destination": text block and a video in an arched frame. */
export function About() {
  const section = useRef<HTMLElement>(null)
  // The arch rises a little faster than the text, and its gold outline lags behind it.
  const archY = useParallax(section, 60, -60)
  const outlineY = useParallax(section, -20, 20)

  return (
    <section ref={section} className="relative isolate overflow-hidden section-y">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10 sketch-bg"
        style={sketch('/images/home/about-bg.jpg')}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={inViewOnce}
        transition={tween(1.3)}
      />
      <div className="container-site grid items-center gap-12 md:grid-cols-2">
        <div className="mx-auto flex max-w-[460px] flex-col items-center gap-5 text-center">
          <Eyebrow>Isla Blanca, Ibiza</Eyebrow>
          <h2 className="text-heading text-ink">
            More than just
            <br /> a destination
          </h2>
          <p>
            Isla Blanca is where quiet luxury meets the wild beauty of the island. Considered
            spaces, attentive service and an endless horizon make every stay one you carry home.
          </p>
          <img src={asset('/images/brand/signature.svg')} alt="" className="h-14 opacity-80" />
          <p className="-mt-3 text-caption text-sage-deep uppercase">Guest Experience Manager</p>
          <Reveal transition={spring(1, 0.2, 0.5)}>
            <ButtonLink to="/services" variant="sage">
              About Us
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal
          y={40}
          transition={spring(2, 0.2, 0.2)}
          className="relative mx-auto w-full max-w-[420px]"
        >
          <motion.div style={{ y: archY }}>
            <motion.div
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-full border border-gold/70"
              style={{ y: outlineY }}
            />
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full">
              <video
                className="size-full object-cover"
                src={asset('/images/home/about-video.mp4')}
                poster={asset('/images/home/about-video-poster.jpg')}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="A guest relaxing by the infinity pool"
              />
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
