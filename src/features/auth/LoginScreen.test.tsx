import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginScreen } from './LoginScreen'

describe('LoginScreen', () => {
  it('submits the selected demo role credentials', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BrowserRouter><LoginScreen onSubmit={onSubmit} busy={false} error="" /></BrowserRouter>)

    await user.click(screen.getByRole('button', { name: 'Médico' }))
    await user.click(screen.getByRole('button', { name: /entrar al sistema/i }))

    expect(onSubmit).toHaveBeenCalledWith('laura.medica@confianza.demo', 'Confianza123!')
  })

  it('shows backend errors and disables submit while authenticating', () => {
    render(<BrowserRouter><LoginScreen onSubmit={vi.fn()} busy error="Credenciales inválidas" /></BrowserRouter>)
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')
    expect(screen.getByRole('button', { name: /validando/i })).toBeDisabled()
  })
})
