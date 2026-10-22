import { afterEach, describe, expect, it, vi } from 'vitest'
import { OpenApiClient, OpenApiDocumentError, resolveOpenApiUrl } from './openapi-client'

describe('OpenApiClient', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('derives the public contract URL from the operational API base', () => {
    expect(resolveOpenApiUrl('https://api.example.demo/api/v1')).toBe('https://api.example.demo/openapi.json')
  })

  it('loads OpenAPI without sending an operational bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ openapi: '3.1.0', paths: {} }) })
    vi.stubGlobal('fetch', fetchMock)

    await new OpenApiClient('https://api.example.demo/openapi.json').load()

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit
    const headers = new Headers(requestInit.headers)
    expect(headers.get('Authorization')).toBeNull()
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('reports HTTP and JSON contract failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }))
    await expect(new OpenApiClient('https://api.example.demo/openapi.json').load()).rejects.toMatchObject({ status: 503 })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json') } }))
    await expect(new OpenApiClient('https://api.example.demo/openapi.json').load()).rejects.toBeInstanceOf(OpenApiDocumentError)
  })

  it('reports a timeout when the contract does not answer', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_: string, init?: RequestInit) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))))
    const request = new OpenApiClient('https://api.example.demo/openapi.json').load()
    const rejection = expect(request).rejects.toThrow('tiempo de espera')

    await vi.advanceTimersByTimeAsync(10_001)
    await rejection
  })
})
