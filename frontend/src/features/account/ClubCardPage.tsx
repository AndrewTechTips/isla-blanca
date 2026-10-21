import { Check } from 'lucide-react'
import { motion } from 'motion/react'

import { MemberCard } from '@/components/club/MemberCard'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { ButtonLink } from '@/components/ui/Button'
import { Alert } from '@/components/ui/form'
import { PageLoader } from '@/components/ui/PageLoader'
import { tierCopy } from '@/data/club'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMyMembership } from '@/lib/api/queries/membership'
import type { Membership } from '@/lib/api/types'
import { spring } from '@/lib/motion'

function Progress({ membership }: { membership: Membership }) {
  const { completed_nights: nights, next_tier: next, next_tier_nights: goal } = membership

  if (!next || goal === null) {
    return (
      <p className="rounded-lg bg-sand p-4 text-sm text-ink">
        You have reached our highest tier. Thank you for coming back to us, again and again.
      </p>
    )
  }

  const share = Math.min(nights / goal, 1)
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-bold text-ink">
          {nights} of {goal} nights
        </span>
        <span>
          {membership.nights_to_next} more to {tierCopy[next].name}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progress to ${tierCopy[next].name}`}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={nights}
        className="h-2 overflow-hidden rounded-full bg-sand"
      >
        <motion.div
          className="h-full origin-left rounded-full bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: share }}
          transition={spring(1.4, 0.15, 0.3)}
        />
      </div>
      <p className="text-xs">Nights count once a stay is completed.</p>
    </div>
  )
}

export function ClubCardPage() {
  usePageTitle('Club card')
  const membership = useMyMembership()

  if (membership.isPending) return <PageLoader className="min-h-[30svh]" />
  if (membership.isError) return <Alert>{membership.error.message}</Alert>

  const card = membership.data
  const copy = tierCopy[card.tier]

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={spring(1.4, 0.25)}
        className="mx-auto w-full max-w-[520px]"
      >
        <MemberCard
          tier={card.tier}
          name={card.member_name}
          number={card.member_number}
          since={String(new Date(card.member_since).getFullYear())}
        />
      </motion.div>

      <div className="space-y-6 rounded-lg bg-white p-6 md:p-8">
        <div className="space-y-2">
          <p className="text-eyebrow text-gold-deep">{copy.tagline}</p>
          <h2 className="text-subheading text-ink">{copy.name} Member</h2>
          <p>
            Signed in, you save <strong className="text-ink">{card.discount_percent}%</strong> on
            every room night.
          </p>
        </div>
        <Progress membership={card} />
        <ul className="space-y-2.5 border-t border-ink/10 pt-5 text-sm">
          {copy.perks.map((perk) => (
            <li key={perk} className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-gold-deep" strokeWidth={2} />
              {perk}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <ButtonLink to="/rooms" variant="sage">
            Book a Stay
          </ButtonLink>
          <ArrowLink to="/club">All tiers</ArrowLink>
        </div>
      </div>
    </div>
  )
}
