import { useState } from 'react'

import { Alert } from '@/components/ui/form'
import { PageLoader } from '@/components/ui/PageLoader'
import { Pagination } from '@/components/ui/Pagination'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAdminUsers } from '@/lib/api/queries/admin'

import { AdminHeader } from './AdminLayout'

export function AdminGuestsPage() {
  usePageTitle('Guests')
  const [page, setPage] = useState(1)
  const users = useAdminUsers(page)

  return (
    <>
      <AdminHeader title="Guests" text="Everyone with an account, staff included." />
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
                    <td className="px-4 py-3 capitalize">{user.profile.membership_tier}</td>
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
