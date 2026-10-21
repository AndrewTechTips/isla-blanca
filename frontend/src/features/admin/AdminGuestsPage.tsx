import { useState } from 'react'

import { Alert } from '@/components/ui/form'
import { PageLoader } from '@/components/ui/PageLoader'
import { Pagination } from '@/components/ui/Pagination'
import { tierCopy } from '@/data/club'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAdminUsers, useSetMembership } from '@/lib/api/queries/admin'
import type { MembershipTier, User } from '@/lib/api/types'
import { cn } from '@/lib/cn'
import { controlClass } from '@/lib/controlClass'

import { AdminHeader } from './AdminLayout'

const TIERS = Object.keys(tierCopy) as MembershipTier[]

/** Staff can move a guest to any tier; completed stays only ever move guests up. */
function TierSelect({ user }: { user: User }) {
  const setMembership = useSetMembership()
  const pending = setMembership.isPending && setMembership.variables?.userId === user.id

  return (
    <select
      aria-label={`Club tier for ${user.profile.full_name}`}
      value={pending ? setMembership.variables.tier : user.profile.membership_tier}
      disabled={pending}
      onChange={(event) =>
        setMembership.mutate({ userId: user.id, tier: event.target.value as MembershipTier })
      }
      className={cn(controlClass('light'), 'w-auto cursor-pointer py-1.5')}
    >
      {TIERS.map((tier) => (
        <option key={tier} value={tier}>
          {tierCopy[tier].name}
        </option>
      ))}
    </select>
  )
}

export function AdminGuestsPage() {
  usePageTitle('Guests')
  const [page, setPage] = useState(1)
  const users = useAdminUsers(page)

  return (
    <>
      <AdminHeader
        title="Guests"
        text="Everyone with an account, staff included. Club tiers rise on their own with completed stays; change one here when needed."
      />
      {users.isPending ? (
        <PageLoader className="min-h-[30svh]" />
      ) : users.isError ? (
        <Alert>{users.error.message}</Alert>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-lg bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/10 text-label font-semibold">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Membership</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.data.items.map((user) => (
                  <tr key={user.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-semibold text-ink">
                      {user.profile.full_name}
                      {user.role === 'admin' && (
                        <span className="ml-2 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold tracking-wider text-cream uppercase">
                          Staff
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.profile.country ?? '—'}</td>
                    <td className="px-4 py-2">
                      <TierSelect user={user} />
                    </td>
                    <td className="px-4 py-3">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={users.data.page}
            pages={users.data.pages}
            total={users.data.total}
            onChange={setPage}
          />
        </div>
      )}
    </>
  )
}
