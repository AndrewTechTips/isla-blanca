import type { MembershipTier, TierInfo } from '@/lib/api/types'

/** Same numbers as the API (`app/services/membership.py`), shown until it answers. */
export const clubTiers: TierInfo[] = [
  { tier: 'silver', min_nights: 0, discount_percent: 5 },
  { tier: 'gold', min_nights: 7, discount_percent: 10 },
  { tier: 'platinum', min_nights: 20, discount_percent: 15 },
]

export const tierCopy: Record<MembershipTier, { name: string; tagline: string; perks: string[] }> =
  {
    silver: {
      name: 'Silver',
      tagline: 'A warmer welcome, every time',
      perks: [
        'Member rate on every room night',
        'A glass of cava on arrival',
        'Early access to seasonal offers',
        'Priority booking line',
      ],
    },
    gold: {
      name: 'Gold',
      tagline: 'Priority, wherever you go',
      perks: [
        'Everything in Silver',
        'Breakfast for two on your first morning',
        'Room upgrade when one is free',
        'Late check-out until 2:00 PM',
      ],
    },
    platinum: {
      name: 'Platinum',
      tagline: 'The island, arranged for you',
      perks: [
        'Everything in Gold',
        'Airport transfer both ways',
        'Private check-in at your suite',
        'A personal concierge for your stay',
      ],
    },
  }

export const clubBenefits = [
  {
    title: 'Member Rates',
    text: 'Your club discount comes off every room night the moment you sign in, on any suite and any date.',
  },
  {
    title: 'Nights That Count',
    text: 'Every night of a completed stay counts towards your next tier. No points to track and nothing expires.',
  },
  {
    title: 'Thoughtful Upgrades',
    text: 'Gold and Platinum members are first in line for a better view when a suite is free on arrival.',
  },
  {
    title: 'Slower Departures',
    text: 'Late check-out from Gold upwards, so the last morning can be spent by the pool rather than packing.',
  },
  {
    title: 'Dining & Spa',
    text: 'Breakfast for two, a glass of cava on arrival and early access to spa times before they open to everyone.',
  },
  {
    title: 'Personal Concierge',
    text: 'Platinum members have one person who arranges transfers, tables, boats and the little surprises.',
  },
]

export const clubFaqs = [
  {
    question: 'How do I join the club?',
    answer:
      'Create a free account. You become a Silver member straight away and your discount applies to your very first booking.',
  },
  {
    question: 'How do I move up a tier?',
    answer:
      'Nights from completed stays count automatically: Gold from 7 nights and Platinum from 20. You move up as soon as a stay that gets you there is completed.',
  },
  {
    question: 'Which part of the price is discounted?',
    answer:
      'The room nights. Services such as spa treatments, dining or transfers are charged at their usual price.',
  },
  {
    question: 'Can I lose my tier?',
    answer:
      'No. Once you reach a tier it stays with you, whether you return next month or in a few years.',
  },
]
