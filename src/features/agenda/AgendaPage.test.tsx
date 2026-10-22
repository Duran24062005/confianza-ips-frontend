import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/models'
import { AgendaPage } from './AgendaPage'

const appointmentsMock = vi.hoisted(() => vi.fn())
const patientsMock = vi.hoisted(() => vi.fn())
const doctorsMock = vi.hoisted(() => vi.fn())
const servicesMock = vi.hoisted(() => vi.fn())
const sitesMock = vi.hoisted(() => vi.fn())
const updateAppointmentStatusMock = vi.hoisted(() => vi.fn())

vi.mock('../../infrastructure/composition', () => ({
  api: {
    appointments: appointmentsMock,
    patients: patientsMock,
    doctors: doctorsMock,
    services: servicesMock,
    sites: sitesMock,
    updateAppointmentStatus: updateAppointmentStatusMock,
  },
}))

const doctor: User = {
  id: 3,
  email: 'doctor@demo.test',
  full_name: 'Dra. Laura Gómez',
  role: 'doctor',
  active: true,
  patient_id: null,
  doctor_id: 7,
}

describe('AgendaPage', () => {
  it('loads doctor-scoped patients and exposes only the allowed status action', async () => {
    appointmentsMock.mockResolvedValue([{
      id: 21,
      patient_id: 4,
      doctor_id: 7,
      service_id: 1,
      site_id: 1,
      starts_at: '2026-10-26T15:00:00Z',
      ends_at: '2026-10-26T15:30:00Z',
      status: 'confirmed',
      reason: 'Control',
      created_at: '2026-10-22T12:00:00Z',
    }])
    patientsMock.mockResolvedValue([{
      id: 4,
      document_type: 'CC',
      document_number: '123',
      first_name: 'Mariana',
      last_name: 'Rojas',
      birth_date: '1995-04-12',
      email: 'mariana@demo.test',
      phone: '3100000000',
      address: 'Calle 1',
      city: 'Bogotá',
      eps: 'EPS Demo',
      emergency_name: 'Contacto',
      emergency_phone: '3200000000',
      active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }])
    doctorsMock.mockResolvedValue([])
    servicesMock.mockResolvedValue([])
    sitesMock.mockResolvedValue([])

    render(<AgendaPage user={doctor} onError={vi.fn()} />)

    expect(await screen.findByText('Mariana Rojas')).toBeInTheDocument()
    expect(patientsMock).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Completar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
