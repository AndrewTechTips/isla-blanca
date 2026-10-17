import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'

import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { faqs } from '@/data/content'
import { hoverSpring } from '@/lib/motion'

/** Plus that turns into a minus: the vertical bar rotates flat while the cross turns over. */
function ToggleIcon({ open }: { open: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className="relative block size-3.5 shrink-0 text-ink"
      animate={{ rotate: open ? 180 : 0 }}
      transition={hoverSpring}
    >
      <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 bg-current" />
      <motion.span
        className="absolute top-0 left-1/2 h-full w-[1.5px] -translate-x-1/2 bg-current"
        animate={{ rotate: open ? 90 : 0 }}
        transition={hoverSpring}
      />
    </motion.span>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="border-b border-ink/15">
      <h3>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-4 py-4 text-left font-bold"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          <ToggleIcon open={open} />
          {question}
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
            transition={hoverSpring}
          >
            <p className="pb-5 pl-[30px]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq() {
  return (
    <section className="bg-sand section-y">
      <div className="container-site grid gap-12 lg:grid-cols-2">
        <div className="max-w-[440px] space-y-5">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-heading font-bold text-ink">Before Your Stay</h2>
          <p>
            Answers to the questions guests ask most about arrival, amenities and resort services.
          </p>
          <ButtonLink to="/contact" variant="gold">
            Get in Touch
          </ButtonLink>
        </div>
        <div className="border-t border-ink/15">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
