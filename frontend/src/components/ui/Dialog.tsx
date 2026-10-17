import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'
import { tween } from '@/lib/motion'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Wider dialog for forms (admin editors). */
  size?: 'sm' | 'lg'
}

/** Accessible modal: focus moves inside, Escape and the backdrop close it, page scroll is locked. */
export function Dialog({ open, onClose, title, children, size = 'sm' }: DialogProps) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      previousFocus?.focus()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={tween(0.25)}
        >
          {/* min-h-full + flex centres short dialogs and lets tall ones scroll from the top. */}
          <div
            className="flex min-h-full items-center justify-center p-4"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
          >
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={cn(
                'w-full rounded-xl bg-cream p-6 shadow-2xl outline-none md:p-8',
                size === 'sm' ? 'max-w-md' : 'max-w-3xl',
              )}
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.98 }}
              transition={tween(0.25)}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <h2 id={titleId} className="text-card-title text-ink">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-m-1 cursor-pointer rounded p-1 text-ink-soft hover:text-ink"
                >
                  <X className="size-5" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
