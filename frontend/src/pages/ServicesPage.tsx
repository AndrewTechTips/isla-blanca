import { motion } from 'motion/react'

import { Reveal } from '@/components/motion/Reveal'
import { Faq } from '@/components/sections/Faq'
import { PageHero } from '@/components/sections/PageHero'
import { Reviews } from '@/components/sections/Reviews'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MaskIcon } from '@/components/ui/MaskIcon'
import { experiences } from '@/data/content'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/cn'
import { photo } from '@/lib/images'
import { inViewOnce, spring } from '@/lib/motion'
import { sketch } from '@/lib/sketch'

function Intro() {
  return (
    <section className="sketch-bg py-16 lg:py-24" style={sketch('/images/home/about-bg.jpg')}>
      <div className="container-site grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <Eyebrow>Inspired by the island</Eyebrow>
          <h2 className="text-heading text-ink">
            Where Moments
            <br /> Become Memories
          </h2>
        </div>
        <p>
          At Isla Blanca, luxury means simplicity, authenticity and genuine hospitality. Every
          detail is designed to create a peaceful sanctuary where you reconnect with nature while
          enjoying world-class comfort.
        </p>
      </div>
    </section>
  )
}

function ExperienceRow({
  experience,
  reversed,
}: {
  experience: (typeof experiences)[number]
  reversed: boolean
}) {
  return (
    <article className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
      <Reveal
        y={40}
        transition={spring(2, 0.2, 0.2)}
        className={cn('relative mx-auto w-full max-w-[340px]', reversed && 'md:order-2')}
      >
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-t-full rounded-b-[170px] border border-gold/70" />
        <img
          {...photo(experience.image, '340px')}
          alt=""
          loading="lazy"
          className="relative aspect-[340/520] w-full rounded-t-full rounded-b-[170px] object-cover"
        />
      </Reveal>
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          className="grid size-14 place-items-center rounded-full border border-gold/50 text-gold"
          style={{ transformPerspective: 600 }}
          initial={{ rotateY: 90 }}
          whileInView={{ rotateY: 0 }}
          viewport={inViewOnce}
          transition={spring(2, 0.5, 0.5)}
        >
          <MaskIcon name={experience.icon} className="size-7" />
        </motion.div>
        <h2 className="text-subheading font-black text-sand">{experience.title}</h2>
        <p className="text-eyebrow text-gold">The Isla Blanca experience</p>
        <p className="max-w-[420px] text-sand">{experience.text}</p>
        <ul className="space-y-1 text-caption text-[11px] tracking-[0.2em] text-cream uppercase">
          {experience.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function ServicesPage() {
  usePageTitle('Services')

  return (
    <>
      <PageHero
        image="/images/gallery/gallery-02.jpg"
        eyebrow="Welcome to Isla Blanca"
        title={
          <>
            Where Luxury
            <br /> Feels Natural
          </>
        }
        text="On the quiet coast of Ibiza, Isla Blanca pairs contemporary elegance with genuine hospitality and the beauty of the island."
      />
      <Intro />
      <section className="bg-forest py-16 lg:py-30">
        <div className="container-site space-y-24 lg:space-y-32">
          {experiences.map((experience, index) => (
            <ExperienceRow
              key={experience.title}
              experience={experience}
              reversed={index % 2 === 1}
            />
          ))}
        </div>
      </section>
      <Reviews />
      <Faq />
    </>
  )
}
