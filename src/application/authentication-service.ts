import type { AccessTokenStore, ConfianzaApi } from './ports'
import type { User } from '../domain/models'

export class AuthenticationService {
  constructor(
    private readonly api: ConfianzaApi,
    private readonly tokenStore: AccessTokenStore,
  ) {}

  async signIn(email: string, password: string): Promise<User> {
    const session = await this.api.login(email, password)
    this.tokenStore.set(session.access_token)

    try {
      return await this.api.me()
    } catch (error) {
      this.tokenStore.set(null)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.api.logout()
    } finally {
      this.tokenStore.set(null)
    }
  }
}
