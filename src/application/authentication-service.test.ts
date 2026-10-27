import { describe, expect, it, vi } from 'vitest'
import { AuthenticationService } from './authentication-service'
import type { ConfianzaApi } from './ports'

class TestTokenStore {
  token: string | null = null

  get(): string | null {
    return this.token
  }

  set(value: string | null): void {
    this.token = value
  }
}

describe('AuthenticationService', () => {
  it('stores the access token only after a successful login flow', async () => {
    const tokenStore = new TestTokenStore()
    const api = {
      login: vi.fn().mockResolvedValue({ access_token: 'token', token_type: 'bearer', expires_in: 900 }),
      me: vi.fn().mockResolvedValue({ id: 1 }),
    } as unknown as ConfianzaApi
    const service = new AuthenticationService(api, tokenStore)

    await service.signIn('admin@confianza.demo', 'Confianza123!')

    expect(tokenStore.token).toBe('token')
    expect(api.login).toHaveBeenCalledWith('admin@confianza.demo', 'Confianza123!')
  })

  it('clears the token if loading the authenticated user fails', async () => {
    const tokenStore = new TestTokenStore()
    const api = {
      login: vi.fn().mockResolvedValue({ access_token: 'token', token_type: 'bearer', expires_in: 900 }),
      me: vi.fn().mockRejectedValue(new Error('Sesión inválida')),
    } as unknown as ConfianzaApi
    const service = new AuthenticationService(api, tokenStore)

    await expect(service.signIn('admin@confianza.demo', 'bad')).rejects.toThrow('Sesión inválida')

    expect(tokenStore.token).toBeNull()
  })

  it('stores the token and loads the patient created through registration', async () => {
    const tokenStore = new TestTokenStore()
    const api = {
      register: vi.fn().mockResolvedValue({ access_token: 'registered-token', token_type: 'bearer', expires_in: 900 }),
      me: vi.fn().mockResolvedValue({ id: 4, role: 'patient' }),
    } as unknown as ConfianzaApi
    const service = new AuthenticationService(api, tokenStore)
    const payload = { document_type: 'CC', document_number: '900', first_name: 'Ana', last_name: 'Prueba', birth_date: '1990-01-01', email: 'ana@nueva.demo', phone: '3000000', address: 'Calle 1', city: 'Bogotá', eps: 'EPS Test', emergency_name: 'Contacto', emergency_phone: '3000001', password: 'Password123!' }

    await expect(service.register(payload)).resolves.toMatchObject({ role: 'patient' })

    expect(api.register).toHaveBeenCalledWith(payload)
    expect(tokenStore.token).toBe('registered-token')
  })
})
