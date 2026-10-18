import { motion } from 'motion/react'

import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MaskIcon } from '@/components/ui/MaskIcon'
import { experiences } from '@/data/content'
import { inViewOnce, spring } from '@/lib/motion'

const fadeIn = (delay: number) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: inViewOnce,
  transition: spring(2, 0, delay),
})

function ExperienceCard({ icon, title, text }: (typeof experiences)[number]) {
  return (
    <article className="relative flex min-h-[380px] flex-col items-center justify-center gap-4 border border-gold/40 px-8 py-16 text-center lg:min-h-[440px]">
      {/* Inner frame line, offset like the template's double border. */}
      <div aria-hidden="true" className="absolute inset-2 border border-gold/15" />
      <motion.div
        className="grid size-14 place-items-center rounded-full border border-gold/50 text-gold"
        style={{ transformPerspective: 600 }}
        initial={{ rotateY: 90 }}
        whileInView={{ rotateY: 0 }}
        viewport={inViewOnce}
        transition={spring(2, 0.5, 0.5)}
      >
        <MaskIcon name={icon} className="size-7" />
      </motion.div>
      <motion.h3 className="text-subheading font-black text-sand" {...fadeIn(0.5)}>
        {title}
      </motion.h3>
      <motion.p className="text-eyebrow text-gold" {...fadeIn(0.8)}>
        The Isla Blanca experience
      </motion.p>
      <motion.p className="max-w-[300px] text-sand" {...fadeIn(1.1)}>
        {text}
      </motion.p>
    </article>
  )
}

/** Dark "Beyond Your Stay" section: sticky intro on the left, stacked cards on the right. */
export function Experiences() {
  return (
    <section className="bg-forest py-16 lg:py-30">
      <div className="container-site grid gap-12 lg:grid-cols-2">
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Eyebrow tone="dark">The Isla Blanca experience</Eyebrow>
          <h2 className="text-heading text-sand">Beyond Your Stay</h2>
          <p className="max-w-[440px] text-sand">
            From slow mornings at the spa to sunset dinners and private days at sea, every
            experience is designed to make your stay exceptional.
          </p>
          <ButtonLink to="/services" variant="gold">
            More Services
          </ButtonLink>
        </div>
        <div className="space-y-4">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.title} {...experience} />
          ))}
        </div>
      </div>
    </section>
  )
}
