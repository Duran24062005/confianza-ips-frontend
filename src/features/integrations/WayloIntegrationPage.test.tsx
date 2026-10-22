import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WayloIntegrationPage } from './WayloIntegrationPage'

const wayloCodeMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({ api: { wayloCode: wayloCodeMock } }))

describe('WayloIntegrationPage', () => {
  it('loads, displays and copies the temporary code', async () => {
    wayloCodeMock.mockResolvedValue({ code: '123456', expires_at: new Date(Date.now() + 60_000).toISOString(), interval_seconds: 60 })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<WayloIntegrationPage />)

    expect(await screen.findByText('123456')).toBeInTheDocument()
    expect(screen.getByText(/Vence en/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Copiar código/ }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('123456'))
    expect(screen.getByRole('button', { name: /Código copiado/ })).toBeInTheDocument()
  })

  it('shows a retryable error when the backend rejects the configuration', async () => {
    wayloCodeMock.mockRejectedValue(new Error('Integración Waylo no configurada'))

    render(<WayloIntegrationPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Integración Waylo no configurada')
    expect(screen.getByRole('button', { name: 'Intentar de nuevo ↗' })).toBeInTheDocument()
  })
})
