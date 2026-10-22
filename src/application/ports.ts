import type {
  Appointment,
  AuditEvent,
  ClinicalNote,
  Dashboard,
  Doctor,
  LoginResponse,
  Patient,
  Service,
  Site,
  User,
} from '../domain/models'

export type CreatePatientInput = Omit<Patient, 'id' | 'active' | 'created_at' | 'updated_at'>

export type CreateAppointmentInput = {
  patient_id: number | null
  doctor_id: number
  service_id: number
  site_id: number
  starts_at: string
  reason: string
}

export interface AccessTokenStore {
  get(): string | null
  set(token: string | null): void
}

export interface ConfianzaApi {
  login(email: string, password: string): Promise<LoginResponse>
  me(): Promise<User>
  logout(): Promise<{ message: string }>
  dashboard(): Promise<Dashboard>
  patients(search?: string): Promise<Patient[]>
  createPatient(payload: CreatePatientInput): Promise<Patient>
  doctors(): Promise<Doctor[]>
  services(): Promise<Service[]>
  sites(): Promise<Site[]>
  appointments(): Promise<Appointment[]>
  createAppointment(payload: CreateAppointmentInput): Promise<Appointment>
  updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment>
  audit(): Promise<AuditEvent[]>
  clinicalNotes(patientId: number): Promise<ClinicalNote[]>
}
