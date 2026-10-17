import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Alert } from '@/components/ui/form'
import { PageLoader } from '@/components/ui/PageLoader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAdminRooms, useDeleteRoom } from '@/lib/api/queries/admin'
import type { RoomDetail } from '@/lib/api/types'
import { cn } from '@/lib/cn'
import { formatGuests, formatPrice } from '@/lib/format'

import { AdminHeader } from './AdminLayout'
import { RoomEditor } from './RoomEditor'

type Editing = { mode: 'create' } | { mode: 'edit'; room: RoomDetail } | null

function DeleteRoom({ room, onClose }: { room: RoomDetail; onClose: () => void }) {
  const remove = useDeleteRoom()
  return (
    <div className="space-y-5">
      <p>
        Delete <strong className="text-ink">{room.name}</strong> and its photos? Rooms that were
        ever booked can’t be deleted; hide them from guests instead.
      </p>
      {remove.error && <Alert>{remove.error.message}</Alert>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Keep Room
        </Button>
        <Button
          variant="gold"
          disabled={remove.isPending}
          onClick={() => remove.mutate(room.id, { onSuccess: onClose })}
        >
          {remove.isPending ? 'Deleting…' : 'Delete Room'}
        </Button>
      </div>
    </div>
  )
}

export function AdminRoomsPage() {
  usePageTitle('Rooms')
  const rooms = useAdminRooms()
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<RoomDetail | null>(null)

  return (
    <>
      <AdminHeader
        title="Rooms"
        text="Suites and villas, their photos and amenities."
        action={
          <Button variant="sage" onClick={() => setEditing({ mode: 'create' })}>
            Add Room
          </Button>
        }
      />
      {rooms.isPending ? (
        <PageLoader className="min-h-[30svh]" />
      ) : rooms.isError ? (
        <Alert>{rooms.error.message}</Alert>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rooms.data.map((room) => (
            <li
              key={room.id}
              className={cn(
                'flex gap-4 overflow-hidden rounded-lg bg-white',
                !room.is_active && 'opacity-60',
              )}
            >
              {room.cover_image && (
                <img src={room.cover_image} alt="" className="w-32 shrink-0 object-cover" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-4 pr-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-serif text-xl font-bold text-ink">
                    <Link to={`/rooms/${room.slug}`} className="hover:text-gold">
                      {room.name}
                    </Link>
                  </h2>
                  {!room.is_active && (
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-sm">
                  {formatPrice(room.price_per_night)} / night · {room.size_m2}m² ·{' '}
                  {formatGuests(room.max_guests)}
                </p>
                <p className="text-xs">
                  {room.images.length} photos · {room.amenities.length} amenities
                  {room.panorama_url && ' · 360° tour'}
                </p>
                <div className="mt-auto flex gap-4 pt-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditing({ mode: 'edit', room })}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sage hover:text-forest"
                  >
                    <Pencil className="size-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(room)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-red-700 hover:text-red-900"
                  >
                    <Trash2 className="size-4" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.mode === 'edit' ? `Edit ${editing.room.name}` : 'Add a room'}
        size="lg"
      >
        {editing && (
          <RoomEditor
            key={editing.mode === 'edit' ? editing.room.id : 'new'}
            room={editing.mode === 'edit' ? editing.room : undefined}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
      <Dialog open={deleting !== null} onClose={() => setDeleting(null)} title="Delete room?">
        {deleting && <DeleteRoom room={deleting} onClose={() => setDeleting(null)} />}
      </Dialog>
    </>
  )
}
