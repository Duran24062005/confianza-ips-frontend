import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginScreen } from './LoginScreen'

describe('LoginScreen', () => {
  it('submits the selected demo role credentials', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BrowserRouter><LoginScreen onSubmit={onSubmit} onRegister={vi.fn()} busy={false} error="" /></BrowserRouter>)

    await user.click(screen.getByRole('button', { name: 'Médico' }))
    await user.click(screen.getByRole('button', { name: /entrar al sistema/i }))

    expect(onSubmit).toHaveBeenCalledWith('laura.medica@confianza.demo', 'Confianza123!')
  })

  it('shows backend errors and disables submit while authenticating', () => {
    render(<BrowserRouter><LoginScreen onSubmit={vi.fn()} onRegister={vi.fn()} busy error="Credenciales inválidas" /></BrowserRouter>)
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')
    expect(screen.getByRole('button', { name: /validando/i })).toBeDisabled()
  })

  it('opens a patient-only registration form and validates password confirmation', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()
    render(<BrowserRouter><LoginScreen onSubmit={vi.fn()} onRegister={onRegister} busy={false} error="" /></BrowserRouter>)

    await user.click(screen.getByRole('button', { name: /crea tu cuenta/i }))
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument()
    expect(screen.getByLabelText('Número de documento')).toBeRequired()
    expect(screen.getByLabelText('EPS')).toBeRequired()

    await user.type(screen.getByLabelText('Contraseña'), 'Password123!')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'OtraClave123!')
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta de paciente/i }).closest('form')!)

    expect(await screen.findByRole('alert')).toHaveTextContent('Las contraseñas no coinciden')
    expect(onRegister).not.toHaveBeenCalled()
  })
})
