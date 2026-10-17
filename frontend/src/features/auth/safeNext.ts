/**
 * The page to return to after signing in. Only in-app paths are accepted, so a crafted
 * link like `/login?next=https://evil.example` can't send the guest to another site.
 */
export function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null
  return next
}
