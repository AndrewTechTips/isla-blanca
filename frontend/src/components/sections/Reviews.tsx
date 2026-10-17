import { Star } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { testimonials } from '@/data/content'
import { cn } from '@/lib/cn'
import { inViewOnce, spring, tween } from '@/lib/motion'

const ROTATE_EVERY_MS = 7000

/** Full-bleed photo with one guest quote at a time; quotes rotate and can be picked. */
export function Reviews() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % testimonials.length),
      ROTATE_EVERY_MS,
    )
    return () => window.clearTimeout(timer)
  }, [active])

  const review = testimonials[active]

  return (
    <section
      className="relative isolate flex min-h-[506px] items-center overflow-hidden py-20 text-white md:min-h-[630px]"
      aria-roledescription="carousel"
      aria-label="Guest reviews"
    >
      <motion.img
        src="/images/home/reviews-bg.jpg"
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-20 size-full object-cover"
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={inViewOnce}
        transition={tween(4)}
      />
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
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={spring(2, 0.3, 0.1)}
              >
                “{review.quote}”
              </motion.blockquote>
              <motion.div
                className="flex gap-1 text-gold"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={spring(2, 0.2, 0.2)}
                aria-label="5 out of 5 stars"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star key={n} className="size-4 fill-current" strokeWidth={0} />
                ))}
              </motion.div>
              <motion.figcaption
                className="text-caption font-black text-sand uppercase"
                initial={{ y: 40 }}
                animate={{ y: 0 }}
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
