import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuditPage } from './AuditPage'

const auditMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({ api: { audit: auditMock } }))

describe('AuditPage', () => {
  it('renders persisted audit events and supports retry after a failure', async () => {
    auditMock
      .mockRejectedValueOnce(new Error('Auditoría no disponible'))
      .mockResolvedValueOnce([{ id: 1, action: 'update_patient', resource_type: 'patient', resource_id: '7', created_at: '2026-10-29T15:00:00Z', actor_user_id: 2 }])
    const user = userEvent.setup()
    render(<AuditPage />)

    expect(await screen.findByText('Auditoría no disponible')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /intentar de nuevo/i }))
    expect(await screen.findByText('update patient')).toBeInTheDocument()
    expect(screen.getByText('patient · #7')).toBeInTheDocument()
    expect(auditMock).toHaveBeenCalledTimes(2)
  })

  it('shows an explicit empty state when there are no audit events', async () => {
    auditMock.mockResolvedValue([])
    render(<AuditPage />)

    expect(await screen.findByText('Sin eventos todavía')).toBeInTheDocument()
    expect(screen.getByText('Las operaciones relevantes aparecerán aquí.')).toBeInTheDocument()
  })
})
