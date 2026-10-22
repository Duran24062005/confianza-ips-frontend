import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfianzaApiClient } from './confianza-api'
import { HttpClient } from './http-client'

describe('ConfianzaApiClient analytics and profile contracts', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('requests the selected persisted analytics period', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ scope: 'global' }) })
    vi.stubGlobal('fetch', fetchMock)
    const client = new ConfianzaApiClient(new HttpClient('http://api.test/api/v1', { get: () => 'token', set: vi.fn() }))

    await client.analytics(7)

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/dashboard/analytics?days=7')
  })

  it('updates the authenticated user through the profile contract', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ full_name: 'Ana Actualizada' }) })
    vi.stubGlobal('fetch', fetchMock)
    const client = new ConfianzaApiClient(new HttpClient('http://api.test/api/v1', { get: () => 'token', set: vi.fn() }))

    await client.updateMe({ full_name: 'Ana Actualizada' })

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/auth/me')
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('PATCH')
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBe(JSON.stringify({ full_name: 'Ana Actualizada' }))
  })
})
