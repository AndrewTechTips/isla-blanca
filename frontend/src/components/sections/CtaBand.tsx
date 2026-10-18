import { Reveal } from '@/components/motion/Reveal'
import { WordReveal } from '@/components/motion/WordReveal'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { site } from '@/data/site'
import { spring } from '@/lib/motion'

export function CtaBand() {
  return (
    <section className="bg-forest py-10">
      <div className="container-site flex flex-col items-center gap-3 text-center">
        <WordReveal text={site.tagline} className="text-subheading font-bold text-sand" as="h2" />
        <Reveal transition={spring(1, 0.2, 0.6)}>
          <ArrowLink to="/rooms" tone="dark">
            Book Now
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  )
}
