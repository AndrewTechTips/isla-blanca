import { motion } from 'motion/react'

import { inViewOnce, spring } from '@/lib/motion'

interface WordRevealProps {
  text: string
  className?: string
  as?: 'p' | 'h2' | 'h3'
  /** Delay between words, in seconds. */
  stagger?: number
}

/** Each word comes into focus in turn: blurred and slightly low, then sharp (CTA band). */
export function WordReveal({ text, className, as = 'p', stagger = 0.05 }: WordRevealProps) {
  const Component = motion[as]
  const words = text.split(' ')

  return (
    <Component className={className} initial="hidden" whileInView="shown" viewport={inViewOnce}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="inline-block whitespace-pre"
            variants={{
              hidden: { opacity: 0, y: 10, filter: 'blur(10px)' },
              shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
            }}
            transition={spring(1.5, 0, 0.05 + index * stagger)}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </span>
    </Component>
  )
}
