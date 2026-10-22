import { useEffect, useState } from 'react'
import { api } from '../../infrastructure/composition'
import { EmptyState, ErrorState, formatDateTime, PageHeader } from '../../components/ui'
import type { AuditEvent } from '../../domain/models'

export function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  async function load() { setLoading(true); setError(''); try { setEvents(await api.audit()) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cargar la auditoría') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  return <><PageHeader eyebrow="Trazabilidad institucional" title="Auditoría" subtitle="Una línea de tiempo de las operaciones importantes." />{error ? <ErrorState message={error} onRetry={() => void load()} /> : <section className="surface audit-panel"><div className="table-toolbar"><div><p className="eyebrow">Eventos recientes</p><h2>Registro persistido</h2></div><span className="panel-note">Solo administración</span></div>{loading ? <div className="table-skeleton" /> : <div className="audit-list">{events.map((event) => <div className="audit-row" key={event.id}><span className="audit-marker" /><div><strong>{event.action.replace('_', ' ')}</strong><span>{event.resource_type} · #{event.resource_id}</span></div><time>{formatDateTime(event.created_at)}</time></div>)}{events.length === 0 && <EmptyState title="Sin eventos todavía" text="Las operaciones relevantes aparecerán aquí." />}</div>}</section>}</>
}
