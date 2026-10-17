import { type FormEvent, useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Alert, Field } from '@/components/ui/form'
import { controlClass } from '@/lib/controlClass'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ApiError } from '@/lib/api/client'
import { useRegister } from '@/lib/api/queries/auth'

import { AuthCard } from './AuthCard'

const MIN_PASSWORD = 8

export function RegisterPage() {
  usePageTitle('Create an account')
  const id = useId()
  const [searchParams] = useSearchParams()
  const register = useRegister()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })
  const set = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const fieldErrors = register.error instanceof ApiError ? register.error.fields : {}
  const tooShort = form.password.length > 0 && form.password.length < MIN_PASSWORD

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (tooShort) return
    // On success the guard around this page sends the guest on (see GuestOnly).
    register.mutate(form)
  }

  return (
    <AuthCard
      eyebrow="Join Isla Blanca"
      title="Create Account"
      text="Book suites in a few clicks and keep every stay in one place."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {register.error && <Alert>{register.error.message}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${id}-first`} label="First name" tone="dark" error={fieldErrors.first_name}>
            <input
              id={`${id}-first`}
              required
              autoComplete="given-name"
              value={form.first_name}
              onChange={set('first_name')}
              className={controlClass('dark', Boolean(fieldErrors.first_name))}
            />
          </Field>
          <Field id={`${id}-last`} label="Last name" tone="dark" error={fieldErrors.last_name}>
            <input
              id={`${id}-last`}
              required
              autoComplete="family-name"
              value={form.last_name}
              onChange={set('last_name')}
              className={controlClass('dark', Boolean(fieldErrors.last_name))}
            />
          </Field>
        </div>
        <Field id={`${id}-email`} label="Email" tone="dark" error={fieldErrors.email}>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            className={controlClass('dark', Boolean(fieldErrors.email))}
          />
        </Field>
        <Field
          id={`${id}-password`}
          label="Password"
          tone="dark"
          error={tooShort ? `At least ${MIN_PASSWORD} characters.` : fieldErrors.password}
        >
          <input
            id={`${id}-password`}
            type="password"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            aria-describedby={tooShort ? `${id}-password-error` : undefined}
            className={controlClass('dark', tooShort)}
          />
        </Field>
        <Button type="submit" variant="gold" className="w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
      <p className="text-sm">
        Already have an account?{' '}
        <Link
          to={`/login${searchParams.size ? `?${searchParams}` : ''}`}
          className="text-gold underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
