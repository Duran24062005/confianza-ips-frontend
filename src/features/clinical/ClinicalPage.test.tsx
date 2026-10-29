import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/models'
import { ClinicalPage } from './ClinicalPage'

const appointmentsMock = vi.hoisted(() => vi.fn())
const clinicalNotesMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({
  api: { appointments: appointmentsMock, clinicalNotes: clinicalNotesMock },
}))

const doctor: User = {
  id: 4,
  email: 'doctor@example.test',
  full_name: 'Médico Prueba',
  role: 'doctor',
  active: true,
  patient_id: null,
  doctor_id: 2,
}

describe('ClinicalPage', () => {
  it('loads the authorized appointments and patient notes', async () => {
    appointmentsMock.mockResolvedValue([{ id: 1, patient_id: 12, doctor_id: 2, service_id: 1, site_id: 1, starts_at: '2026-10-29T15:00:00Z', ends_at: '2026-10-29T15:30:00Z', status: 'completed', reason: 'Control', created_at: '2026-10-01T00:00:00Z' }])
    clinicalNotesMock.mockResolvedValue([{ id: 5, encounter_id: 1, version: 2, note_type: 'evolution', content: 'Evolución estable', created_at: '2026-10-29T16:00:00Z' }])

    render(<ClinicalPage user={doctor} onError={vi.fn()} />)

    expect(await screen.findByText('Evolución estable')).toBeInTheDocument()
    expect(clinicalNotesMock).toHaveBeenCalledWith(12)
    expect(screen.getByText('Versión 2')).toBeInTheDocument()
  })

  it('changes the selected patient and reloads only that history', async () => {
    appointmentsMock.mockResolvedValue([
      { id: 1, patient_id: 12, doctor_id: 2, service_id: 1, site_id: 1, starts_at: '2026-10-29T15:00:00Z', ends_at: '2026-10-29T15:30:00Z', status: 'completed', reason: '', created_at: '2026-10-01T00:00:00Z' },
      { id: 2, patient_id: 13, doctor_id: 2, service_id: 1, site_id: 1, starts_at: '2026-10-30T15:00:00Z', ends_at: '2026-10-30T15:30:00Z', status: 'completed', reason: '', created_at: '2026-10-01T00:00:00Z' },
    ])
    clinicalNotesMock.mockResolvedValue([])
    const user = userEvent.setup()
    render(<ClinicalPage user={{ ...doctor, patient_id: 12 }} onError={vi.fn()} />)

    const select = await screen.findByRole('combobox')
    await user.selectOptions(select, '13')
    await waitFor(() => expect(clinicalNotesMock).toHaveBeenLastCalledWith(13))
  })
})
