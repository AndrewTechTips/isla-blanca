import { Pencil, Trash2 } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Alert, Field } from '@/components/ui/form'
import { controlClass } from '@/lib/controlClass'
import { MaskIcon } from '@/components/ui/MaskIcon'
import { PageLoader } from '@/components/ui/PageLoader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ApiError } from '@/lib/api/client'
import { useAdminServices, useDeleteService, useSaveService } from '@/lib/api/queries/admin'
import type { PricingUnit, Service } from '@/lib/api/types'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'

import { AdminHeader } from './AdminLayout'

const UNITS: { value: PricingUnit; label: string }[] = [
  { value: 'per_stay', label: 'Per stay' },
  { value: 'per_night', label: 'Per night' },
  { value: 'per_guest', label: 'Per guest' },
]

function ServiceEditor({ service, onDone }: { service?: Service; onDone: () => void }) {
  const id = useId()
  const save = useSaveService()
  const [form, setForm] = useState({
    name: service?.name ?? '',
    slug: service?.slug ?? '',
    description: service?.description ?? '',
    price: service?.price ?? '',
    pricing_unit: service?.pricing_unit ?? ('per_stay' as PricingUnit),
    icon: service?.icon ?? '',
    is_active: service?.is_active ?? true,
  })
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }))
  const fields = save.error instanceof ApiError ? save.error.fields : {}

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const { slug, ...rest } = form
    const data = { ...rest, price: String(form.price), icon: form.icon.trim() || null }
    save.mutate(
      { id: service?.id, data: service ? data : { ...data, slug } },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {save.error && <Alert>{save.error.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Name" error={fields.name}>
          <input
            id={`${id}-name`}
            required
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            className={controlClass('light', Boolean(fields.name))}
          />
        </Field>
        <Field
          id={`${id}-slug`}
          label="Slug"
          error={fields.slug}
          hint="Lowercase words joined by dashes."
        >
          <input
            id={`${id}-slug`}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            disabled={Boolean(service)}
            value={form.slug}
            onChange={(event) => set('slug', event.target.value)}
            className={controlClass('light', Boolean(fields.slug))}
          />
        </Field>
        <Field
          id={`${id}-description`}
          label="Description"
          className="sm:col-span-2"
          error={fields.description}
        >
          <textarea
            id={`${id}-description`}
            required
            rows={3}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            className={controlClass('light', Boolean(fields.description))}
          />
        </Field>
        <Field id={`${id}-price`} label="Price (€)" error={fields.price}>
          <input
            id={`${id}-price`}
            type="number"
            required
            min={0}
            step="0.01"
            value={form.price}
            onChange={(event) => set('price', event.target.value)}
            className={controlClass('light', Boolean(fields.price))}
          />
        </Field>
        <Field id={`${id}-unit`} label="Charged">
          <select
            id={`${id}-unit`}
            value={form.pricing_unit}
            onChange={(event) => set('pricing_unit', event.target.value as PricingUnit)}
            className={controlClass('light')}
          >
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id={`${id}-icon`}
          label="Icon"
          hint="Optional: service-spa, service-dining, service-yacht"
        >
          <input
            id={`${id}-icon`}
            value={form.icon}
            onChange={(event) => set('icon', event.target.value)}
            className={controlClass('light')}
          />
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          className="accent-[#b99a6b]"
          checked={form.is_active}
          onChange={(event) => set('is_active', event.target.checked)}
        />
        Offered to guests
      </label>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="sage" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : service ? 'Save Changes' : 'Add Service'}
        </Button>
      </div>
    </form>
  )
}

export function AdminServicesPage() {
  usePageTitle('Services')
  const services = useAdminServices()
  const remove = useDeleteService()
  const [editing, setEditing] = useState<Service | 'new' | null>(null)

  return (
    <>
      <AdminHeader
        title="Services"
        text="Extras guests can add to a stay. Prices are locked in when a guest books."
        action={
          <Button variant="sage" onClick={() => setEditing('new')}>
            Add Service
          </Button>
        }
      />
      {remove.error && <Alert className="mb-5">{remove.error.message}</Alert>}
      {services.isPending ? (
        <PageLoader className="min-h-[30svh]" />
      ) : services.isError ? (
        <Alert>{services.error.message}</Alert>
      ) : (
        <ul className="space-y-3">
          {services.data.map((service) => (
            <li
              key={service.id}
              className={cn(
                'flex flex-wrap items-center gap-4 rounded-lg bg-white p-4',
                !service.is_active && 'opacity-60',
              )}
            >
              {service.icon ? (
                <MaskIcon name={service.icon} className="size-8 text-gold" />
              ) : (
                <span className="size-8" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">
                  {service.name}
                  {!service.is_active && <span className="ml-2 text-xs font-normal">(hidden)</span>}
                </p>
                <p className="truncate text-sm">{service.description}</p>
              </div>
              <p className="text-sm font-semibold text-ink">
                {formatPrice(service.price)}{' '}
                <span className="font-normal">
                  {UNITS.find((u) => u.value === service.pricing_unit)?.label.toLowerCase()}
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-label={`Edit ${service.name}`}
                  onClick={() => setEditing(service)}
                  className="cursor-pointer p-1 text-sage hover:text-forest"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${service.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(service.id)}
                  className="cursor-pointer p-1 text-red-700 hover:text-red-900"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing && editing !== 'new' ? `Edit ${editing.name}` : 'Add a service'}
        size="lg"
      >
        {editing && (
          <ServiceEditor
            key={editing === 'new' ? 'new' : editing.id}
            service={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
    </>
  )
}
