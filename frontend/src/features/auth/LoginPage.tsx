import { type FormEvent, useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Alert, Field } from '@/components/ui/form'
import { controlClass } from '@/lib/controlClass'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLogin } from '@/lib/api/queries/auth'

import { AuthCard } from './AuthCard'

export function LoginPage() {
  usePageTitle('Sign in')
  const id = useId()
  const [searchParams] = useSearchParams()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    // On success the guard around this page sends the guest on (see GuestOnly).
    login.mutate({ email, password })
  }

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign In"
      text="Manage your stays, add extras and share your experience."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {login.error && <Alert>{login.error.message}</Alert>}
        <Field id={`${id}-email`} label="Email" tone="dark">
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={controlClass('dark')}
          />
        </Field>
        <Field id={`${id}-password`} label="Password" tone="dark">
          <input
            id={`${id}-password`}
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={controlClass('dark')}
          />
        </Field>
        <Button type="submit" variant="gold" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
      <p className="text-sm">
        New to Isla Blanca?{' '}
        <Link
          to={`/register${searchParams.size ? `?${searchParams}` : ''}`}
          className="text-gold underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  )
}
