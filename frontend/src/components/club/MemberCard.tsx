import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import type { PointerEvent } from 'react'

import { SunMark } from '@/components/brand/Logo'
import { tierCopy } from '@/data/club'
import type { MembershipTier } from '@/lib/api/types'
import { cn } from '@/lib/cn'

/** Brushed metal for each tier: Silver and Gold are bright, Platinum is a dark graphite card. */
const finish: Record<MembershipTier, { metal: string; text: string; line: string }> = {
  silver: {
    metal:
      'linear-gradient(125deg, #f4f5f7 0%, #c3c8cf 22%, #eef0f3 42%, #a3a9b1 64%, #dde0e4 82%, #b7bcc3 100%)',
    text: 'text-[#2c3036]',
    line: 'border-[#2c3036]/15',
  },
  gold: {
    metal:
      'linear-gradient(125deg, #f6e7bd 0%, #d2ae67 22%, #f7e6b5 42%, #b18742 64%, #e8cb86 82%, #c49b55 100%)',
    text: 'text-[#3a2a10]',
    line: 'border-[#3a2a10]/20',
  },
  platinum: {
    metal:
      'linear-gradient(125deg, #55585e 0%, #2a2c30 24%, #6c7077 44%, #222428 66%, #474a50 84%, #2d2f33 100%)',
    text: 'text-[#ecebe8]',
    line: 'border-white/15',
  },
}

/** Fine horizontal grain, like brushed metal. */
const brushed =
  'repeating-linear-gradient(0deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 3px)'

interface MemberCardProps {
  tier: MembershipTier
  name?: string
  /** Eight digits, printed in two groups. */
  number?: string
  since?: string
  /** Tilt towards the pointer with a moving reflection (off for reduced motion). */
  interactive?: boolean
  className?: string
}

/** The Isla Blanca Club card, drawn in CSS so it carries the guest's own name and number. */
export function MemberCard({
  tier,
  name = 'Your Name',
  number = '20260000',
  since,
  interactive = true,
  className,
}: MemberCardProps) {
  const reduceMotion = useReducedMotion()
  const tilt = interactive && !reduceMotion

  // Pointer position over the card, 0–1 on each axis; 0.5 is the centre.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const smoothX = useSpring(px, { stiffness: 200, damping: 20 })
  const smoothY = useSpring(py, { stiffness: 200, damping: 20 })
  const rotateY = useTransform(smoothX, [0, 1], [-12, 12])
  const rotateX = useTransform(smoothY, [0, 1], [10, -10])
  const glareX = useTransform(smoothX, [0, 1], ['10%', '90%'])
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%'])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.45), transparent 55%)`

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - box.left) / box.width)
    py.set((event.clientY - box.top) / box.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  const style = finish[tier]
  const label = tierCopy[tier].name

  return (
    <div
      className={cn('@container', tilt && '[perspective:1000px]', className)}
      onPointerMove={tilt ? track : undefined}
      onPointerLeave={tilt ? reset : undefined}
    >
      <motion.div
        role="img"
        aria-label={`Isla Blanca Club ${label} card for ${name}, member number ${number}`}
        className={cn(
          'relative isolate aspect-[1.586] w-full overflow-hidden rounded-[4.5cqw] shadow-[0_24px_48px_-16px_rgb(0_0_0/0.45)]',
          style.text,
        )}
        style={{
          backgroundImage: `${brushed}, ${style.metal}`,
          ...(tilt && { rotateX, rotateY }),
        }}
      >
        {/* Moving reflection and an engraved inner line, as on the resort's own frames. */}
        {tilt && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ backgroundImage: glare }}
          />
        )}
        <div
          aria-hidden="true"
          className={cn('absolute inset-[3cqw] rounded-[2.5cqw] border', style.line)}
        />

        <div className="relative flex h-full flex-col justify-between p-[7cqw]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-[2.5cqw]">
              <SunMark className="h-[6cqw] w-[9cqw]" />
              <span className="font-serif text-[5.2cqw] leading-none font-medium tracking-[0.16em] uppercase">
                Isla Blanca
              </span>
            </div>
            <span className="font-serif text-[6cqw] leading-none font-semibold italic">
              {label}
            </span>
          </div>

          {/* The chip: a small engraved plate with contact lines. */}
          <div
            aria-hidden="true"
            className={cn(
              'grid h-[11cqw] w-[15cqw] grid-cols-3 grid-rows-3 overflow-hidden rounded-[1.8cqw] border opacity-70',
              style.line,
            )}
            style={{ background: 'linear-gradient(135deg, rgb(255 255 255 / 0.35), transparent)' }}
          >
            {Array.from({ length: 9 }, (_, index) => (
              <span key={index} className={cn('border-[0.5px]', style.line)} />
            ))}
          </div>

          <div className="flex items-end justify-between gap-[4cqw]">
            <div className="min-w-0 space-y-[1.5cqw]">
              <p className="font-label text-[3.6cqw] leading-none font-semibold tracking-[0.3em] tabular-nums">
                {number.slice(0, 4)} {number.slice(4)}
              </p>
              <p className="truncate font-sans text-[3.6cqw] leading-none font-bold tracking-[0.18em] uppercase">
                {name}
              </p>
            </div>
            <div className="shrink-0 text-right font-label text-[2.6cqw] leading-tight font-bold tracking-[0.2em] uppercase opacity-75">
              <p>Club member</p>
              {since && <p>Since {since}</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
