// Compatibilidad para consumidores existentes: el contrato vive en domain y la implementación en infrastructure.
export type {
  Appointment,
  AppointmentStatus,
  AuditEvent,
  ClinicalNote,
  Dashboard,
  DashboardAnalytics,
  Doctor,
  LoginResponse,
  Patient,
  Role,
  Service,
  Site,
  User,
  WayloCode,
} from './domain/models'
export type { CreateAppointmentInput, CreatePatientInput, ConfianzaApi } from './application/ports'
import { accessTokenStore, api, authenticationService } from './infrastructure/composition'

export { accessTokenStore, api, authenticationService }
export const setAccessToken = (token: string | null): void => accessTokenStore.set(token)
