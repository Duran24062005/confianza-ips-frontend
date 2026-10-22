import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/models'
import { AppShell } from './AppShell'

const admin: User = { id: 1, email: 'admin@demo.test', full_name: 'Admin Demo', role: 'admin', active: true, patient_id: null, doctor_id: null }
const patient: User = { id: 2, email: 'patient@demo.test', full_name: 'Paciente Demo', role: 'patient', active: true, patient_id: 4, doctor_id: null }

describe('AppShell', () => {
  it('shows administrative navigation and marks the active section', () => {
    render(<MemoryRouter initialEntries={['/app/auditoria']}><AppShell user={admin} onSignOut={vi.fn()} error="" onClearError={vi.fn()}><h1>Contenido</h1></AppShell></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Auditoría' })).toHaveClass('active')
    expect(screen.getByRole('link', { name: /Admin Demo/ })).toHaveAttribute('href', '/app/perfil')
  })

  it('limits patient navigation to the allowed workspace', () => {
    render(<MemoryRouter initialEntries={['/app/resumen']}><AppShell user={patient} onSignOut={vi.fn()} error="" onClearError={vi.fn()}><h1>Contenido</h1></AppShell></MemoryRouter>)
    expect(screen.queryByRole('link', { name: 'Pacientes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Auditoría' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Agenda' }).length).toBeGreaterThan(0)
  })
})
