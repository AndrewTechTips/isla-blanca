import { type FormEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Alert, Field } from '@/components/ui/form'
import { controlClass } from '@/lib/controlClass'
import { useAuth } from '@/features/auth/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ApiError } from '@/lib/api/client'
import { useUpdateProfile } from '@/lib/api/queries/auth'
import type { User } from '@/lib/api/types'

function ProfileForm({ user }: { user: User }) {
  const id = useId()
  const update = useUpdateProfile()
  const [form, setForm] = useState({
    first_name: user.profile.first_name,
    last_name: user.profile.last_name,
    phone: user.profile.phone ?? '',
    country: user.profile.country ?? '',
  })
  const set = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))
  const fields = update.error instanceof ApiError ? update.error.fields : {}

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({
      ...form,
      phone: form.phone.trim() || null,
      country: form.country.trim() || null,
    })
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6 rounded-lg bg-white p-6 md:p-8">
      {update.isSuccess && <Alert kind="success">Your profile is up to date.</Alert>}
      {update.error && !Object.keys(fields).length && <Alert>{update.error.message}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-first`} label="First name" error={fields.first_name}>
          <input
            id={`${id}-first`}
            required
            autoComplete="given-name"
            value={form.first_name}
            onChange={set('first_name')}
            className={controlClass('light', Boolean(fields.first_name))}
          />
        </Field>
        <Field id={`${id}-last`} label="Last name" error={fields.last_name}>
          <input
            id={`${id}-last`}
            required
            autoComplete="family-name"
            value={form.last_name}
            onChange={set('last_name')}
            className={controlClass('light', Boolean(fields.last_name))}
          />
        </Field>
        <Field id={`${id}-phone`} label="Phone" error={fields.phone}>
          <input
            id={`${id}-phone`}
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set('phone')}
            className={controlClass('light', Boolean(fields.phone))}
          />
        </Field>
        <Field id={`${id}-country`} label="Country" error={fields.country}>
          <input
            id={`${id}-country`}
            autoComplete="country-name"
            value={form.country}
            onChange={set('country')}
            className={controlClass('light', Boolean(fields.country))}
          />
        </Field>
        <Field
          id={`${id}-email`}
          label="Email"
          hint="Contact us to change the email of your account."
        >
          <input id={`${id}-email`} value={user.email} disabled className={controlClass('light')} />
        </Field>
        <Field id={`${id}-since`} label="Member since">
          <input
            id={`${id}-since`}
            value={new Date(user.created_at).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
            disabled
            className={controlClass('light')}
          />
        </Field>
      </div>
      <Button type="submit" variant="sage" disabled={update.isPending}>
        {update.isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}

export function ProfilePage() {
  usePageTitle('Profile')
  const { user } = useAuth()
  return user ? <ProfileForm user={user} /> : null
}
