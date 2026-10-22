import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/models'
import { OverviewPage } from './OverviewPage'

const analytics = {
  scope: 'global' as const,
  period: { days: 30, start: '2026-09-23T05:00:00Z', end: '2026-10-23T05:00:00Z', timezone: 'America/Bogota' as const },
  summary: { active_patients: 12, active_doctors: 4, appointments_today: 2, upcoming_appointments: 5, pending_appointments: 1, confirmed_appointments: 3, completed_appointments: 10, cancelled_appointments: 1, no_show_appointments: 1, attendance_rate: 90.9 },
  trend: [{ date: '2026-10-22', total: 3, requested: 1, confirmed: 1, completed: 1, cancelled: 0, no_show: 0 }],
  status_breakdown: [{ status: 'confirmed' as const, count: 3 }],
  service_breakdown: [{ service_id: 1, service_name: 'Consulta general', count: 3 }],
}

const analyticsMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({ api: { analytics: analyticsMock } }))

const admin: User = { id: 1, email: 'admin@demo.test', full_name: 'Admin Demo', role: 'admin', active: true, patient_id: null, doctor_id: null }

describe('OverviewPage', () => {
  it('renders persisted metrics and reloads when changing period', async () => {
    analyticsMock.mockResolvedValue(analytics)
    const user = userEvent.setup()
    render(<OverviewPage user={admin} />)

    expect(await screen.findByText('Pacientes activos')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '7 días' }))

    await waitFor(() => expect(analyticsMock).toHaveBeenCalledWith(7))
    expect(screen.getByRole('img', { name: /evolución de citas/i })).toBeInTheDocument()
  })

  it('offers a retry action after an analytics failure', async () => {
    analyticsMock.mockRejectedValueOnce(new Error('API no disponible')).mockResolvedValueOnce(analytics)
    render(<OverviewPage user={admin} />)

    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: /intentar de nuevo/i }))
    expect(await screen.findByText('Pacientes activos')).toBeInTheDocument()
  })
})
