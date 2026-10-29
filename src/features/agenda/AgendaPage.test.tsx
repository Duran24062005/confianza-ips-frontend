import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/models'
import { AgendaPage } from './AgendaPage'

const appointmentsMock = vi.hoisted(() => vi.fn())
const patientsMock = vi.hoisted(() => vi.fn())
const doctorsMock = vi.hoisted(() => vi.fn())
const servicesMock = vi.hoisted(() => vi.fn())
const sitesMock = vi.hoisted(() => vi.fn())
const availabilityMock = vi.hoisted(() => vi.fn())
const createAppointmentMock = vi.hoisted(() => vi.fn())
const updateAppointmentStatusMock = vi.hoisted(() => vi.fn())
const rescheduleAppointmentMock = vi.hoisted(() => vi.fn())

vi.mock('../../infrastructure/composition', () => ({
  api: {
    appointments: appointmentsMock,
    patients: patientsMock,
    doctors: doctorsMock,
    services: servicesMock,
    sites: sitesMock,
    availability: availabilityMock,
    createAppointment: createAppointmentMock,
    updateAppointmentStatus: updateAppointmentStatusMock,
    rescheduleAppointment: rescheduleAppointmentMock,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  appointmentsMock.mockResolvedValue([])
  patientsMock.mockResolvedValue([])
  doctorsMock.mockResolvedValue([])
  servicesMock.mockResolvedValue([])
  sitesMock.mockResolvedValue([])
  availabilityMock.mockResolvedValue([])
  createAppointmentMock.mockResolvedValue({})
  rescheduleAppointmentMock.mockResolvedValue({})
  updateAppointmentStatusMock.mockResolvedValue({})
})

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

  it('creates a patient appointment from a real available slot', async () => {
    const user = userEvent.setup()
    const admin: User = { id: 1, email: 'admin@demo.test', full_name: 'Administración', role: 'admin', active: true, patient_id: null, doctor_id: null }
    appointmentsMock.mockResolvedValue([])
    patientsMock.mockResolvedValue([{ id: 4, first_name: 'Mariana', last_name: 'Rojas' }])
    doctorsMock.mockResolvedValue([{ id: 7, first_name: 'Laura', last_name: 'Gómez' }])
    servicesMock.mockResolvedValue([{ id: 3, name: 'Consulta general', duration_minutes: 30 }])
    sitesMock.mockResolvedValue([{ id: 1, name: 'Sede Central', city: 'Bogotá' }])
    availabilityMock.mockResolvedValue([{ starts_at: '2026-11-02T13:00:00Z', ends_at: '2026-11-02T13:30:00Z', doctor_id: 7, service_id: 3 }])

    render(<AgendaPage user={admin} onError={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: '+ Nueva cita' }))
    await user.selectOptions(screen.getByLabelText('Paciente'), '4')
    await user.selectOptions(screen.getByLabelText('Profesional'), '7')
    await user.selectOptions(screen.getByLabelText('Servicio'), '3')
    await user.selectOptions(screen.getByLabelText('Sede'), '1')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-11-02' } })
    await user.selectOptions(await screen.findByLabelText('Horario disponible'), '2026-11-02T13:00:00Z')
    await user.click(screen.getByRole('button', { name: 'Registrar cita' }))

    expect(createAppointmentMock).toHaveBeenCalledWith(expect.objectContaining({ patient_id: 4, doctor_id: 7, service_id: 3, site_id: 1, starts_at: '2026-11-02T13:00:00Z' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('reprograms an active appointment through a validated slot', async () => {
    const user = userEvent.setup()
    const admin: User = { id: 1, email: 'admin@demo.test', full_name: 'Administración', role: 'admin', active: true, patient_id: null, doctor_id: null }
    appointmentsMock.mockResolvedValue([{ id: 21, patient_id: 4, doctor_id: 7, service_id: 3, site_id: 1, starts_at: '2026-10-26T15:00:00Z', ends_at: '2026-10-26T15:30:00Z', status: 'confirmed', reason: 'Control', created_at: '2026-10-22T12:00:00Z' }])
    patientsMock.mockResolvedValue([{ id: 4, first_name: 'Mariana', last_name: 'Rojas' }])
    doctorsMock.mockResolvedValue([])
    servicesMock.mockResolvedValue([])
    sitesMock.mockResolvedValue([])
    availabilityMock.mockResolvedValue([{ starts_at: '2026-11-03T13:00:00Z', ends_at: '2026-11-03T13:30:00Z', doctor_id: 7, service_id: 3 }])

    render(<AgendaPage user={admin} onError={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: 'Reprogramar' }))
    fireEvent.change(screen.getByLabelText('Nuevo día'), { target: { value: '2026-11-03' } })
    await user.selectOptions(await screen.findByLabelText('Nuevo horario'), '2026-11-03T13:00:00Z')
    await user.click(screen.getByRole('button', { name: 'Guardar cambio' }))

    expect(rescheduleAppointmentMock).toHaveBeenCalledWith(21, { starts_at: '2026-11-03T13:00:00Z', reason: '' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cancels an active appointment with an explicit confirmation step', async () => {
    const user = userEvent.setup()
    const admin: User = { id: 1, email: 'admin@demo.test', full_name: 'Administración', role: 'admin', active: true, patient_id: null, doctor_id: null }
    appointmentsMock.mockResolvedValue([{ id: 21, patient_id: 4, doctor_id: 7, service_id: 3, site_id: 1, starts_at: '2026-10-26T15:00:00Z', ends_at: '2026-10-26T15:30:00Z', status: 'confirmed', reason: 'Control', created_at: '2026-10-22T12:00:00Z' }])
    patientsMock.mockResolvedValue([{ id: 4, first_name: 'Mariana', last_name: 'Rojas' }])

    render(<AgendaPage user={admin} onError={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(updateAppointmentStatusMock).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))

    expect(updateAppointmentStatusMock).toHaveBeenCalledWith(21, 'cancelled')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
