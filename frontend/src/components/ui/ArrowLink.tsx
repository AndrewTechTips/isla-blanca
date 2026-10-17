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
}

/** Gold text link with an arrow that nudges right on hover ("Book Now →", "All Rooms →"). */
export function ArrowLink({ to, children, className }: ArrowLinkProps) {
  return (
    <MotionLink
      to={to}
      initial="rest"
      whileHover="hover"
      className={cn(
        'inline-flex items-center gap-2 font-sans text-[13px] font-extrabold tracking-[0.133em] text-gold',
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
