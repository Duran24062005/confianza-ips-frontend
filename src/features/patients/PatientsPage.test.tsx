import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PatientsPage } from './PatientsPage'

const patientsMock = vi.hoisted(() => vi.fn())
const createPatientMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({
  api: { patients: patientsMock, createPatient: createPatientMock },
}))

const patient = {
  id: 7,
  document_type: 'CC',
  document_number: '123456789',
  first_name: 'Ana',
  last_name: 'Prueba',
  birth_date: '1990-01-01',
  email: 'ana@example.test',
  phone: '3000000',
  address: 'Calle 1',
  city: 'Bogotá',
  eps: 'EPS Test',
  emergency_name: 'Contacto',
  emergency_phone: '3000001',
  active: true,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
}

describe('PatientsPage', () => {
  it('loads patients, searches through the API and opens the registration form', async () => {
    patientsMock.mockResolvedValue([patient])
    const user = userEvent.setup()
    render(<PatientsPage onError={vi.fn()} />)

    expect(await screen.findByText('Ana Prueba')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Buscar pacientes' }), 'Ana')

    await waitFor(() => expect(patientsMock).toHaveBeenLastCalledWith('Ana'))
    await user.click(screen.getByRole('button', { name: /nuevo paciente/i }))
    expect(screen.getByRole('dialog', { name: 'Registrar paciente' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombres')).toHaveValue('')
  })

  it('creates a patient, resets the form and reloads the active list', async () => {
    patientsMock.mockResolvedValue([patient])
    createPatientMock.mockResolvedValue(patient)
    const user = userEvent.setup()
    render(<PatientsPage onError={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: /nuevo paciente/i }))
    await user.type(screen.getByLabelText('Número de documento'), '123456789')
    await user.type(screen.getByLabelText('Nombres'), 'Ana')
    await user.type(screen.getByLabelText('Apellidos'), 'Prueba')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test')
    await user.type(screen.getByLabelText('Teléfono'), '3000000')
    await user.type(screen.getByLabelText('Dirección'), 'Calle 1')
    await user.type(screen.getByLabelText('Contacto de emergencia'), 'Contacto')
    await user.type(screen.getByLabelText('Teléfono de emergencia'), '3000001')
    await user.click(screen.getByRole('button', { name: 'Guardar paciente' }))

    await waitFor(() => expect(createPatientMock).toHaveBeenCalledWith(expect.objectContaining({
      document_number: '123456789',
      first_name: 'Ana',
      email: 'ana@example.test',
    })))
    expect(await screen.findByText('Ana Prueba')).toBeInTheDocument()
  })

  it('surfaces a load error and lets the operator retry', async () => {
    patientsMock.mockRejectedValueOnce(new Error('Servicio no disponible')).mockResolvedValueOnce([patient])
    const user = userEvent.setup()
    render(<PatientsPage onError={vi.fn()} />)

    expect(await screen.findByText('Servicio no disponible')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /intentar de nuevo/i }))
    expect(await screen.findByText('Ana Prueba')).toBeInTheDocument()
  })
})
