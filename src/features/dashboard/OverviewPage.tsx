import { useEffect, useState } from 'react'
import type { User } from '../../domain/models'
import { api } from '../../infrastructure/composition'
import { ServiceChart, StatusChart, TrendChart } from '../../components/charts/AnalyticsCharts'
import { ErrorState, MetricCard, PageHeader } from '../../components/ui'

type Period = 7 | 30 | 90

function metricValue(value: number | null, suffix = '') {
  return value === null ? 'Sin datos' : `${value}${suffix}`
}

export function OverviewPage({ user }: { user: User }) {
  const [period, setPeriod] = useState<Period>(30)
  const [data, setData] = useState<Awaited<ReturnType<typeof api.analytics>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(selectedPeriod: Period) {
    setLoading(true)
    setError('')
    try { setData(await api.analytics(selectedPeriod)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cargar el resumen operativo') } finally { setLoading(false) }
  }

  useEffect(() => { void load(period) }, [period])

  const summary = data?.summary
  const isGlobal = data?.scope === 'global'
  const metrics = isGlobal ? [
    { label: 'Pacientes activos', value: metricValue(summary?.active_patients ?? null), note: 'Población vigente', tone: 'teal' },
    { label: 'Citas para hoy', value: summary?.appointments_today ?? 0, note: 'Agenda institucional', tone: 'blue' },
    { label: 'Pendientes', value: summary?.pending_appointments ?? 0, note: 'Requieren confirmación', tone: 'amber' },
    { label: 'Asistencia', value: metricValue(summary?.attendance_rate ?? null, '%'), note: 'Completadas vs. no asistidas', tone: 'ink' },
  ] : user.role === 'doctor' ? [
    { label: 'Citas para hoy', value: summary?.appointments_today ?? 0, note: 'Tu agenda clínica', tone: 'teal' },
    { label: 'Próximas atenciones', value: summary?.upcoming_appointments ?? 0, note: 'Solicitadas o confirmadas', tone: 'blue' },
    { label: 'Completadas', value: summary?.completed_appointments ?? 0, note: `En ${period} días`, tone: 'amber' },
    { label: 'Asistencia', value: metricValue(summary?.attendance_rate ?? null, '%'), note: 'Tu actividad clínica', tone: 'ink' },
  ] : [
    { label: 'Próximas citas', value: summary?.upcoming_appointments ?? 0, note: 'Tu agenda vigente', tone: 'teal' },
    { label: 'Citas para hoy', value: summary?.appointments_today ?? 0, note: 'Atenciones del día', tone: 'blue' },
    { label: 'Confirmadas', value: summary?.confirmed_appointments ?? 0, note: `En ${period} días`, tone: 'amber' },
    { label: 'Asistencia', value: metricValue(summary?.attendance_rate ?? null, '%'), note: 'Tu historial', tone: 'ink' },
  ]

  return <>
    <PageHeader eyebrow={isGlobal ? 'Lectura institucional' : 'Tu actividad'} title={isGlobal ? 'Resumen operativo' : `Hola, ${user.full_name.split(' ')[0]}`} subtitle={isGlobal ? 'La sede central, vista con datos persistidos y una lectura útil del periodo.' : 'Una lectura breve de tus citas y actividad dentro de Confianza IPS.'} action={<div className="period-picker" aria-label="Periodo de métricas">{([7, 30, 90] as Period[]).map((item) => <button key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item} días</button>)}</div>} />
    {loading ? <div className="dashboard-loading"><div /><div /><div /><div /></div> : error ? <ErrorState message={error} onRetry={() => void load(period)} /> : data && <>
      <section className="metric-grid">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>
      <section className="dashboard-grid">
        <article className="surface chart-panel chart-panel-large"><div className="panel-heading"><div><p className="eyebrow">Ritmo de atención</p><h2>Actividad por día</h2></div><span className="panel-note">Últimos {period} días</span></div><TrendChart data={data.trend} /></article>
        <article className="surface chart-panel"><div className="panel-heading"><div><p className="eyebrow">Distribución</p><h2>Estados de cita</h2></div></div><StatusChart data={data.status_breakdown} /></article>
        <article className="surface chart-panel"><div className="panel-heading"><div><p className="eyebrow">Demanda registrada</p><h2>Servicios</h2></div></div><ServiceChart data={data.service_breakdown} /></article>
        <article className="surface insight-panel"><p className="eyebrow">Lectura de operación</p><h2>{isGlobal ? 'La agenda pide precisión.' : 'Tu actividad, en contexto.'}</h2><p>{isGlobal ? 'Usa las solicitudes pendientes como punto de partida para ordenar la jornada y proteger los tiempos de atención.' : 'Este resumen se construye únicamente con las citas persistidas que corresponden a tu rol.'}</p><span className="insight-rule" /></article>
      </section>
    </>}
  </>
}
