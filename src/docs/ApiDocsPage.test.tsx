import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiDocsDetail, ApiDocsIndex, buildDocumentedOperations, filterOperations } from './ApiDocsPage'
import type { OpenApiDocument } from './openapi-types'

const openApiFixture: OpenApiDocument = {
  openapi: '3.1.0',
  info: { title: 'Confianza IPS API', version: '0.1.0' },
  paths: {
    '/health': { get: { operationId: 'health_health_get', tags: ['Sistema'], responses: { '200': { description: 'Servicio disponible' } } } },
    '/api/v1/auth/login': {
      post: {
        operationId: 'login_api_v1_auth_login_post',
        tags: ['Autenticación'],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { '200': { description: 'Token emitido', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } } },
      },
    },
  },
  components: { schemas: {
    LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } },
    TokenResponse: { type: 'object', properties: { access_token: { type: 'string' }, expires_in: { type: 'integer' } } },
  } },
}

function renderDocs(initialEntry: string) {
  return render(<MemoryRouter initialEntries={[initialEntry]}><Routes><Route path="/docs" element={<ApiDocsIndex />} /><Route path="/docs/:operationId" element={<ApiDocsDetail />} /></Routes></MemoryRouter>)
}

describe('API documentation pages', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })

  it('filters operations by method, domain and role', () => {
    const operations = buildDocumentedOperations(openApiFixture)
    expect(filterOperations(operations, { search: '', method: 'POST', domain: 'Autenticación', role: 'Público' }).map((item) => item.guide.operationId)).toEqual(['register_api_v1_auth_register_post', 'login_api_v1_auth_login_post'])
    expect(filterOperations(operations, { search: 'comprobar disponibilidad', method: '', domain: '', role: '' })).toHaveLength(1)
  })

  it('is public, navigates to an atomic detail and renders OpenAPI schemas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => openApiFixture })
    vi.stubGlobal('fetch', fetchMock)
    renderDocs('/docs')

    expect(await screen.findByRole('heading', { name: 'Documentación que cuida el contexto.' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: /comprobar disponibilidad/i }))
    expect(await screen.findByRole('heading', { name: 'Comprobar disponibilidad', level: 1 })).toBeInTheDocument()
  })

  it('renders detail navigation and copy controls without an Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => openApiFixture })
    vi.stubGlobal('fetch', fetchMock)
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderDocs('/docs/login_api_v1_auth_login_post')

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('email *')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar ruta' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('/api/v1/auth/login'))
    fireEvent.click(screen.getByRole('button', { name: 'Copiar JSON de entrada' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"email"')))
    expect(fetchMock.mock.calls[0][1]).not.toMatchObject({ headers: { Authorization: expect.anything() } })
  })

  it('shows an explicit contract error while retaining the editorial index', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fallo de red')))
    renderDocs('/docs')

    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible conectar con el contrato OpenAPI.')
    expect(screen.getAllByText('Comprobar disponibilidad').length).toBeGreaterThan(0)
  })
})
