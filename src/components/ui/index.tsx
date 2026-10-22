import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action}
    </header>
  )
}

export function Loading({ label = 'Cargando información persistida' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="skeleton-line" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">+</span>
      <strong>{title}</strong>
      <span>{text}</span>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <strong>No pudimos cargar esta vista</strong>
      <span>{message}</span>
      {onRetry && <button className="text-button" onClick={onRetry}>Intentar de nuevo <span>↗</span></button>}
    </div>
  )
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <p className="eyebrow">Nueva operación</p>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export function StatusBadge({ label, tone }: { label: string; tone: 'success' | 'warning' | 'muted' | 'info' | 'danger' }) {
  return <span className={`status-badge ${tone}`}><i aria-hidden="true" />{label}</span>
}

export function MetricCard({ label, value, note, tone = 'plain' }: { label: string; value: string | number; note: string; tone?: string }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function roleLabel(role: string) {
  return ({ admin: 'Administración', receptionist: 'Recepción', doctor: 'Equipo médico', patient: 'Paciente' } as Record<string, string>)[role] ?? role
}

export const statusLabels: Record<string, string> = {
  requested: 'Solicitada',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
}

export function statusTone(status: string): 'success' | 'warning' | 'muted' | 'info' | 'danger' {
  if (status === 'confirmed' || status === 'completed') return 'success'
  if (status === 'requested') return 'warning'
  if (status === 'cancelled') return 'muted'
  if (status === 'no_show') return 'danger'
  return 'info'
}
