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

  it('issues a patient activation code', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ code: '123456' }) })
    vi.stubGlobal('fetch', fetchMock)
    const client = new ConfianzaApiClient(new HttpClient('http://api.test/api/v1', { get: () => 'token', set: vi.fn() }))

    await client.issueAgentActivationCode()

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/integrations/agent/activation-code')
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST')
  })

  it('loads availability and sends appointment mutations to their real contracts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: 21 }) })
    vi.stubGlobal('fetch', fetchMock)
    const client = new ConfianzaApiClient(new HttpClient('http://api.test/api/v1', { get: () => 'token', set: vi.fn() }))

    await client.availability(7, 3, '2026-11-02')
    await client.createAppointment({ patient_id: 4, doctor_id: 7, service_id: 3, site_id: 1, starts_at: '2026-11-02T13:00:00Z', reason: 'Control' })
    await client.rescheduleAppointment(21, { starts_at: '2026-11-03T13:00:00Z', reason: 'Cambio de agenda' })
    await client.updateAppointmentStatus(21, 'cancelled')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://api.test/api/v1/availability?doctor_id=7&service_id=3&date=2026-11-02',
      'http://api.test/api/v1/appointments',
      'http://api.test/api/v1/appointments/21/reschedule',
      'http://api.test/api/v1/appointments/21/status',
    ])
    expect(JSON.parse(String((fetchMock.mock.calls[2][1] as RequestInit).body))).toEqual({ starts_at: '2026-11-03T13:00:00Z', reason: 'Cambio de agenda' })
    expect(JSON.parse(String((fetchMock.mock.calls[3][1] as RequestInit).body))).toEqual({ status: 'cancelled' })
  })

  it('sends a public patient registration request without an access token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ access_token: 'token' }) })
    vi.stubGlobal('fetch', fetchMock)
    const client = new ConfianzaApiClient(new HttpClient('http://api.test/api/v1', { get: () => null, set: vi.fn() }))
    const payload = { document_type: 'CC', document_number: '900', first_name: 'Ana', last_name: 'Prueba', birth_date: '1990-01-01', email: 'ana@nueva.demo', phone: '3000000', address: 'Calle 1', city: 'Bogotá', eps: 'EPS Test', emergency_name: 'Contacto', emergency_phone: '3000001', password: 'Password123!' }

    await client.register(payload)

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/auth/register')
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(request.method).toBe('POST')
    expect((new Headers(request.headers)).get('Authorization')).toBeNull()
    expect(request.body).toBe(JSON.stringify(payload))
  })
})
