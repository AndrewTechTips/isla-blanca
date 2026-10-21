import { Star } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { testimonials } from '@/data/content'
import { useParallax } from '@/hooks/useParallax'
import { cn } from '@/lib/cn'
import { photo } from '@/lib/images'
import { inViewOnce, spring, tween, useMove } from '@/lib/motion'

const ROTATE_EVERY_MS = 7000

/** Full-bleed photo with one guest quote at a time; quotes rotate and can be picked. */
export function Reviews() {
  const [active, setActive] = useState(0)
  const section = useRef<HTMLElement>(null)
  // The photo is taller than the section and drifts slower than the page.
  const photoY = useParallax(section, '-12%', '12%')
  const move = useMove()

  // Quotes only rotate while the section is on screen. Their blur-to-sharp change can't run on
  // the compositor, so a carousel turning out of sight would keep the main thread busy while the
  // visitor scrolls the rest of the page.
  const onScreen = useInView(section)

  useEffect(() => {
    if (!onScreen) return
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % testimonials.length),
      ROTATE_EVERY_MS,
    )
    return () => window.clearTimeout(timer)
  }, [active, onScreen])

  const review = testimonials[active]

  return (
    <section
      ref={section}
      className="relative isolate flex min-h-[506px] items-center overflow-hidden py-20 text-white md:min-h-[630px]"
      aria-roledescription="carousel"
      aria-label="Guest reviews"
    >
      <motion.div
        className="absolute inset-x-0 -top-[15%] -z-20 h-[130%]"
        style={{ transform: photoY }}
      >
        <motion.img
          {...photo('/images/home/reviews-bg.jpg')}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          initial={move('scale(1.2)')}
          whileInView={move('scale(1)')}
          viewport={inViewOnce}
          transition={tween(4)}
        />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-black/50" />

      <div className="container-site flex flex-col items-center gap-6 text-center">
        <div className="grid min-h-[250px] w-full place-items-center md:min-h-[230px]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={active}
              className="flex max-w-[860px] flex-col items-center gap-5"
              initial={{ opacity: 0, filter: 'blur(5px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(5px)' }}
              transition={tween(0.7)}
              aria-live="polite"
            >
              <motion.blockquote
                className="text-quote"
                initial={move('translateY(30px)')}
                animate={move('translateY(0px)')}
                transition={spring(2, 0.3, 0.1)}
              >
                “{review.quote}”
              </motion.blockquote>
              <motion.div
                className="flex gap-1 text-gold"
                role="img"
                initial={move('translateY(40px)')}
                animate={move('translateY(0px)')}
                transition={spring(2, 0.2, 0.2)}
                aria-label="5 out of 5 stars"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star key={n} className="size-4 fill-current" strokeWidth={0} />
                ))}
              </motion.div>
              <motion.figcaption
                className="text-caption font-black text-sand uppercase"
                initial={move('translateY(40px)')}
                animate={move('translateY(0px)')}
                transition={spring(2, 0.2, 0.3)}
              >
                {review.author} – {review.source}
              </motion.figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="flex gap-3" role="tablist" aria-label="Choose a review">
          {testimonials.map((item, index) => (
            <button
              key={item.author}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Review by ${item.author}`}
              onClick={() => setActive(index)}
              className={cn(
                'size-2.5 cursor-pointer rounded-full border border-sand transition-colors',
                index === active ? 'bg-sand' : 'bg-transparent hover:bg-sand/50',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
