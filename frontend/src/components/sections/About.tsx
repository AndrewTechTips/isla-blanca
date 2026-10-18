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
  // The framed video rises a little faster than the text.
  const frameY = useParallax(section, 60, -60)

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

        <Reveal y={40} transition={spring(2, 0.2, 0.2)} className="mx-auto w-full max-w-[340px]">
          {/* A rounded frame in the video's own 9:16 shape, inside a thin gold outline with the
              same gap all round, so the whole piece sits centered in its column. */}
          <motion.div className="relative" style={{ y: frameY }}>
            <div className="aspect-[340/604] overflow-hidden rounded-[200px]">
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
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2.5 rounded-[210px] border border-gold"
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
