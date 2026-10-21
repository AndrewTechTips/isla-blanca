import { Check } from 'lucide-react'
import { motion } from 'motion/react'

import { MemberCard } from '@/components/club/MemberCard'
import { Reveal } from '@/components/motion/Reveal'
import { CtaBand } from '@/components/sections/CtaBand'
import { Faq } from '@/components/sections/Faq'
import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { clubBenefits, clubFaqs, tierCopy } from '@/data/club'
import { useAuth } from '@/features/auth/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTiers } from '@/lib/api/queries/membership'
import type { TierInfo } from '@/lib/api/types'
import { cn } from '@/lib/cn'
import { hero, inViewOnce, spring } from '@/lib/motion'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

/** Where each card of the hero fan comes to rest: Silver left, Platinum on top, Gold right. */
const fan = [
  { tier: 'silver', x: '-30%', y: '8%', rotate: -12, z: 1, delay: 0.9 },
  { tier: 'gold', x: '30%', y: '8%', rotate: 12, z: 2, delay: 1.05 },
  { tier: 'platinum', x: '0%', y: '-6%', rotate: 0, z: 3, delay: 1.2 },
] as const

/** "Join the Club" for visitors, the guest's own card once they're signed in. */
function ClubAction({ tone = 'gold' }: { tone?: 'gold' | 'sage' }) {
  const { user, isAdmin, status } = useAuth()
  if (status === 'loading') return null
  if (!user) {
    return (
      <ButtonLink to="/register" variant={tone}>
        Join the Club
      </ButtonLink>
    )
  }
  return (
    <ButtonLink to={isAdmin ? '/admin/guests' : '/account/club'} variant={tone}>
      {isAdmin ? 'Members' : 'View Your Card'}
    </ButtonLink>
  )
}

function ClubHero() {
  return (
    <section className="relative isolate overflow-hidden bg-forest text-sand">
      <div className="grain absolute inset-0 -z-10 opacity-60" />
      <div className="container-site grid items-center gap-6 pt-36 pb-16 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pb-20 lg:min-h-svh lg:pt-32">
        <div className="max-w-[520px] space-y-6">
          <Reveal onMount y={40} transition={hero.eyebrow}>
            <Eyebrow tone="dark">Isla Blanca Club</Eyebrow>
          </Reveal>
          <Reveal
            as="h1"
            onMount
            y={30}
            transition={hero.title}
            className="text-display text-cream"
          >
            Rewarded Every Time You Return
          </Reveal>
          <Reveal as="p" onMount transition={hero.text} className="max-w-[440px]">
            Our way of thanking the guests who come back. Join for free, save on every room night
            and move up from Silver to Gold and Platinum simply by staying with us.
          </Reveal>
          <Reveal onMount transition={hero.actions} className="pt-2">
            <ClubAction />
          </Reveal>
        </div>

        {/* The three cards rise from below and fan out. */}
        <div className="relative mx-auto aspect-[1.5] w-full max-w-[560px] md:aspect-[1.35]">
          {fan.map((card) => (
            <motion.div
              key={card.tier}
              className="absolute inset-x-[21%] top-[18%] md:inset-x-[18%] md:top-[22%]"
              style={{ zIndex: card.z }}
              initial={{ opacity: 0, y: '60%', rotate: 0, x: '0%' }}
              animate={{ opacity: 1, y: card.y, rotate: card.rotate, x: card.x }}
              transition={spring(1.6, 0.25, card.delay)}
            >
              <MemberCard tier={card.tier} name="Isla Blanca Guest" interactive={false} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TierColumn({ info, index }: { info: TierInfo; index: number }) {
  const copy = tierCopy[info.tier]
  return (
    <Reveal
      y={40}
      transition={spring(1.6, 0.2, index * 0.2)}
      className={cn(
        'flex flex-col gap-6 rounded-xl bg-white/70 p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:p-6',
        // On tablets the third tier sits alone on its row: keep it centered, not on the left.
        'md:last:col-span-2 md:last:w-[calc(50%-0.75rem)] md:last:justify-self-center lg:last:col-span-1 lg:last:w-auto lg:last:justify-self-stretch',
      )}
    >
      <MemberCard tier={info.tier} />
      <div className="space-y-2">
        <h3 className="text-card-title text-ink">{copy.name} Member</h3>
        <p className="text-eyebrow text-gold-deep">{copy.tagline}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 border-y border-ink/10 py-4">
        <div>
          <dt className="text-label text-ink-soft uppercase">Room nights</dt>
          <dd className="font-serif text-3xl font-semibold text-ink lining-nums">
            −{info.discount_percent}%
          </dd>
        </div>
        <div>
          <dt className="text-label text-ink-soft uppercase">Reached</dt>
          <dd className="pt-2 font-sans text-sm font-bold text-ink">
            {info.min_nights === 0 ? 'When you join' : `After ${info.min_nights} nights`}
          </dd>
        </div>
      </dl>
      <ul className="space-y-2.5 text-sm">
        {copy.perks.map((perk) => (
          <li key={perk} className="flex gap-3">
            <Check className="mt-0.5 size-4 shrink-0 text-gold-deep" strokeWidth={2} />
            {perk}
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

function Tiers() {
  const tiers = useTiers()
  return (
    <section className="bg-cream section-y">
      <div className="container-site space-y-12">
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4 text-center">
          <Eyebrow>Membership</Eyebrow>
          <h2 className="text-heading text-ink">Three Tiers, One Welcome</h2>
          <p>
            Every guest starts as Silver. Nights from your stays carry you to Gold and Platinum, and
            a tier, once reached, is yours to keep.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiers.data?.map((info, index) => (
            <TierColumn key={info.tier} info={info} index={index} />
          ))}
        </div>
        <div className="flex justify-center">
          <ClubAction tone="sage" />
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const tiers = useTiers().data ?? []
  const gold = tiers.find((tier) => tier.tier === 'gold')
  const platinum = tiers.find((tier) => tier.tier === 'platinum')
  const steps = [
    {
      title: 'Create an account',
      text: 'It is free and takes a minute. You are a Silver member from your very first booking.',
    },
    {
      title: 'Stay with us',
      text: 'Sign in when you book and your member rate is taken off every room night.',
    },
    {
      title: 'Move up',
      text: `Completed stays count: Gold from ${gold?.min_nights ?? 7} nights, Platinum from ${platinum?.min_nights ?? 20}. It happens on its own.`,
    },
  ]

  return (
    <section className="bg-sand py-16 lg:py-24">
      <div className="container-site grid gap-10 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal
            key={step.title}
            y={30}
            transition={spring(1.6, 0.2, index * 0.15)}
            className="space-y-3"
          >
            <p className="font-serif text-5xl font-semibold text-gold-deep lining-nums">
              0{index + 1}
            </p>
            <h3 className="text-card-title text-ink">{step.title}</h3>
            <p>{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section className="bg-forest py-16 lg:py-30">
      <div className="container-site space-y-12">
        <div className="flex max-w-[560px] flex-col gap-4">
          <Eyebrow tone="dark">Membership benefits</Eyebrow>
          <h2 className="text-heading text-sand">Why Guests Join</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubBenefits.map((benefit, index) => (
            <motion.article
              key={benefit.title}
              className="relative space-y-3 border border-gold/40 p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={spring(1.6, 0.2, (index % 3) * 0.15)}
            >
              <div aria-hidden="true" className="absolute inset-2 border border-gold/15" />
              <p className="font-serif text-2xl text-gold italic">{ROMAN[index]}</p>
              <h3 className="text-card-title text-sand">{benefit.title}</h3>
              <p className="text-sand/90">{benefit.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ClubPage() {
  usePageTitle('Club')

  return (
    <>
      <ClubHero />
      <Tiers />
      <HowItWorks />
      <Benefits />
      <Faq
        items={clubFaqs}
        title="About the Club"
        text="How membership works, from joining to moving up a tier."
      />
      <CtaBand />
    </>
  )
}
