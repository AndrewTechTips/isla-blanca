import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Alert, Field } from '@/components/ui/form'
import { cn } from '@/lib/cn'
import { controlClass } from '@/lib/controlClass'
import { MaskIcon } from '@/components/ui/MaskIcon'
import { ApiError } from '@/lib/api/client'
import { useSaveRoom } from '@/lib/api/queries/admin'
import { useAmenities } from '@/lib/api/queries/catalog'
import type { BedType, RoomCreate, RoomDetail } from '@/lib/api/types'
import { photo } from '@/lib/images'

const BED_TYPES: BedType[] = ['single', 'double', 'queen', 'king']

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

interface RoomEditorProps {
  room?: RoomDetail
  onDone: () => void
}

/** Create or edit a room: details, photos (ordered, first is the cover) and amenities. */
export function RoomEditor({ room, onDone }: RoomEditorProps) {
  const id = useId()
  const save = useSaveRoom()
  const amenities = useAmenities()
  const [form, setForm] = useState({
    name: room?.name ?? '',
    slug: room?.slug ?? '',
    tagline: room?.tagline ?? '',
    description: room?.description ?? '',
    price_per_night: room?.price_per_night ?? '',
    size_m2: room?.size_m2 ?? 40,
    bed_type: room?.bed_type ?? ('queen' as BedType),
    max_guests: room?.max_guests ?? 2,
    panorama_url: room?.panorama_url ?? '',
    is_active: room?.is_active ?? true,
  })
  const [amenityIds, setAmenityIds] = useState<number[]>(room?.amenities.map((a) => a.id) ?? [])
  const [images, setImages] = useState(
    room?.images.map(({ url, alt_text }) => ({ url, alt_text })) ?? [{ url: '', alt_text: '' }],
  )
  const fields = save.error instanceof ApiError ? save.error.fields : {}

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const moveImage = (index: number, by: number) =>
    setImages((current) => {
      const next = [...current]
      const [image] = next.splice(index, 1)
      next.splice(index + by, 0, image)
      return next
    })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const data: RoomCreate = {
      ...form,
      slug: form.slug || slugify(form.name),
      price_per_night: String(form.price_per_night),
      panorama_url: form.panorama_url.trim() || null,
      amenity_ids: amenityIds,
      images: images.filter((image) => image.url.trim()),
    }
    // The slug is the room's public URL: it can't change once the room exists.
    const { slug: _slug, ...update } = data
    save.mutate({ id: room?.id, data: room ? update : data }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          label="URL slug"
          error={fields.slug}
          hint={room ? 'Fixed once the room exists.' : 'Leave empty to create it from the name.'}
        >
          <input
            id={`${id}-slug`}
            value={form.slug}
            placeholder={slugify(form.name)}
            disabled={Boolean(room)}
            onChange={(event) => set('slug', slugify(event.target.value))}
            className={controlClass('light', Boolean(fields.slug))}
          />
        </Field>
        <Field
          id={`${id}-tagline`}
          label="Tagline"
          error={fields.tagline}
          className="sm:col-span-2"
        >
          <input
            id={`${id}-tagline`}
            required
            maxLength={255}
            value={form.tagline}
            onChange={(event) => set('tagline', event.target.value)}
            className={controlClass('light', Boolean(fields.tagline))}
          />
        </Field>
        <Field
          id={`${id}-description`}
          label="Description"
          error={fields.description}
          className="sm:col-span-2"
        >
          <textarea
            id={`${id}-description`}
            required
            rows={4}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            className={controlClass('light', Boolean(fields.description))}
          />
        </Field>
        <Field id={`${id}-price`} label="Price per night (€)" error={fields.price_per_night}>
          <input
            id={`${id}-price`}
            type="number"
            required
            min={1}
            step="0.01"
            value={form.price_per_night}
            onChange={(event) => set('price_per_night', event.target.value)}
            className={controlClass('light', Boolean(fields.price_per_night))}
          />
        </Field>
        <Field id={`${id}-size`} label="Size (m²)" error={fields.size_m2}>
          <input
            id={`${id}-size`}
            type="number"
            required
            min={1}
            value={form.size_m2}
            onChange={(event) => set('size_m2', Number(event.target.value))}
            className={controlClass('light', Boolean(fields.size_m2))}
          />
        </Field>
        <Field id={`${id}-bed`} label="Bed">
          <select
            id={`${id}-bed`}
            value={form.bed_type}
            onChange={(event) => set('bed_type', event.target.value as BedType)}
            className={cn(controlClass('light'), 'capitalize')}
          >
            {BED_TYPES.map((bed) => (
              <option key={bed} value={bed}>
                {bed}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${id}-guests`} label="Max guests" error={fields.max_guests}>
          <input
            id={`${id}-guests`}
            type="number"
            required
            min={1}
            max={12}
            value={form.max_guests}
            onChange={(event) => set('max_guests', Number(event.target.value))}
            className={controlClass('light', Boolean(fields.max_guests))}
          />
        </Field>
        <Field
          id={`${id}-panorama`}
          label="360° panorama URL"
          hint="Optional, e.g. /images/sereno/panorama-360.jpg"
          className="sm:col-span-2"
        >
          <input
            id={`${id}-panorama`}
            value={form.panorama_url}
            onChange={(event) => set('panorama_url', event.target.value)}
            className={controlClass('light')}
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-label font-semibold">
          Photos (the first one is the cover)
        </legend>
        {images.map((image, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            {image.url ? (
              <img
                {...photo(image.url, '48px')}
                alt=""
                className="size-12 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="size-12 shrink-0 rounded bg-sand" />
            )}
            <input
              aria-label={`Photo ${index + 1} URL`}
              placeholder="/images/rooms/…"
              value={image.url}
              onChange={(event) =>
                setImages((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, url: event.target.value } : item,
                  ),
                )
              }
              className={controlClass('light')}
            />
            <input
              aria-label={`Photo ${index + 1} description`}
              placeholder="Description"
              required={Boolean(image.url)}
              value={image.alt_text}
              onChange={(event) =>
                setImages((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, alt_text: event.target.value } : item,
                  ),
                )
              }
              className={controlClass('light')}
            />
            <div className="flex shrink-0">
              <button
                type="button"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => moveImage(index, -1)}
                className="cursor-pointer p-2 disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={index === images.length - 1}
                onClick={() => moveImage(index, 1)}
                className="cursor-pointer p-2 disabled:opacity-30"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                className="cursor-pointer p-2 text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setImages((current) => [...current, { url: '', alt_text: '' }])}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gold-deep"
        >
          <Plus className="size-4" /> Add photo
        </button>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-label font-semibold">Amenities</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {amenities.data?.map((amenity) => (
            <label
              key={amenity.id}
              className="flex cursor-pointer items-center gap-3 rounded-[5px] border border-ink/10 bg-white px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                className="accent-[#b99a6b]"
                checked={amenityIds.includes(amenity.id)}
                onChange={() =>
                  setAmenityIds((current) =>
                    current.includes(amenity.id)
                      ? current.filter((a) => a !== amenity.id)
                      : [...current, amenity.id],
                  )
                }
              />
              <MaskIcon name={amenity.icon} className="size-5 text-gold" />
              {amenity.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          className="accent-[#b99a6b]"
          checked={form.is_active}
          onChange={(event) => set('is_active', event.target.checked)}
        />
        Visible to guests and bookable
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="sage" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : room ? 'Save Changes' : 'Add Room'}
        </Button>
      </div>
    </form>
  )
}
