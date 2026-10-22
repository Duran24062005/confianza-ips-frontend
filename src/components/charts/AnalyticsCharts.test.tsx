import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ServiceChart, StatusChart, TrendChart } from './AnalyticsCharts'

describe('analytics charts', () => {
  it('exposes an accessible table for the SVG trend', () => {
    render(<TrendChart data={[{ date: '2026-10-22', total: 3, requested: 1, confirmed: 1, completed: 1, cancelled: 0, no_show: 0 }]} />)
    expect(screen.getByRole('img', { name: /evolución de citas/i })).toBeInTheDocument()
    expect(screen.getByText('Ver datos de la gráfica')).toBeInTheDocument()
    expect(screen.getAllByText('2026-10-22').length).toBeGreaterThan(0)
  })

  it('shows a useful empty state instead of invented chart values', () => {
    render(<TrendChart data={[{ date: '2026-10-22', total: 0, requested: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 }]} />)
    expect(screen.getByText('Sin actividad en el periodo')).toBeInTheDocument()
  })

  it('renders status totals and service demand from the API response', () => {
    render(<><StatusChart data={[{ status: 'confirmed', count: 4 }, { status: 'no_show', count: 1 }]} /><ServiceChart data={[{ service_id: 1, service_name: 'Consulta general', count: 4 }]} /></>)
    expect(screen.getByRole('img', { name: /distribución de 5 citas/i })).toBeInTheDocument()
    expect(screen.getByText('Confirmadas')).toBeInTheDocument()
    expect(screen.getByText('Consulta general')).toBeInTheDocument()
  })

  it('uses empty states for status and service data without records', () => {
    render(<><StatusChart data={[]} /><ServiceChart data={[]} /></>)
    expect(screen.getByText('Sin estados registrados')).toBeInTheDocument()
    expect(screen.getByText('Sin servicios registrados')).toBeInTheDocument()
  })
})
