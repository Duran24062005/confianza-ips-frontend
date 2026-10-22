export type OpenApiSchema = {
  $ref?: string
  type?: string
  format?: string
  title?: string
  description?: string
  enum?: Array<string | number | boolean>
  properties?: Record<string, OpenApiSchema>
  required?: string[]
  items?: OpenApiSchema
  allOf?: OpenApiSchema[]
  oneOf?: OpenApiSchema[]
  anyOf?: OpenApiSchema[]
  nullable?: boolean
  default?: unknown
  example?: unknown
}

export type OpenApiParameter = {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required?: boolean
  description?: string
  schema?: OpenApiSchema
  example?: unknown
}

export type OpenApiMediaType = {
  schema?: OpenApiSchema
  example?: unknown
  examples?: Record<string, { summary?: string; value?: unknown }>
}

export type OpenApiOperation = {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: OpenApiParameter[]
  requestBody?: {
    required?: boolean
    description?: string
    content?: Record<string, OpenApiMediaType>
  }
  responses?: Record<string, {
    description?: string
    content?: Record<string, OpenApiMediaType>
  }>
  security?: Array<Record<string, string[]>>
}

export type OpenApiDocument = {
  openapi: string
  info?: { title?: string; version?: string; description?: string }
  paths: Record<string, Record<string, OpenApiOperation | undefined>>
  components?: { schemas?: Record<string, OpenApiSchema> }
}
