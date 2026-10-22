import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, HttpClient } from './http-client'

describe('HttpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the in-memory bearer token with requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const tokenStore = { get: () => 'access-token', set: vi.fn() }
    const client = new HttpClient('http://localhost:8000/api/v1', tokenStore)

    await client.request('/auth/me')

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/v1/auth/me')
    expect((requestInit.headers as Headers).get('Authorization')).toBe('Bearer access-token')
  })

  it('preserves the backend error code for operational failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ code: 'DATABASE_NOT_READY', detail: 'Aplica migraciones' }),
    }))
    const tokenStore = { get: () => null, set: vi.fn() }
    const client = new HttpClient('http://localhost:8000/api/v1', tokenStore)

    const request = client.request('/auth/login', { method: 'POST' })

    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 503, code: 'DATABASE_NOT_READY' })
  })
})
