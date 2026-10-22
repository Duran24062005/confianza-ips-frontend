import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState, MetricCard, StatusBadge, roleLabel, statusTone } from './index'

describe('shared UI primitives', () => {
  it('maps roles and appointment states to Spanish labels and semantic tones', () => {
    expect(roleLabel('doctor')).toBe('Equipo médico')
    expect(roleLabel('unknown')).toBe('unknown')
    expect(statusTone('completed')).toBe('success')
    expect(statusTone('requested')).toBe('warning')
    expect(statusTone('no_show')).toBe('danger')
  })

  it('renders metric and status content with accessible semantics', () => {
    render(<><MetricCard label="Asistencia" value="82.4%" note="Periodo actual" tone="teal" /><StatusBadge label="Confirmada" tone="success" /></>)
    expect(screen.getByText('82.4%')).toBeInTheDocument()
    expect(screen.getByText('Confirmada')).toHaveClass('status-badge', 'success')
  })

  it('exposes retry as an action for recoverable errors', async () => {
    const retry = vi.fn()
    const { getByRole } = render(<ErrorState message="Servicio no disponible" onRetry={retry} />)
    getByRole('button', { name: /intentar de nuevo/i }).click()
    expect(retry).toHaveBeenCalledOnce()
  })
})
