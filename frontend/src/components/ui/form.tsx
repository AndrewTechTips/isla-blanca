import { CircleAlert, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { Tone } from '@/lib/controlClass'

interface FieldProps {
  id: string
  label: string
  tone?: Tone
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function Field({ id, label, tone = 'light', error, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2 text-left', className)}>
      <label
        htmlFor={id}
        className={cn('text-label', tone === 'dark' ? 'text-gold' : 'font-semibold text-ink-soft')}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className={cn('text-xs', tone === 'dark' ? 'text-red-200' : 'text-red-600')}
        >
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-soft/80">{hint}</p>
      )}
    </div>
  )
}

/** Banner for a request's overall result. */
export function Alert({
  kind = 'error',
  children,
  className,
}: {
  kind?: 'error' | 'success'
  children: ReactNode
  className?: string
}) {
  const Icon = kind === 'error' ? CircleAlert : CircleCheck
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-lg px-4 py-3 text-sm',
        kind === 'error' ? 'bg-red-50 text-red-800' : 'bg-green/15 text-forest',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <div>{children}</div>
    </div>
  )
}
