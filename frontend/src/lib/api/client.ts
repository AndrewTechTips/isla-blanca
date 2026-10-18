import createClient, { type Middleware } from 'openapi-fetch'

import type { paths } from './schema'
import { tokenStore } from './token'

/**
 * API origin in production (e.g. https://isla-blanca-api.onrender.com). In development the
 * site's own origin, where Vite proxies /api to the backend.
 */
const BASE_URL = import.meta.env.VITE_API_URL || window.location.origin

interface ErrorBody {
  detail?: string | { msg: string; loc: (string | number)[] }[]
  code?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  /** Field-level messages from request validation (422), keyed by field name. */
  readonly fields: Record<string, string>

  constructor(status: number, body: ErrorBody | undefined) {
    const detail = body?.detail
    const fields: Record<string, string> = {}
    if (Array.isArray(detail)) {
      for (const error of detail) fields[String(error.loc.at(-1))] = error.msg
    }
    super(
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? 'Please check the highlighted fields.'
          : 'Something went wrong. Please try again.',
    )
    this.status = status
    this.code = body?.code
    this.fields = fields
  }
}

const auth: Middleware = {
  onRequest({ request }) {
    const token = tokenStore.get()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
  onResponse({ request, response }) {
    // An expired or revoked token: drop it so the app shows the signed-out state.
    if (response.status === 401 && request.headers.has('Authorization')) tokenStore.set(null)
    return response
  },
}

export const client = createClient<paths>({
  baseUrl: BASE_URL,
  // Look fetch up on every call (not once at startup), so tests and tools can replace it.
  fetch: (request) => globalThis.fetch(request),
})
client.use(auth)

/** Returns the data of an openapi-fetch result, or throws an ApiError. */
export async function unwrap<T>(
  call: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await call
  if (!response.ok) throw new ApiError(response.status, error as ErrorBody | undefined)
  return data as T
}
