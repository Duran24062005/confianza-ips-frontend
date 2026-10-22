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
})
