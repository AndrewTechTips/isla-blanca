import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, client, unwrap } from './client'
import { tokenStore } from './token'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => {
  vi.unstubAllGlobals()
  tokenStore.set(null)
})

describe('ApiError', () => {
  it('uses the API message and code', () => {
    const error = new ApiError(409, { detail: 'Room already booked.', code: 'room_unavailable' })
    expect(error.message).toBe('Room already booked.')
    expect(error.code).toBe('room_unavailable')
  })

  it('maps validation errors to fields', () => {
    const error = new ApiError(422, {
      detail: [
        { msg: 'String should have at least 8 characters', loc: ['body', 'password'] },
        { msg: 'value is not a valid email address', loc: ['body', 'email'] },
      ],
    })
    expect(error.fields).toEqual({
      password: 'String should have at least 8 characters',
      email: 'value is not a valid email address',
    })
    expect(error.message).toBe('Please check the highlighted fields.')
  })
})

describe('client', () => {
  it('sends the bearer token and unwraps data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, [{ id: 1, slug: 'wifi' }]))
    vi.stubGlobal('fetch', fetchMock)
    tokenStore.set('secret-token')

    const data = await unwrap(client.GET('/api/v1/amenities'))

    expect(data).toEqual([{ id: 1, slug: 'wifi' }])
    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.headers.get('Authorization')).toBe('Bearer secret-token')
  })

  it('throws ApiError and signs out when the token is rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          json(401, { detail: 'Sign in to continue.', code: 'not_authenticated' }),
        ),
    )
    tokenStore.set('expired-token')

    await expect(unwrap(client.GET('/api/v1/auth/me'))).rejects.toMatchObject({
      status: 401,
      code: 'not_authenticated',
    })
    expect(tokenStore.get()).toBeNull()
  })
})
