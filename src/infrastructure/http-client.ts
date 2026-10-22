import type { AccessTokenStore } from '../application/ports'

type ErrorPayload = {
  code?: string
  detail?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class MemoryAccessTokenStore implements AccessTokenStore {
  private token: string | null = null

  get(): string | null {
    return this.token
  }

  set(token: string | null): void {
    this.token = token
  }
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenStore: AccessTokenStore,
  ) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')

    const token = this.tokenStore.get()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers })
    if (!response.ok) {
      const body = await response.json().catch(() => null) as ErrorPayload | null
      throw new ApiError(
        body?.detail || `La operación falló (${response.status})`,
        response.status,
        body?.code,
      )
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }
}
