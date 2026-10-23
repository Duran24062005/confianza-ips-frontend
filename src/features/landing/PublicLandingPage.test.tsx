import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PublicLandingPage } from './PublicLandingPage'

describe('PublicLandingPage', () => {
  it('presents the platform and both access paths', () => {
    render(<MemoryRouter><PublicLandingPage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'La salud organizada para cuidar mejor.' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /iniciar sesión/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /crear cuenta/i }).length).toBeGreaterThan(0)
    expect(screen.getByText('Información ficticia, sin datos médicos reales')).toBeInTheDocument()
  })
})
