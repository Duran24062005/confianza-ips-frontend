import type { OpenApiDocument } from '../docs/openapi-types'

export interface OpenApiDocumentReader {
  load(signal?: AbortSignal): Promise<OpenApiDocument>
}
