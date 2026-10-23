import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AgentActivationCard } from './AgentActivationCard'

const issueAgentActivationCodeMock = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/composition', () => ({ api: { issueAgentActivationCode: issueAgentActivationCodeMock } }))

describe('AgentActivationCard', () => {
  it('generates and copies a one-time activation code', async () => {
    issueAgentActivationCodeMock.mockResolvedValue({ code: '123456', expires_at: new Date(Date.now() + 300_000).toISOString(), expires_in: 300, single_use: true })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<AgentActivationCard />)

    fireEvent.click(screen.getByRole('button', { name: 'Generar clave' }))
    expect(await screen.findByText('123456')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Copiar clave/ }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('123456'))
    expect(screen.getByRole('button', { name: /Clave copiada/ })).toBeInTheDocument()
  })

  it('shows a retryable error when activation is unavailable', async () => {
    issueAgentActivationCodeMock.mockRejectedValue(new Error('Integración del agente no configurada'))
    render(<AgentActivationCard />)

    fireEvent.click(screen.getByRole('button', { name: 'Generar clave' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Integración del agente no configurada')
  })
})
