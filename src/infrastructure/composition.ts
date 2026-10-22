import { AuthenticationService } from '../application/authentication-service'
import { createConfianzaApi } from './confianza-api'
import { MemoryAccessTokenStore } from './http-client'

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const accessTokenStore = new MemoryAccessTokenStore()
export const api = createConfianzaApi(apiBase, accessTokenStore)
export const authenticationService = new AuthenticationService(api, accessTokenStore)
