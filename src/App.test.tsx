import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Confianza access screen', () => {
  it('shows the institutional login and demo access options', () => {
    render(<App />)
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Administración' })).toBeInTheDocument()
    expect(screen.getByText('Entorno ficticio para demostración. No contiene información médica real.')).toBeInTheDocument()
  })
})
