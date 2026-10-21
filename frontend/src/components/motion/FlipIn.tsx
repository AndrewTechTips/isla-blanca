import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { inViewOnce, spring, useMove } from '@/lib/motion'

/** A round icon badge that turns to face the visitor as it scrolls into view (a 3D flip),
 * animated as one compositor-friendly transform. */
export function FlipIn({ children, className }: { children: ReactNode; className?: string }) {
  const move = useMove()
  return (
    <motion.div
      className={cn(
        'grid size-14 place-items-center rounded-full border border-gold/50 text-gold',
        className,
      )}
      initial={move('perspective(600px) rotateY(90deg)')}
      whileInView={move('perspective(600px) rotateY(0deg)')}
      viewport={inViewOnce}
      transition={spring(2, 0.5, 0.5)}
    >
      {children}
    </motion.div>
  )
}
