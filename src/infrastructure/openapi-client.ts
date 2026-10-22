import type { OpenApiDocument } from '../docs/openapi-types'
import type { OpenApiDocumentReader } from '../application/openapi-document-reader'

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'
const REQUEST_TIMEOUT_MS = 10_000

export class OpenApiDocumentError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'OpenApiDocumentError'
  }
}

export function resolveOpenApiUrl(apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL): string {
  const normalizedBase = apiBaseUrl.replace(/\/$/, '')
  const apiPathIndex = normalizedBase.lastIndexOf('/api/v1')
  const origin = apiPathIndex >= 0 ? normalizedBase.slice(0, apiPathIndex) : normalizedBase
  return `${origin || window.location.origin}/openapi.json`
}

export class OpenApiClient implements OpenApiDocumentReader {
  constructor(private readonly openApiUrl = resolveOpenApiUrl()) {}

  async load(signal?: AbortSignal): Promise<OpenApiDocument> {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const abort = () => controller.abort()
    signal?.addEventListener('abort', abort, { once: true })

    try {
      const response = await fetch(this.openApiUrl, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new OpenApiDocumentError(`No se pudo cargar el contrato OpenAPI (${response.status}).`, response.status)
      }

      let document: unknown
      try {
        document = await response.json()
      } catch {
        throw new OpenApiDocumentError('El contrato OpenAPI respondió con JSON inválido.')
      }
      if (!isOpenApiDocument(document)) {
        throw new OpenApiDocumentError('La respuesta no tiene la estructura esperada de OpenAPI.')
      }
      return document
    } catch (reason) {
      if (reason instanceof OpenApiDocumentError) throw reason
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        throw new OpenApiDocumentError('La carga del contrato OpenAPI excedió el tiempo de espera.')
      }
      throw new OpenApiDocumentError('No fue posible conectar con el contrato OpenAPI.')
    } finally {
      window.clearTimeout(timeout)
      signal?.removeEventListener('abort', abort)
    }
  }
}

function isOpenApiDocument(value: unknown): value is OpenApiDocument {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { openapi?: unknown; paths?: unknown }
  return typeof candidate.openapi === 'string' && Boolean(candidate.paths) && typeof candidate.paths === 'object'
}
