import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '../../domain/models'
import { ProfilePage } from './ProfilePage'

const myPatientMock = vi.hoisted(() => vi.fn())
const updateMeMock = vi.hoisted(() => vi.fn())
const updateMyPatientMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({ api: { myPatient: myPatientMock, updateMe: updateMeMock, updateMyPatient: updateMyPatientMock } }))

const patientUser: User = { id: 2, email: 'patient@demo.test', full_name: 'Ana Demo', role: 'patient', active: true, patient_id: 4, doctor_id: null }
const patient = { id: 4, document_type: 'CC', document_number: '123', first_name: 'Ana', last_name: 'Demo', birth_date: '1990-01-01', email: 'ana@demo.test', phone: '3000000', address: 'Calle 1', city: 'Bogotá', eps: 'EPS Demo', emergency_name: 'Contacto', emergency_phone: '3000001', active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' }

describe('ProfilePage', () => {
  it('loads editable patient data, saves both profile contracts and signs out', async () => {
    myPatientMock.mockResolvedValue(patient)
    updateMeMock.mockResolvedValue({ ...patientUser, full_name: 'Ana Actualizada' })
    updateMyPatientMock.mockResolvedValue(patient)
    const onUpdated = vi.fn()
    const onSignOut = vi.fn()
    const user = userEvent.setup()
    render(<ProfilePage user={patientUser} onUpdated={onUpdated} onError={vi.fn()} onSignOut={onSignOut} />)

    const nameInput = await screen.findByDisplayValue('Ana Demo')
    await user.clear(nameInput)
    await user.type(nameInput, 'Ana Actualizada')
    const firstNameInput = screen.getByDisplayValue('Ana')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Ana María')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(updateMeMock).toHaveBeenCalledWith({ full_name: 'Ana Actualizada' }))
    expect(updateMyPatientMock).toHaveBeenCalledWith(expect.objectContaining({ first_name: 'Ana María' }))
    expect(onUpdated).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
