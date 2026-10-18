import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/cn'
import { hoverSpring } from '@/lib/motion'

const MotionLink = motion.create(Link)

interface ArrowLinkProps {
  to: string
  children: ReactNode
  className?: string
  /** The surface behind it: the template's gold reads well only on dark ones. */
  tone?: 'light' | 'dark'
}

/** Gold text link with an arrow that nudges right on hover ("Book Now →", "All Rooms →"). */
export function ArrowLink({ to, children, className, tone = 'light' }: ArrowLinkProps) {
  return (
    <MotionLink
      to={to}
      initial="rest"
      whileHover="hover"
      className={cn(
        'inline-flex items-center gap-2 font-sans text-[13px] font-extrabold tracking-[0.133em]',
        tone === 'dark' ? 'text-gold' : 'text-gold-deep',
        className,
      )}
    >
      {children}
      <motion.span variants={{ rest: { x: 0 }, hover: { x: 4 } }} transition={hoverSpring}>
        <ArrowRight className="size-4" strokeWidth={1.75} />
      </motion.span>
    </MotionLink>
  )
}
