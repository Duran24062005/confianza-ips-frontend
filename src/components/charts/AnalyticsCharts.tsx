import type { DashboardAnalytics, DashboardTrendPoint } from '../../domain/models'
import { EmptyState } from '../ui'

function chartPoints(data: DashboardTrendPoint[], width: number, height: number, padding: number) {
  const max = Math.max(...data.map((item) => item.total), 1)
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0
  return data.map((item, index) => ({
    x: padding + index * step,
    y: height - padding - (item.total / max) * (height - padding * 2),
    ...item,
  }))
}

function AccessibleDataTable({ data }: { data: DashboardTrendPoint[] }) {
  return (
    <details className="data-details">
      <summary>Ver datos de la gráfica</summary>
      <div className="data-table-scroll">
        <table className="accessible-table">
          <thead><tr><th>Fecha</th><th>Total</th><th>Confirmadas</th><th>Completadas</th></tr></thead>
          <tbody>{data.map((item) => <tr key={item.date}><td>{item.date}</td><td>{item.total}</td><td>{item.confirmed}</td><td>{item.completed}</td></tr>)}</tbody>
        </table>
      </div>
    </details>
  )
}

export function TrendChart({ data }: { data: DashboardTrendPoint[] }) {
  if (!data.some((item) => item.total > 0)) return <EmptyState title="Sin actividad en el periodo" text="Las citas persistidas aparecerán aquí cuando existan registros." />
  const width = 720
  const height = 260
  const points = chartPoints(data, width, height, 24)
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const area = `${path} L ${points.at(-1)?.x ?? width - 24} ${height - 24} L 24 ${height - 24} Z`
  return (
    <div className="chart-wrap">
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="trend-title trend-desc">
        <title id="trend-title">Evolución de citas</title>
        <desc id="trend-desc">Total de citas por día en el periodo seleccionado.</desc>
        <path className="chart-grid-line" d={`M24 ${height - 24}H${width - 24}`} />
        <path className="chart-area" d={area} />
        <path className="chart-line" d={path} />
        {points.filter((_, index) => index === 0 || index === points.length - 1 || points.length < 10 || index % Math.ceil(points.length / 6) === 0).map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="4" className="chart-point"><title>{point.date}: {point.total} citas</title></circle>)}
      </svg>
      <div className="chart-axis"><span>{data[0]?.date}</span><span>{data.at(-1)?.date}</span></div>
      <AccessibleDataTable data={data} />
    </div>
  )
}

export function StatusChart({ data }: { data: DashboardAnalytics['status_breakdown'] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  if (!total) return <EmptyState title="Sin estados registrados" text="El resumen aparecerá cuando haya citas en el periodo." />
  const colors: Record<string, string> = { requested: '#d4a94a', confirmed: '#1b9b7d', completed: '#176779', cancelled: '#9aa9aa', no_show: '#bf6b5c' }
  let offset = 0
  const segments = data.filter((item) => item.count > 0).map((item) => {
    const percent = item.count / total
    const segment = { ...item, percent, offset }
    offset += percent
    return segment
  })
  return (
    <div className="status-chart-wrap">
      <div className="donut" role="img" aria-label={`Distribución de ${total} citas por estado`} style={{ background: `conic-gradient(${segments.map((item) => `${colors[item.status]} ${item.offset * 360}deg ${(item.offset + item.percent) * 360}deg`).join(', ')})` }}><span>{total}<small>citas</small></span></div>
      <ul className="chart-legend">{segments.map((item) => <li key={item.status}><i style={{ background: colors[item.status] }} /> <span>{item.status === 'no_show' ? 'No asistió' : item.status === 'requested' ? 'Solicitadas' : item.status === 'confirmed' ? 'Confirmadas' : item.status === 'completed' ? 'Completadas' : 'Canceladas'}</span><strong>{item.count}</strong></li>)}</ul>
    </div>
  )
}

export function ServiceChart({ data }: { data: DashboardAnalytics['service_breakdown'] }) {
  if (!data.length) return <EmptyState title="Sin servicios registrados" text="Los servicios aparecerán después de registrar citas." />
  const max = Math.max(...data.map((item) => item.count), 1)
  return <div className="service-chart">{data.slice(0, 5).map((item) => <div className="service-row" key={item.service_id}><div><span>{item.service_name}</span><strong>{item.count}</strong></div><div className="service-track"><i style={{ width: `${(item.count / max) * 100}%` }} /></div></div>)}</div>
}
