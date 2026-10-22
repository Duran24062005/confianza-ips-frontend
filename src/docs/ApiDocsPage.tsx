import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { endpointGuides, endpointGuidesById, type EndpointGuide } from './endpoint-guides'
import type { OpenApiDocument, OpenApiOperation, OpenApiSchema } from './openapi-types'
import { OpenApiClient } from '../infrastructure/openapi-client'

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'PUT']
const openApiClient = new OpenApiClient()

type DocumentedOperation = {
  guide: EndpointGuide
  method: string
  path: string
  tag: string
  operation?: OpenApiOperation
}

type Filters = { search: string; method: string; domain: string; role: string }

export function filterOperations(operations: DocumentedOperation[], filters: Filters): DocumentedOperation[] {
  const query = filters.search.trim().toLocaleLowerCase('es')
  return operations.filter((item) => {
    const searchable = [item.guide.title, item.guide.operationId, item.path, item.tag, item.guide.domain].join(' ').toLocaleLowerCase('es')
    return (!query || searchable.includes(query)) &&
      (!filters.method || item.method === filters.method) &&
      (!filters.domain || item.guide.domain === filters.domain) &&
      (!filters.role || item.guide.roles.includes(filters.role))
  })
}

export function buildDocumentedOperations(document?: OpenApiDocument): DocumentedOperation[] {
  const runtimeOperations = new Map<string, { path: string; method: string; tag: string; operation: OpenApiOperation }>()
  if (document) {
    Object.entries(document.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem || {}).forEach(([method, operation]) => {
        if (!operation || !HTTP_METHODS.includes(method.toUpperCase()) || !operation.operationId) return
        runtimeOperations.set(operation.operationId, {
          path,
          method: method.toUpperCase(),
          tag: operation.tags?.[0] || 'Sin categoría',
          operation,
        })
      })
    })
  }

  return endpointGuides.map((guide) => {
    const runtime = runtimeOperations.get(guide.operationId)
    return {
      guide,
      path: runtime?.path || guide.fallbackPath,
      method: runtime?.method || guide.fallbackMethod,
      tag: runtime?.tag || guide.fallbackTag,
      operation: runtime?.operation,
    }
  })
}

export function ApiDocsIndex() {
  const { document, error, loading, retry } = useOpenApiDocument()
  const operations = useMemo(() => buildDocumentedOperations(document), [document])
  const [filters, setFilters] = useState<Filters>({ search: '', method: '', domain: '', role: '' })
  const filteredOperations = useMemo(() => filterOperations(operations, filters), [filters, operations])
  const domains = useMemo(() => [...new Set(operations.map((item) => item.guide.domain))], [operations])
  const roles = useMemo(() => [...new Set(operations.flatMap((item) => item.guide.roles))], [operations])

  return <DocsFrame document={document} error={error} loading={loading} retry={retry} operationCount={operations.length}>
    <div className="docs-catalog-layout">
      <aside className="docs-directory" aria-label="Índice de endpoints">
        <div className="docs-directory-heading"><p className="docs-kicker">Índice vivo</p><strong>{filteredOperations.length} fichas</strong></div>
        <div className="docs-directory-list">{groupOperations(filteredOperations).map(([domain, items]) => <div className="docs-domain-group" key={domain}><p>{domain}</p>{items.map((item) => <Link className="docs-directory-link" to={`/docs/${item.guide.operationId}`} key={item.guide.operationId}><MethodBadge method={item.method} compact /><span>{item.guide.title}</span></Link>)}</div>)}{filteredOperations.length === 0 && <p className="docs-muted">No hay endpoints que coincidan con estos filtros.</p>}</div>
      </aside>
      <section className="docs-catalog-main">
        <div className="docs-catalog-intro"><p className="docs-kicker">Documentación atómica</p><h1>El contrato, a simple vista.</h1><p>Una guía de operación para leer qué hace cada endpoint, quién puede usarlo y qué reglas protege. La ficha técnica se sincroniza con el OpenAPI del backend; la lectura funcional vive en este catálogo editorial.</p><div className="docs-fact-row"><span><strong>{operations.length}</strong> operaciones actuales</span><span><strong>{domains.length}</strong> dominios</span><span><strong>0</strong> mutaciones desde aquí</span></div></div>
        <DocsFilters filters={filters} domains={domains} roles={roles} onChange={setFilters} />
        <div className="docs-filter-note"><span className="pulse-dot" />Datos y ejemplos exclusivamente ficticios · modo lectura</div>
      </section>
    </div>
  </DocsFrame>
}

export function ApiDocsDetail() {
  const { operationId } = useParams<{ operationId: string }>()
  const { document, error, loading, retry } = useOpenApiDocument()
  const operations = useMemo(() => buildDocumentedOperations(document), [document])
  const operation = operations.find((item) => item.guide.operationId === operationId)
  const navigate = useNavigate()

  if (!loading && !operation) {
    return <DocsFrame document={document} error={error} loading={loading} retry={retry} operationCount={operations.length}><div className="docs-empty-detail"><p className="docs-kicker">404 / FICHA NO ENCONTRADA</p><h1>Ese endpoint aún no tiene mapa.</h1><p>Verifica el operationId o regresa al índice para explorar las fichas disponibles.</p><Link className="primary-button compact" to="/docs">Volver al índice <span>→</span></Link></div></DocsFrame>
  }
  if (!operation) return <DocsFrame document={document} error={error} loading={loading} retry={retry} operationCount={operations.length}><div className="loading-state"><span className="spinner" /> Cargando contrato técnico…</div></DocsFrame>

  return <DocsFrame document={document} error={error} loading={loading} retry={retry} operationCount={operations.length}>
    <article className="docs-detail">
      <div className="docs-breadcrumb"><Link to="/docs">Documentación API</Link><span>/</span><span>{operation.guide.domain}</span><span>/</span><strong>{operation.guide.operationId}</strong></div>
      <header className="docs-detail-header"><div><div className="docs-detail-method"><MethodBadge method={operation.method} /><span>{operation.tag}</span></div><h1>{operation.guide.title}</h1><p className="docs-detail-subtitle">{operation.guide.objective}</p></div><button className="secondary-button compact" onClick={() => navigate('/docs')}>← Índice</button></header>
      <div className="docs-detail-grid">
        <main className="docs-prd">
          <PrdSection number="01" title="Nombre y objetivo"><h2>{operation.guide.title}</h2><p>{operation.guide.objective}</p></PrdSection>
          <PrdSection number="02" title="Problema que resuelve"><p>{operation.guide.problem}</p></PrdSection>
          <PrdSection number="03" title="Actor autorizado"><RoleList roles={operation.guide.roles} /></PrdSection>
          <PrdSection number="04" title="Autenticación requerida"><p>{operation.guide.authentication}</p><div className="docs-security-note"><span>◇</span>La autorización efectiva siempre se decide en el backend.</div></PrdSection>
          <PrdSection number="05" title="Método y ruta"><div className="docs-route-line"><MethodBadge method={operation.method} /><code>{operation.path}</code><CopyButton value={operation.path} label="Copiar ruta" /></div><p className="docs-operation-id">operationId · {operation.guide.operationId}</p></PrdSection>
          <PrdSection number="06" title="Parámetros de path/query"><ParametersTable operation={operation.operation} /></PrdSection>
          <PrdSection number="07" title="Payload de entrada"><RequestBody operation={operation.operation} example={operation.guide.exampleRequest} document={document} /></PrdSection>
          <PrdSection number="08" title="Validaciones y reglas de negocio"><BulletList items={[...operation.guide.preconditions, ...operation.guide.rules]} /></PrdSection>
          <PrdSection number="09" title="Respuesta exitosa"><ResponseTable operation={operation.operation} document={document} successOnly /></PrdSection>
          <PrdSection number="10" title="Errores esperados"><BulletList items={operation.guide.errors} /></PrdSection>
          <PrdSection number="11" title="Efectos secundarios y auditoría"><BulletList items={operation.guide.effects} /></PrdSection>
          <PrdSection number="12" title="Ejemplo de solicitud"><CodeBlock value={operation.guide.exampleRequest} label="Copiar ejemplo de solicitud" /></PrdSection>
          <PrdSection number="13" title="Ejemplo de respuesta"><CodeBlock value={operation.guide.exampleResponse} label="Copiar ejemplo de respuesta" /></PrdSection>
          <PrdSection number="14" title="Relación con otros endpoints"><RelatedEndpoints operationIds={operation.guide.related} /></PrdSection>
        </main>
        <aside className="docs-detail-aside"><div className="docs-aside-card docs-aside-dark"><p className="docs-kicker">Ficha técnica</p><strong>{operation.method}</strong><code>{operation.path}</code><span>{operation.tag}</span></div><div className="docs-aside-card"><p className="docs-kicker">Audiencia</p><RoleList roles={operation.guide.roles} compact /><p className="docs-aside-foot">Contrato {document?.info?.version || 'OpenAPI vivo'} · solo lectura</p></div></aside>
      </div>
    </article>
  </DocsFrame>
}

function DocsFrame({ children, document, error, loading, retry, operationCount }: { children: React.ReactNode; document?: OpenApiDocument; error: Error | null; loading: boolean; retry: () => void; operationCount: number }) {
  return <main className="docs-page"><header className="docs-header"><div className="docs-header-top"><Link className="docs-brand" to="/"><span>c</span><strong>confianza</strong><small>IPS · API ATLAS</small></Link><div className="docs-header-actions"><Link to="/">Volver al sistema</Link><span className="docs-readonly">Solo lectura</span></div></div><div className="docs-hero"><div><p className="docs-kicker">Confianza IPS / Contrato operativo</p><h1>Documentación que cuida el contexto.</h1><p>La API explicada endpoint por endpoint, con reglas de negocio, permisos y ejemplos ficticios para que cada integración sea entendible antes de tocar datos.</p></div><div className="docs-stat-card"><span className="docs-kicker">Mapa actual</span><strong>{operationCount}</strong><span>operaciones documentadas</span><i>OPENAPI · PRD</i></div></div></header><div className="docs-contract-status" role={error ? 'alert' : undefined}>{loading ? <><span className="spinner" /> Sincronizando contrato técnico…</> : error ? <><span className="docs-status-dot danger" />{error.message}<button className="text-button" onClick={retry}>Reintentar <span>↗</span></button></> : <><span className="docs-status-dot" />Contrato OpenAPI vivo · {document?.info?.version || 'versión detectada'} · {operationCount} fichas cubiertas</>}</div><div className="docs-content">{children}</div><footer className="docs-footer"><span>Confianza IPS · entorno ficticio</span><span>Sin credenciales reales · sin ejecución de operaciones</span></footer></main>
}

function useOpenApiDocument() {
  const [document, setDocument] = useState<OpenApiDocument>()
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    openApiClient.load(controller.signal).then((value) => { setDocument(value); setError(null) }).catch((reason) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason : new Error('No se pudo cargar el contrato OpenAPI.')) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])
  return { document, error, loading, retry: () => setAttempt((value) => value + 1) }
}

function DocsFilters({ filters, domains, roles, onChange }: { filters: Filters; domains: string[]; roles: string[]; onChange: (filters: Filters) => void }) {
  return <div className="docs-filters"><label><span>Buscar</span><input value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Nombre, ruta, tag u operationId" /></label><label><span>Método</span><select value={filters.method} onChange={(event) => onChange({ ...filters, method: event.target.value })}><option value="">Todos</option>{HTTP_METHODS.map((method) => <option key={method}>{method}</option>)}</select></label><label><span>Dominio</span><select value={filters.domain} onChange={(event) => onChange({ ...filters, domain: event.target.value })}><option value="">Todos</option>{domains.map((domain) => <option key={domain}>{domain}</option>)}</select></label><label><span>Rol</span><select value={filters.role} onChange={(event) => onChange({ ...filters, role: event.target.value })}><option value="">Todos</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label></div>
}

function PrdSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="docs-prd-section"><div className="docs-prd-heading"><span>{number}</span><h2>{title}</h2></div><div className="docs-prd-body">{children}</div></section>
}

function MethodBadge({ method, compact = false }: { method: string; compact?: boolean }) { return <span className={`docs-method docs-method-${method.toLowerCase()}${compact ? ' compact' : ''}`}>{method}</span> }
function RoleList({ roles, compact = false }: { roles: string[]; compact?: boolean }) { return <div className={`docs-role-list${compact ? ' compact' : ''}`}>{roles.map((role) => <span key={role}>{role}</span>)}</div> }
function BulletList({ items }: { items: string[] }) { return <ul className="docs-bullet-list">{items.map((item) => <li key={item}>{item}</li>)}</ul> }

function ParametersTable({ operation }: { operation?: OpenApiOperation }) {
  const parameters = operation?.parameters || []
  if (parameters.length === 0) return <p className="docs-muted">Este endpoint no declara parámetros de path ni query.</p>
  return <div className="docs-table-wrap"><table className="docs-table"><thead><tr><th>Nombre</th><th>Ubicación</th><th>Requerido</th><th>Tipo</th><th>Descripción</th></tr></thead><tbody>{parameters.map((parameter) => <tr key={`${parameter.in}-${parameter.name}`}><td><code>{parameter.name}</code></td><td>{parameter.in}</td><td>{parameter.required ? 'Sí' : 'No'}</td><td>{formatSchema(parameter.schema)}</td><td>{parameter.description || 'Sin descripción en el contrato.'}</td></tr>)}</tbody></table></div>
}

function RequestBody({ operation, example, document }: { operation?: OpenApiOperation; example: string; document?: OpenApiDocument }) {
  const media = firstMedia(operation?.requestBody?.content)
  const jsonPayload = extractJsonPayload(example)
  return <div className="docs-payload"><div><p>{operation?.requestBody?.description || 'Este endpoint no declara un cuerpo requerido en OpenAPI.'}</p>{media?.schema && <SchemaTable schema={media.schema} document={document} />}</div><CodeBlock value={jsonPayload || example} label={jsonPayload ? 'Copiar JSON de entrada' : 'Copiar ejemplo de solicitud'} /></div>
}

function ResponseTable({ operation, document, successOnly = false }: { operation?: OpenApiOperation; document?: OpenApiDocument; successOnly?: boolean }) {
  const responses = Object.entries(operation?.responses || {}).filter(([code]) => !successOnly || code.startsWith('2'))
  if (responses.length === 0) return <p className="docs-muted">El contrato técnico aún no describe una respuesta exitosa.</p>
  return <div className="docs-table-wrap"><table className="docs-table"><thead><tr><th>HTTP</th><th>Descripción</th><th>Schema</th></tr></thead><tbody>{responses.map(([code, response]) => <tr key={code}><td><span className="docs-code-status">{code}</span></td><td>{response?.description || 'Sin descripción.'}</td><td>{response?.content && <SchemaTable schema={firstMedia(response.content)?.schema} document={document} />}</td></tr>)}</tbody></table></div>
}

function SchemaTable({ schema, document }: { schema?: OpenApiSchema; document?: OpenApiDocument }) {
  const resolved = resolveSchema(schema, document)
  if (!resolved) return <span className="docs-muted">Sin schema declarado.</span>
  if (resolved.properties) return <div className="docs-schema-list">{Object.entries(resolved.properties).map(([name, property]) => <div className="docs-schema-row" key={name}><code>{name}{resolved.required?.includes(name) ? ' *' : ''}</code><span>{formatSchema(property, document)}</span><small>{property.description || 'Campo del contrato OpenAPI.'}</small></div>)}</div>
  return <code>{formatSchema(resolved, document)}</code>
}

function RelatedEndpoints({ operationIds }: { operationIds: string[] }) {
  if (operationIds.length === 0) return <p className="docs-muted">No hay relaciones editoriales definidas.</p>
  return <div className="docs-related-list">{operationIds.map((operationId) => <Link to={`/docs/${operationId}`} key={operationId}>{endpointGuidesById[operationId]?.title || operationId}<span>↗</span></Link>)}</div>
}

function CodeBlock({ value, label }: { value: string; label: string }) { return <div className="docs-code-block"><div className="docs-code-toolbar"><span>Ejemplo ficticio</span><CopyButton value={value} label={label} /></div><pre><code>{value}</code></pre></div> }
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return <button className="docs-copy-button" onClick={copy}>{copied ? 'Copiado' : label}</button>
}

function firstMedia(content?: Record<string, { schema?: OpenApiSchema; example?: unknown; examples?: Record<string, { summary?: string; value?: unknown }> }>) { return content ? Object.values(content)[0] : undefined }
function resolveSchema(schema?: OpenApiSchema, document?: OpenApiDocument): OpenApiSchema | undefined {
  if (!schema?.$ref) return schema
  const name = schema.$ref.split('/').pop()
  return name ? document?.components?.schemas?.[name] : undefined
}
function formatSchema(schema?: OpenApiSchema, document?: OpenApiDocument): string {
  const resolved = resolveSchema(schema, document)
  if (!resolved) return '—'
  if (resolved.$ref) return resolved.$ref.split('/').pop() || 'object'
  if (resolved.type === 'array') return `array<${formatSchema(resolved.items, document)}>`
  if (resolved.enum) return resolved.enum.join(' | ')
  return [resolved.type || 'object', resolved.format].filter(Boolean).join(' · ')
}
function extractJsonPayload(example: string): string | undefined {
  const match = example.match(/-d '([\s\S]*?)'/)
  if (!match) return undefined
  try { return JSON.stringify(JSON.parse(match[1]), null, 2) } catch { return match[1] }
}
function groupOperations(operations: DocumentedOperation[]) {
  const groups = new Map<string, DocumentedOperation[]>()
  operations.forEach((operation) => { const current = groups.get(operation.guide.domain) || []; current.push(operation); groups.set(operation.guide.domain, current) })
  return [...groups.entries()]
}
