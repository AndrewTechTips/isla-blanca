import { motion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/cn'
import { hoverSpring } from '@/lib/motion'

type Variant = 'sage' | 'gold' | 'ghost' | 'outline'

const styles: Record<Variant, { base: string; hover: string }> = {
  // A deeper sage than the template's so the label passes WCAG AA; hover darkens instead of lightening.
  sage: { base: 'bg-sage-deep text-cream', hover: '#4a584e' },
  gold: { base: 'bg-gold text-forest', hover: '#dbae69' },
  ghost: { base: 'border border-white/70 text-white', hover: 'rgba(248, 245, 240, 0.3)' },
  /** Secondary action on light backgrounds. */
  outline: { base: 'border border-ink/25 text-ink', hover: 'rgba(238, 231, 221, 0.9)' },
}

interface ButtonContentProps {
  children: ReactNode
  variant: Variant
}

/** The label rolls up to an identical copy on hover, like the Framer button component. */
function RollingLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <motion.span
        className="block"
        variants={{ rest: { y: '0%' }, hover: { y: '-100%' } }}
        transition={hoverSpring}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 block"
        variants={{ rest: { y: '100%' }, hover: { y: '0%' } }}
        transition={hoverSpring}
      >
        {children}
      </motion.span>
    </span>
  )
}

function useButtonMotion(variant: Variant) {
  return {
    initial: 'rest',
    whileHover: 'hover',
    whileTap: { scale: 0.98 },
    variants: {
      rest: {},
      hover: { backgroundColor: styles[variant].hover },
    },
    transition: hoverSpring,
  } as const
}

const baseClass =
  'text-button inline-flex h-[45px] items-center justify-center rounded-[5px] px-4 whitespace-nowrap'

const MotionLink = motion.create(Link)

type ButtonProps = ButtonContentProps &
  Omit<ComponentProps<typeof motion.button>, 'children'> & { className?: string }

export function Button({ children, variant, className, ...props }: ButtonProps) {
  return (
    <motion.button
      {...useButtonMotion(variant)}
      className={cn(
        baseClass,
        styles[variant].base,
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RollingLabel>{children}</RollingLabel>
    </motion.button>
  )
}

type ButtonLinkProps = ButtonContentProps & { to: string; className?: string }

export function ButtonLink({ children, variant, to, className }: ButtonLinkProps) {
  return (
    <MotionLink
      to={to}
      {...useButtonMotion(variant)}
      className={cn(baseClass, styles[variant].base, className)}
    >
      <RollingLabel>{children}</RollingLabel>
    </MotionLink>
  )
}
