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
import { useDeleteAmenity, useSaveAmenity } from '@/lib/api/queries/admin'
import { useAmenities } from '@/lib/api/queries/catalog'
import type { Amenity } from '@/lib/api/types'

import { AdminHeader } from './AdminLayout'

const ICONS = [
  'amenity-air-conditioning',
  'amenity-restaurant',
  'amenity-minibar',
  'amenity-wifi',
  'amenity-towels',
  'amenity-tv',
  'amenity-keycard',
  'amenity-safe',
]

function AmenityEditor({ amenity, onDone }: { amenity?: Amenity; onDone: () => void }) {
  const id = useId()
  const save = useSaveAmenity()
  const [name, setName] = useState(amenity?.name ?? '')
  const [slug, setSlug] = useState(amenity?.slug ?? '')
  const [icon, setIcon] = useState(amenity?.icon ?? ICONS[0])
  const fields = save.error instanceof ApiError ? save.error.fields : {}

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(
      { id: amenity?.id, data: amenity ? { name, icon } : { name, icon, slug } },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {save.error && <Alert>{save.error.message}</Alert>}
      <Field id={`${id}-name`} label="Name" error={fields.name}>
        <input
          id={`${id}-name`}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={controlClass('light', Boolean(fields.name))}
        />
      </Field>
      <Field id={`${id}-slug`} label="Slug" error={fields.slug}>
        <input
          id={`${id}-slug`}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          disabled={Boolean(amenity)}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className={controlClass('light', Boolean(fields.slug))}
        />
      </Field>
      <fieldset>
        <legend className="mb-3 text-label font-semibold">Icon</legend>
        <div className="grid grid-cols-4 gap-2">
          {ICONS.map((name) => (
            <label
              key={name}
              className="grid cursor-pointer place-items-center rounded-[5px] border border-ink/10 bg-white p-3 has-[:checked]:border-gold has-[:checked]:ring-1 has-[:checked]:ring-gold"
            >
              <input
                type="radio"
                name={`${id}-icon`}
                value={name}
                checked={icon === name}
                onChange={() => setIcon(name)}
                className="sr-only"
              />
              <MaskIcon name={name} className="size-7 text-gold" />
              <span className="sr-only">{name.replace('amenity-', '')}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="sage" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : amenity ? 'Save Changes' : 'Add Amenity'}
        </Button>
      </div>
    </form>
  )
}

export function AdminAmenitiesPage() {
  usePageTitle('Amenities')
  const amenities = useAmenities()
  const remove = useDeleteAmenity()
  const [editing, setEditing] = useState<Amenity | 'new' | null>(null)

  return (
    <>
      <AdminHeader
        title="Amenities"
        text="In-room facilities shown on each room page. Deleting one removes it from every room."
        action={
          <Button variant="sage" onClick={() => setEditing('new')}>
            Add Amenity
          </Button>
        }
      />
      {remove.error && <Alert className="mb-5">{remove.error.message}</Alert>}
      {amenities.isPending ? (
        <PageLoader className="min-h-[30svh]" />
      ) : amenities.isError ? (
        <Alert>{amenities.error.message}</Alert>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {amenities.data.map((amenity) => (
            <li
              key={amenity.id}
              className="flex flex-col items-center gap-3 rounded-lg bg-white p-5"
            >
              <MaskIcon name={amenity.icon} className="size-9 text-gold" />
              <p className="text-center text-sm font-semibold text-ink">{amenity.name}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-label={`Edit ${amenity.name}`}
                  onClick={() => setEditing(amenity)}
                  className="cursor-pointer p-1 text-sage hover:text-forest"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${amenity.name}`}
                  onClick={() => remove.mutate(amenity.id)}
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
        title={editing && editing !== 'new' ? `Edit ${editing.name}` : 'Add an amenity'}
      >
        {editing && (
          <AmenityEditor
            key={editing === 'new' ? 'new' : editing.id}
            amenity={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
    </>
  )
}
